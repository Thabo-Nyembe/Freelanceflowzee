// ============================================================================
// FREEFLOW HOOKS INDEX
// Centralized exports for all application hooks
// ============================================================================

// ----------------------------------------------------------------------------
// PHASE 1: CRITICAL PRIORITY
// ----------------------------------------------------------------------------
export { useProjects, type Project, type ProjectStats } from './use-projects'
export { useTasks, type Task, type TaskStats } from './use-tasks'
export { useFiles, type FileItem, type FileStats } from './use-files'
export { useCalendar, type CalendarEvent, type CalendarStats } from './use-calendar'
export { useAnalytics, type AnalyticsData, type MetricData } from './use-analytics'

// ----------------------------------------------------------------------------
// PHASE 2: HIGH PRIORITY
// ----------------------------------------------------------------------------
export { useInvoices, type Invoice, type InvoiceStats } from './use-invoices'
export { useClients, type Client, type ClientStats } from './use-clients'
export { useMessages, type Message, type Conversation } from './use-messages'
export { useNotifications, type Notification } from './use-notifications'
export { useSettings, type UserSettings } from './use-settings'

// ----------------------------------------------------------------------------
// PHASE 3: MEDIUM PRIORITY
// ----------------------------------------------------------------------------
export { useTeamHub, type TeamMember, type TeamStats } from './use-team-hub'
export { useDocuments, type Document, type DocumentStats } from './use-documents'
export { useReports, type Report, type ReportStats } from './use-reports'
export { useTemplates, type Template, type TemplateStats } from './use-templates'
export { useBookings, type Booking, type BookingStats } from './use-bookings'
export { useContracts, type Contract, type ContractStats } from './use-contracts'
export { useExpenses, type Expense, type ExpenseStats } from './use-expenses'
export { useTimeTracking, type TimeEntry, type TimeStats } from './use-time-tracking'
export { useDashboard, type DashboardData, type DashboardWidget } from './use-dashboard'
export { useWorkflows, type Workflow, type WorkflowStats } from './use-workflows'

// ----------------------------------------------------------------------------
// PHASE 4 BATCH 1: CORE BUSINESS
// ----------------------------------------------------------------------------
export { useEstimates, type Estimate, type EstimateStats } from './use-estimates'

// ----------------------------------------------------------------------------
// PHASE 4 BATCH 2: COMMUNICATION & TEAM
// ----------------------------------------------------------------------------
export { useChat, type ChatMessage, type ChatRoom } from './use-chat'
export { useAnnouncements, type Announcement, type AnnouncementStats } from './use-announcements'

// ----------------------------------------------------------------------------
// PHASE 4 BATCH 3: CONTENT & DOCUMENTS
// ----------------------------------------------------------------------------
export { useForms, type Form, type FormStats } from './use-forms'
export { useSurveys, type Survey, type SurveyStats } from './use-surveys'
export { useKnowledgeBase, type KBArticle, type KBStats } from './use-knowledge-base'

// ----------------------------------------------------------------------------
// PHASE 4 BATCH 4: MARKETING & SALES
// ----------------------------------------------------------------------------
export { useCampaigns, type Campaign, type CampaignStats } from './use-campaigns'
export { useCRM, type Lead, type Deal, type CRMStats } from './use-crm'
export { useSEO, type SEOAnalysis, type SEOStats } from './use-seo'
export { useSocialMedia, type SocialPost, type SocialStats } from './use-social-media'
export { useMarketplace, type MarketplaceListing, type MarketplaceStats } from './use-marketplace'

// ----------------------------------------------------------------------------
// PHASE 4 BATCH 5: SUPPORT & SERVICE
// ----------------------------------------------------------------------------
export { useTickets, type Ticket, type TicketStats } from './use-tickets'
export { useCustomerSupport, type SupportConversation, type SupportStats } from './use-customer-support'
export { useHelpDesk, type HelpArticle, type HelpStats } from './use-help-desk'
export { useFeedback, type Feedback, type FeedbackStats } from './use-feedback'

