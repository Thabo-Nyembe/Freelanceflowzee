/**
 * API Clients - Central Export
 *
 * Production-ready API clients that replace setTimeout mock data patterns
 * with real Supabase queries using TanStack Query
 *
 * Usage:
 * ```tsx
 * import { useProjects, useClients, useInvoices } from '@/lib/api-clients'
 *
 * function MyComponent() {
 *   const { data: projects, isLoading } = useProjects(1, 10)
 *   const { data: clients } = useClients(1, 10, { status: ['active'] })
 *   const createInvoice = useCreateInvoice()
 *
 *   // ...
 * }
 * ```
 */

// Base Client
export { BaseApiClient } from './base-client'
export type { ApiResponse } from './base-client'

// Projects
export { projectsClient } from './projects-client'
export type {
  Project,
  CreateProjectData,
  UpdateProjectData,
  ProjectFilters,
  ProjectStats
} from './projects-client'

export {
  useProjects,
  useProject,
  useCreateProject,
  useUpdateProject,
  useDeleteProject,
  useProjectStats
} from './use-projects'

// Clients
export { clientsClient } from './clients-client'
export type {
  Client,
  CreateClientData,
  UpdateClientData,
  ClientFilters,
  ClientStats
} from './clients-client'

export {
  useClients,
  useClient,
  useCreateClient,
  useUpdateClient,
  useDeleteClient,
  useClientStats,
  useRecordContact,
  useUpdateClientFinancials
} from './use-clients'

// Invoices
export { invoicesClient } from './invoices-client'
export type {
  Invoice,
  InvoiceLineItem,
  CreateInvoiceData,
  UpdateInvoiceData,
  InvoiceFilters,
  InvoiceStats
} from './invoices-client'

export {
  useInvoices,
  useInvoice,
  useCreateInvoice,
  useUpdateInvoice,
  useDeleteInvoice,
  useSendInvoice,
  useMarkInvoiceAsPaid,
  useGenerateInvoicePDF,
  useInvoiceStats
} from './use-invoices'

// Tasks
export { tasksClient } from './tasks-client'
export type {
  Task,
  TaskAttachment,
  TaskComment,
  TaskChecklistItem,
  CreateTaskData,
  UpdateTaskData,
  TaskFilters,
  TaskStats
} from './tasks-client'

export {
  useTasks,
  useTask,
  useCreateTask,
  useUpdateTask,
  useDeleteTask,
  useAssignTask,
  useUpdateTaskProgress,
  useAddTaskComment,
  useTaskStats
} from './use-tasks'

// Analytics
export { analyticsClient } from './analytics-client'
export type {
  DashboardMetrics,
  RevenueMetrics,
  ProjectMetrics,
  ClientMetrics,
  TaskMetrics,
  TimeMetrics,
  GrowthMetrics,
  EngagementMetrics,
  PerformanceMetrics,
  PredictiveInsights
} from './analytics-client'

export {
  useDashboardMetrics,
  useRevenueAnalytics,
  useEngagementMetrics,
  usePerformanceMetrics,
  usePredictiveInsights
} from './use-analytics'

// Messages/Chat
export { messagesClient } from './messages-client'
export type {
  Message,
  MessageAttachment,
  MessageReaction,
  Conversation,
  ConversationParticipant,
  CreateMessageData,
  UpdateMessageData,
  CreateConversationData,
  MessageFilters,
  ConversationFilters,
  MessagingStats
} from './messages-client'

export {
  useConversations,
  useMessages,
  useSendMessage,
  useMarkAsRead,
  useMarkConversationAsRead,
  useDeleteMessage,
  useCreateConversation,
  useMessagingStats,
  useAddReaction
} from './use-messages'
