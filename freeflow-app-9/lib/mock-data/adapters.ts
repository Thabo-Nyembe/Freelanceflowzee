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

// Type for empty stats objects
type EmptyStats = Record<string, never>

// Empty arrays for backward compatibility - components should fetch real data

// Analytics
export const analyticsMetrics: unknown[] = []
export const analyticsFunnels: unknown[] = []
export const analyticsCohorts: unknown[] = []
export const analyticsReports: unknown[] = []
export const analyticsDashboards: unknown[] = []
export const analyticsAIInsights: unknown[] = []
export const analyticsCollaborators: unknown[] = []
export const analyticsPredictions: unknown[] = []
export const analyticsActivities: unknown[] = []
export const analyticsQuickActions: unknown[] = []
export const analyticsRealtimeMetrics: EmptyStats = {}

// CRM/Customers
export const crmCustomers: unknown[] = []
export const crmDeals: unknown[] = []
export const crmLeads: unknown[] = []
export const crmActivities: unknown[] = []
export const crmQuickActions: unknown[] = []
export const crmStats: EmptyStats = {}
export const crmAIInsights: unknown[] = []
export const crmPipelineStages: unknown[] = []
export const crmCollaborators: unknown[] = []
export const crmPredictions: unknown[] = []
export const crmAutomations: unknown[] = []
export const crmCompanies: unknown[] = []
export const crmContacts: unknown[] = []
export const crmReports: unknown[] = []

// Projects
export const projectsProjects: unknown[] = []
export const projectsTasks: unknown[] = []
export const projectsMilestones: unknown[] = []
export const projectsStats: EmptyStats = {}
export const projectsAIInsights: unknown[] = []
export const projectsQuickActions: unknown[] = []
export const projectsKanbanColumns: unknown[] = []

// Projects Hub
export const projectsHubProjects: unknown[] = []
export const projectsHubSprints: unknown[] = []
export const projectsHubBacklog: unknown[] = []
export const projectsHubRoadmap: unknown[] = []
export const projectsHubAutomations: unknown[] = []
export const projectsHubTemplates: unknown[] = []
export const projectsHubIssues: unknown[] = []
export const projectsHubEpics: unknown[] = []
export const projectsHubReports: unknown[] = []
export const projectsHubIntegrations: unknown[] = []
export const projectsHubAIInsights: unknown[] = []
export const projectsHubCollaborators: unknown[] = []
export const projectsHubPredictions: unknown[] = []
export const projectsHubActivities: unknown[] = []
export const projectsHubQuickActions: unknown[] = []
export const projectsStatusColumns: unknown[] = []

// Financials
export const financialsTransactions: unknown[] = []
export const financialsInvoices: unknown[] = []
export const financialsExpenses: unknown[] = []
export const financialsStats: EmptyStats = {}
export const financialsAIInsights: unknown[] = []
export const financialsQuickActions: unknown[] = []
export const financialsKPIs: unknown[] = []

// Financial (alternate naming)
export const financialTransactions: unknown[] = []
export const financialAccounts: unknown[] = []
export const financialActivities: unknown[] = []
export const financialAIInsights: unknown[] = []
export const financialBankAccounts: unknown[] = []
export const financialBudgetItems: unknown[] = []
export const financialCashFlow: unknown[] = []
export const financialCollaborators: unknown[] = []
export const financialPredictions: unknown[] = []
export const financialProfitLoss: unknown[] = []
export const financialQuickActions: unknown[] = []

// Team
export const teamMembers: unknown[] = []
export const teamStats: EmptyStats = {}
export const teamAIInsights: unknown[] = []
export const teamQuickActions: unknown[] = []

// Team Hub
export const teamHubActivities: unknown[] = []
export const teamHubAIInsights: unknown[] = []
export const teamHubPredictions: unknown[] = []
export const teamHubQuickActions: unknown[] = []

// Team Management
export const teamManagementActivities: unknown[] = []
export const teamManagementAIInsights: unknown[] = []
export const teamManagementCollaborators: unknown[] = []
export const teamManagementPredictions: unknown[] = []
export const teamManagementQuickActions: unknown[] = []

// Products
export const productsItems: unknown[] = []
export const productsOrders: unknown[] = []
export const productsStats: EmptyStats = {}

