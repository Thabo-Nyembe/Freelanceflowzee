/**
 * API Clients - Central Export
 *
 * Production-ready API clients that replace setTimeout mock data patterns
 * with real Supabase queries using TanStack Query
 *
 * Caching Strategy:
 * - Static data (categories, types): staleTime: Infinity
 * - User data (projects, tasks): staleTime: 5 minutes
 * - Real-time data (messages, notifications): staleTime: 0
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

// Query Client Configuration
export {
  createQueryClient,
  getQueryClient,
  queryKeys,
  STALE_TIMES,
  CACHE_TIMES,
  staticQueryOptions,
  userDataQueryOptions,
  realtimeQueryOptions,
  analyticsQueryOptions,
  invalidationPatterns,
} from '@/lib/query-client'

// Prefetching Utilities
export {
  prefetchProjects,
  prefetchClients,
  prefetchTasks,
  prefetchInvoices,
  prefetchNotifications,
  prefetchConversations,
  prefetchDashboardData,
  prefetchDashboardMetrics,
  prefetchForRoute,
  prefetchCommonData,
  createPrefetchHandlers,
} from '@/lib/query-prefetch'

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
  useAddReaction,
  useArchiveConversation,
  usePinConversation,
  useExportConversation
} from './use-messages'

// Files/Storage
export { filesClient } from './files-client'
export type {
  FileItem,
  Folder,
  FileShare,
  FileVersion,
  UploadFileData,
  UpdateFileData,
  CreateFolderData,
  FileFilters,
  StorageStats
} from './files-client'

export {
  useFiles,
  useFile,
  useUploadFile,
  useUploadFiles,
  useUpdateFile,
  useDeleteFile,
  usePermanentlyDeleteFile,
  useStarFile,
  useFolders,
  useCreateFolder,
  useStorageStats,
  useDownloadFile,
  useMoveFile
} from './use-files'

// Calendar/Events
export { calendarClient } from './calendar-client'
export type {
  CalendarEvent,
  EventAttendee,
  EventReminder,
  Calendar,
  Booking,
  CreateEventData,
  UpdateEventData,
  CreateCalendarData,
  CreateBookingData,
  EventFilters,
  CalendarStats
} from './calendar-client'

export {
  useEvents,
  useEvent,
  useCreateEvent,
  useUpdateEvent,
  useDeleteEvent,
  useCalendars,
  useCreateCalendar,
  useBookings,
  useCreateBooking,
  useUpdateBookingStatus,
  useCalendarStats
} from './use-calendar'

// Notifications
export { notificationsClient } from './notifications-client'
export type {
  Notification,
  NotificationAction,
  NotificationPreferences,
  CreateNotificationData,
  NotificationFilters,
  NotificationStats
} from './notifications-client'

export {
  useNotifications,
  useNotification,
  useCreateNotification,
  useMarkNotificationAsRead,
  useMarkAllAsRead,
  useArchiveNotification,
  useTogglePin,
  useDeleteNotification,
  useDeleteAllArchived,
  useNotificationPreferences,
  useUpdatePreferences,
  useNotificationStats
} from './use-notifications'

// Team
export { teamClient } from './team-client'
export type {
  TeamMember,
  TeamRole,
  TeamPermission,
  WorkHours,
  TeamInvitation,
  TeamDepartment,
  CreateTeamMemberData,
  UpdateTeamMemberData,
  CreateInvitationData,
  TeamFilters,
  TeamStats
} from './team-client'

export {
  teamQueryKeys,
  useTeamMembers,
  useInfiniteTeamMembers,
  useTeamMember,
  useCreateTeamMember,
  useUpdateTeamMember,
  useDeleteTeamMember,
  useUpdateTeamMemberStatus,
  useUpdateTeamMemberRole,
  useUpdatePerformance,
  useToggleTeamLead,
  useTeamInvitations,
  useSendInvitation,
  useCancelInvitation,
  useResendInvitation,
  useTeamDepartments,
  useTeamStats,
  useBulkUpdateStatus,
  useBulkDeleteTeamMembers
} from './use-team-api'

// Settings
export { settingsClient } from './settings-client'
export type {
  UserSettings,
  SecurityQuestion,
  TrustedDevice,
  IntegrationSettings,
  ConnectedAccount,
  BillingAddress,
  UpdateProfileData,
  UpdateNotificationSettings,
  UpdateAppearanceSettings,
  UpdateRegionalSettings,
  UpdatePrivacySettings,
  UpdateSecuritySettings,
  UpdateBillingSettings,
  SettingsStats
} from './settings-client'

export {
  settingsQueryKeys,
  useUserSettings,
  useUpdateSettings,
  useUpdateProfile,
  useUpdateNotificationSettings,
  useUpdateAppearanceSettings,
  useUpdateRegionalSettings,
  useUpdatePrivacySettings,
  useUpdateSecuritySettings,
  useEnable2FA,
  useDisable2FA,
  useGenerateApiKey,
  useRevokeApiKey,
  useUpdateWebhook,
  useTrustedDevices,
  useRemoveTrustedDevice,
  useConnectedAccounts,
  useDisconnectAccount,
  useUpdateIntegrations,
  useUpdateBillingSettings,
  useSettingsStats,
  useExportUserData,
  useDeleteAccount
} from './use-settings-api'