// ----------------------------------------------------------------------------
// PHASE 4 BATCH 6: EVENTS & TRAINING
// ----------------------------------------------------------------------------
export { useEvents, type Event, type EventStats } from './use-events'
export { useWebinars, type Webinar, type WebinarStats } from './use-webinars'
export { useCourses, type Course, type CourseStats } from './use-courses'
export { useCertifications, type Certification, type CertificationStats } from './use-certifications'

// ----------------------------------------------------------------------------
// PHASE 4 BATCH 7: DEVELOPMENT & DEVOPS
// ----------------------------------------------------------------------------
export { useBugs, type Bug, type BugStats } from './use-bugs'
export { useReleases, type Release, type ReleaseStats } from './use-releases'
export { useDeployments, type Deployment, type DeploymentStats } from './use-deployments'
export { useMonitoring, type ServiceHealth, type MonitoringStats } from './use-monitoring'

// ----------------------------------------------------------------------------
// PHASE 4 BATCH 8: SECURITY & COMPLIANCE
// ----------------------------------------------------------------------------
export { useAuditLogs, type AuditLog, type AuditStats } from './use-audit-logs'
export { useCompliance, type ComplianceRequirement, type ComplianceStats } from './use-compliance'
export { useBackups, type Backup, type BackupStats } from './use-backups'
export { useSecurity, type SecurityEvent, type SecurityStats } from './use-security'

// ----------------------------------------------------------------------------
// PHASE 4 BATCH 9: INTEGRATIONS & API
// ----------------------------------------------------------------------------
export { useWebhooks, type Webhook, type WebhookStats } from './use-webhooks'
export { useAPIKeys, type APIKey, type APIKeyStats } from './use-api-keys'
export { usePlugins, type Plugin, type PluginStats } from './use-plugins'
export { useExtensions, type Extension, type ExtensionStats } from './use-extensions'
export { useIntegrations, type Integration, type IntegrationStats } from './use-integrations'

// ----------------------------------------------------------------------------
// PHASE 4 BATCH 10: OPERATIONS & LOGISTICS
// ----------------------------------------------------------------------------
export { useInventory, type InventoryItem, type InventoryStats } from './use-inventory'
export { useShipping, type Shipment, type ShippingStats } from './use-shipping'
export { useOrders, type Order, type OrderStats } from './use-orders'
export { useLogistics, type Warehouse, type LogisticsStats } from './use-logistics'

// ----------------------------------------------------------------------------
// BUSINESS INTELLIGENCE & MAXIMIZATION
// Hooks for freelancers, entrepreneurs, agencies, and enterprises
// to maximize their business performance
// ----------------------------------------------------------------------------
export {
  useBusinessIntelligence,
  type BusinessMetrics,
  type BusinessHealthScore,
  type BusinessGoal,
  type Forecast,
  type BenchmarkData
} from './use-business-intelligence'

export {
  useProfitability,
  type ProjectProfitability,
  type ClientProfitability,
  type ServiceProfitability,
  type ProfitTrend,
  type ProfitInsight
} from './use-profitability'

export {
  useClientValue,
  type ClientValueMetrics,
  type ClientCohort,
  type LTVAnalysis,
  type ChurnAnalysis,
  type RetentionStrategy
} from './use-client-value'

export {
  useRevenueForecast,
  type RevenueForecast,
  type ForecastScenario,
  type PipelineRevenue,
  type RevenueGoal,
  type SeasonalityPattern,
  type RevenueDriver
} from './use-revenue-forecast'

export {
  useKPIGoals,
  type KPIGoal,
  type KPITemplate,
  type GoalDashboard,
  type GoalRecommendation,
  type GoalInsight
} from './use-kpi-goals'

export {
  useBusinessDashboard,
  type UserType as BusinessUserType,
  type UseBusinessDashboardOptions,
  type BusinessDashboardData
} from './use-business-dashboard'

// ----------------------------------------------------------------------------
// UTILITY HOOKS
// ----------------------------------------------------------------------------
export { useAIData } from './use-ai-data'
export { useDynamicContent } from './use-dynamic-content'
export { useEngagement } from './use-engagement'

// ----------------------------------------------------------------------------
// HOOK OPTIONS TYPE (common interface)
// ----------------------------------------------------------------------------
export interface UseHookOptions {
  
}