// Communications
export const communicationsMessages: unknown[] = []
export const communicationsConversations: unknown[] = []
export const communicationsEmails: unknown[] = []
export const communicationsEvents: unknown[] = []
export const communicationsStats: EmptyStats = {}

// Integrations
export const integrationsAll: unknown[] = []
export const integrationsWebhooks: unknown[] = []
export const integrationsApiKeys: unknown[] = []
export const integrationsStats: EmptyStats = {}

// Dashboard overview
export const overviewMetrics: unknown[] = []
export const overviewProjects: unknown[] = []
export const overviewActivities: unknown[] = []
export const overviewAIInsights: unknown[] = []
export const overviewQuickActions: unknown[] = []

// Growth hub
export const growthMetrics: unknown[] = []
export const growthRecommendations: unknown[] = []
export const growthGoals: unknown[] = []

// Performance
export const performanceMetrics: unknown[] = []
export const performanceBenchmarks: unknown[] = []
export const performanceAlerts: unknown[] = []

// Monitoring
export const monitoringStatus: EmptyStats = {}
export const monitoringAlerts: unknown[] = []
export const monitoringLogs: unknown[] = []

// Calendar
export const calendarActivities: unknown[] = []
export const calendarAIInsights: unknown[] = []
export const calendarCollaborators: unknown[] = []
export const calendarPredictions: unknown[] = []
export const calendarQuickActions: unknown[] = []

// Community
export const communityActivities: unknown[] = []
export const communityAIInsights: unknown[] = []
export const communityCollaborators: unknown[] = []
export const communityPredictions: unknown[] = []
export const communityQuickActions: unknown[] = []

// Chat
export const chatActivities: unknown[] = []
export const chatAIInsights: unknown[] = []
export const chatCollaborators: unknown[] = []
export const chatPredictions: unknown[] = []
export const chatQuickActions: unknown[] = []

// Messages
export const messagesActivities: unknown[] = []
export const messagesAIInsights: unknown[] = []
export const messagesCollaborators: unknown[] = []
export const messagesPredictions: unknown[] = []
export const messagesQuickActions: unknown[] = []

// Messaging
export const messagingActivities: unknown[] = []
export const messagingAIInsights: unknown[] = []
export const messagingCollaborators: unknown[] = []
export const messagingPredictions: unknown[] = []
export const messagingQuickActions: unknown[] = []

// Announcements
export const announcementsActivities: unknown[] = []
export const announcementsAIInsights: unknown[] = []
export const announcementsCollaborators: unknown[] = []
export const announcementsPredictions: unknown[] = []
export const announcementsQuickActions: unknown[] = []

// Broadcasts
export const broadcastsActivities: unknown[] = []
export const broadcastsAIInsights: unknown[] = []
export const broadcastsCollaborators: unknown[] = []
export const broadcastsPredictions: unknown[] = []
export const broadcastsQuickActions: unknown[] = []

// Training
export const trainingActivities: unknown[] = []
export const trainingAIInsights: unknown[] = []
export const trainingCollaborators: unknown[] = []
export const trainingPredictions: unknown[] = []
export const trainingQuickActions: unknown[] = []

// Employees
export const employeesActivities: unknown[] = []
export const employeesAIInsights: unknown[] = []
export const employeesCollaborators: unknown[] = []
export const employeesPredictions: unknown[] = []
export const employeesQuickActions: unknown[] = []

// Payroll
export const payrollActivities: unknown[] = []
export const payrollAIInsights: unknown[] = []
export const payrollCollaborators: unknown[] = []
export const payrollPredictions: unknown[] = []
export const payrollQuickActions: unknown[] = []

// Logistics
export const logisticsActivities: unknown[] = []
export const logisticsAIInsights: unknown[] = []
export const logisticsCollaborators: unknown[] = []
export const logisticsPredictions: unknown[] = []
export const logisticsQuickActions: unknown[] = []

// Events
export const eventsActivities: unknown[] = []
export const eventsAIInsights: unknown[] = []
export const eventsCollaborators: unknown[] = []
export const eventsPredictions: unknown[] = []
export const eventsQuickActions: unknown[] = []

