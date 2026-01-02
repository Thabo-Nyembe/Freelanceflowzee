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

// Empty arrays for backward compatibility - components should fetch real data

// Analytics
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

// CRM/Customers
export const crmCustomers: any[] = []
export const crmDeals: any[] = []
export const crmLeads: any[] = []
export const crmActivities: any[] = []
export const crmQuickActions: any[] = []
export const crmStats: any = {}
export const crmAIInsights: any[] = []
export const crmPipelineStages: any[] = []
export const crmCollaborators: any[] = []
export const crmPredictions: any[] = []
export const crmAutomations: any[] = []
export const crmCompanies: any[] = []
export const crmContacts: any[] = []
export const crmReports: any[] = []

// Projects
export const projectsProjects: any[] = []
export const projectsTasks: any[] = []
export const projectsMilestones: any[] = []
export const projectsStats: any = {}
export const projectsAIInsights: any[] = []
export const projectsQuickActions: any[] = []
export const projectsKanbanColumns: any[] = []

// Projects Hub
export const projectsHubProjects: any[] = []
export const projectsHubSprints: any[] = []
export const projectsHubBacklog: any[] = []
export const projectsHubRoadmap: any[] = []
export const projectsHubAutomations: any[] = []
export const projectsHubTemplates: any[] = []
export const projectsHubIssues: any[] = []
export const projectsHubEpics: any[] = []
export const projectsHubReports: any[] = []
export const projectsHubIntegrations: any[] = []
export const projectsHubAIInsights: any[] = []
export const projectsHubCollaborators: any[] = []
export const projectsHubPredictions: any[] = []
export const projectsHubActivities: any[] = []
export const projectsHubQuickActions: any[] = []
export const projectsStatusColumns: any[] = []

// Financials
export const financialsTransactions: any[] = []
export const financialsInvoices: any[] = []
export const financialsExpenses: any[] = []
export const financialsStats: any = {}
export const financialsAIInsights: any[] = []
export const financialsQuickActions: any[] = []
export const financialsKPIs: any[] = []

// Financial (alternate naming)
export const financialTransactions: any[] = []
export const financialAccounts: any[] = []
export const financialActivities: any[] = []
export const financialAIInsights: any[] = []
export const financialBankAccounts: any[] = []
export const financialBudgetItems: any[] = []
export const financialCashFlow: any[] = []
export const financialCollaborators: any[] = []
export const financialPredictions: any[] = []
export const financialProfitLoss: any[] = []
export const financialQuickActions: any[] = []

// Team
export const teamMembers: any[] = []
export const teamStats: any = {}
export const teamAIInsights: any[] = []
export const teamQuickActions: any[] = []

// Team Hub
export const teamHubActivities: any[] = []
export const teamHubAIInsights: any[] = []
export const teamHubPredictions: any[] = []
export const teamHubQuickActions: any[] = []

// Team Management
export const teamManagementActivities: any[] = []
export const teamManagementAIInsights: any[] = []
export const teamManagementCollaborators: any[] = []
export const teamManagementPredictions: any[] = []
export const teamManagementQuickActions: any[] = []

// Products
export const productsItems: any[] = []
export const productsOrders: any[] = []
export const productsStats: any = {}

// Communications
export const communicationsMessages: any[] = []
export const communicationsConversations: any[] = []
export const communicationsEmails: any[] = []
export const communicationsEvents: any[] = []
export const communicationsStats: any = {}

// Integrations
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

// Calendar
export const calendarActivities: any[] = []
export const calendarAIInsights: any[] = []
export const calendarCollaborators: any[] = []
export const calendarPredictions: any[] = []
export const calendarQuickActions: any[] = []

// Community
export const communityActivities: any[] = []
export const communityAIInsights: any[] = []
export const communityCollaborators: any[] = []
export const communityPredictions: any[] = []
export const communityQuickActions: any[] = []

// Chat
export const chatActivities: any[] = []
export const chatAIInsights: any[] = []
export const chatCollaborators: any[] = []
export const chatPredictions: any[] = []
export const chatQuickActions: any[] = []

// Messages
export const messagesActivities: any[] = []
export const messagesAIInsights: any[] = []
export const messagesCollaborators: any[] = []
export const messagesPredictions: any[] = []
export const messagesQuickActions: any[] = []

// Messaging
export const messagingActivities: any[] = []
export const messagingAIInsights: any[] = []
export const messagingCollaborators: any[] = []
export const messagingPredictions: any[] = []
export const messagingQuickActions: any[] = []

// Announcements
export const announcementsActivities: any[] = []
export const announcementsAIInsights: any[] = []
export const announcementsCollaborators: any[] = []
export const announcementsPredictions: any[] = []
export const announcementsQuickActions: any[] = []

// Broadcasts
export const broadcastsActivities: any[] = []
export const broadcastsAIInsights: any[] = []
export const broadcastsCollaborators: any[] = []
export const broadcastsPredictions: any[] = []
export const broadcastsQuickActions: any[] = []

// Training
export const trainingActivities: any[] = []
export const trainingAIInsights: any[] = []
export const trainingCollaborators: any[] = []
export const trainingPredictions: any[] = []
export const trainingQuickActions: any[] = []

// Employees
export const employeesActivities: any[] = []
export const employeesAIInsights: any[] = []
export const employeesCollaborators: any[] = []
export const employeesPredictions: any[] = []
export const employeesQuickActions: any[] = []

// Payroll
export const payrollActivities: any[] = []
export const payrollAIInsights: any[] = []
export const payrollCollaborators: any[] = []
export const payrollPredictions: any[] = []
export const payrollQuickActions: any[] = []

// Logistics
export const logisticsActivities: any[] = []
export const logisticsAIInsights: any[] = []
export const logisticsCollaborators: any[] = []
export const logisticsPredictions: any[] = []
export const logisticsQuickActions: any[] = []

// Events
export const eventsActivities: any[] = []
export const eventsAIInsights: any[] = []
export const eventsCollaborators: any[] = []
export const eventsPredictions: any[] = []
export const eventsQuickActions: any[] = []

// Onboarding
export const onboardingActivities: any[] = []
export const onboardingAIInsights: any[] = []
export const onboardingCollaborators: any[] = []
export const onboardingPredictions: any[] = []
export const onboardingQuickActions: any[] = []

// Recruitment
export const recruitmentActivities: any[] = []
export const recruitmentAIInsights: any[] = []
export const recruitmentCollaborators: any[] = []
export const recruitmentPredictions: any[] = []
export const recruitmentQuickActions: any[] = []

// Notifications
export const notificationsAIInsights: any[] = []

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