// Onboarding
export const onboardingActivities: unknown[] = []
export const onboardingAIInsights: unknown[] = []
export const onboardingCollaborators: unknown[] = []
export const onboardingPredictions: unknown[] = []
export const onboardingQuickActions: unknown[] = []

// Recruitment
export const recruitmentActivities: unknown[] = []
export const recruitmentAIInsights: unknown[] = []
export const recruitmentCollaborators: unknown[] = []
export const recruitmentPredictions: unknown[] = []
export const recruitmentQuickActions: unknown[] = []

// Notifications
export const notificationsAIInsights: unknown[] = []
export const notificationsCollaborators: unknown[] = []
export const notificationsPredictions: unknown[] = []
export const notificationsActivities: unknown[] = []
export const notificationsQuickActions: unknown[] = []

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
  crmCollaborators,
  crmPredictions,
  crmAutomations,
  crmCompanies,
  crmContacts,
  crmReports,
  projectsProjects,
  projectsTasks,
  projectsMilestones,
  projectsStats,
  projectsAIInsights,
  projectsQuickActions,
  projectsKanbanColumns,
  projectsHubProjects,
  projectsHubSprints,
  projectsHubBacklog,
  projectsHubRoadmap,
  projectsHubAutomations,
  projectsHubTemplates,
  projectsHubIssues,
  projectsHubEpics,
  projectsHubReports,
  projectsHubIntegrations,
  projectsHubAIInsights,
  projectsHubCollaborators,
  projectsHubPredictions,
  projectsHubActivities,
  projectsHubQuickActions,
  projectsStatusColumns,
  financialsTransactions,
  financialsInvoices,
  financialsExpenses,
  financialsStats,
  financialsAIInsights,
  financialsQuickActions,
  financialsKPIs,
  financialTransactions,
  financialAccounts,
  financialActivities,
  financialAIInsights,
  financialBankAccounts,
  financialBudgetItems,
  financialCashFlow,
  financialCollaborators,
  financialPredictions,
  financialProfitLoss,
  financialQuickActions,
  teamMembers,
  teamStats,
  teamAIInsights,
  teamQuickActions,
  teamHubActivities,
  teamHubAIInsights,
  teamHubPredictions,
  teamHubQuickActions,
  teamManagementActivities,
  teamManagementAIInsights,
  teamManagementCollaborators,
  teamManagementPredictions,
  teamManagementQuickActions,
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
  monitoringLogs,
  calendarActivities,
  calendarAIInsights,
  calendarCollaborators,
  calendarPredictions,
  calendarQuickActions,
  communityActivities,
  communityAIInsights,
  communityCollaborators,
  communityPredictions,
  communityQuickActions,
  chatActivities,
  chatAIInsights,
  chatCollaborators,
  chatPredictions,
  chatQuickActions,
  messagesActivities,
  messagesAIInsights,
  messagesCollaborators,
  messagesPredictions,
  messagesQuickActions,
  messagingActivities,
  messagingAIInsights,
  messagingCollaborators,
  messagingPredictions,
  messagingQuickActions,
  announcementsActivities,
  announcementsAIInsights,
  announcementsCollaborators,
  announcementsPredictions,
  announcementsQuickActions,
  broadcastsActivities,
  broadcastsAIInsights,
  broadcastsCollaborators,
  broadcastsPredictions,
  broadcastsQuickActions,
  trainingActivities,
  trainingAIInsights,
  trainingCollaborators,
  trainingPredictions,
  trainingQuickActions,
  employeesActivities,
  employeesAIInsights,
  employeesCollaborators,
  employeesPredictions,
  employeesQuickActions,
  payrollActivities,
  payrollAIInsights,
  payrollCollaborators,
  payrollPredictions,
  payrollQuickActions,
  logisticsActivities,
  logisticsAIInsights,
  logisticsCollaborators,
  logisticsPredictions,
  logisticsQuickActions,
  eventsActivities,
  eventsAIInsights,
  eventsCollaborators,
  eventsPredictions,
  eventsQuickActions,
  onboardingActivities,
  onboardingAIInsights,
  onboardingCollaborators,
  onboardingPredictions,
  onboardingQuickActions,
  recruitmentActivities,
  recruitmentAIInsights,
  recruitmentCollaborators,
  recruitmentPredictions,
  recruitmentQuickActions,
  notificationsAIInsights
}
