/**
 * World-Class Components Index
 *
 * This file exports all world-class, production-ready components for use
 * across V1 and V2 dashboard pages.
 *
 * Usage:
 * import { EnhancedDataTable, AdvancedFileUpload, StripePayment } from '@/components/world-class'
 */

// ============================================================================
// DATA TABLES - TanStack Table Integration
// ============================================================================
export { EnhancedDataTable, SortableColumnHeader, RowActionsDropdown } from '@/components/ui/enhanced-data-table'

// ============================================================================
// FILE UPLOAD - React Dropzone + Supabase Storage
// ============================================================================
export { AdvancedFileUpload } from './file-upload/advanced-file-upload'
export type { UploadedFile, AdvancedFileUploadProps } from './file-upload/advanced-file-upload'

// ============================================================================
// PAYMENTS - Stripe Integration
// ============================================================================
export { StripePayment, usePaymentIntent } from '@/components/payments/stripe-payment-element'
export { default as GuestPaymentModal } from '@/components/payments/guest-payment-modal'
export type { StripePaymentProps } from '@/components/payments/stripe-payment-element'

// ============================================================================
// COLLABORATION - Realtime Features
// ============================================================================
export { CollaborationProvider, useCollaborationContext, withCollaboration } from '@/components/collaboration/collaboration-provider'
export { default as FileUploadZone } from '@/components/collaboration/file-upload-zone'

// ============================================================================
// REALTIME - Supabase Realtime Hooks
// ============================================================================
export {
  useRealtimeConnection,
  useRealtimeConnections,
  useRealtimeChannels,
  useRealtimeMessages,
  useRealtimePresence,
  useActiveConnections
} from '@/lib/hooks/use-realtime-extended'

// ============================================================================
// COLLABORATION HOOKS
// ============================================================================
export {
  useCollaboration,
  type CollaborationSession,
  type SessionType,
  type SessionStatus
} from '@/lib/hooks/use-collaboration'

// ============================================================================
// FILE MANAGEMENT - API Clients
// ============================================================================
export {
  filesClient,
  type FileItem,
  type Folder,
  type FileShare,
  type FileVersion,
  type UploadFileData,
  type UpdateFileData,
  type CreateFolderData,
  type FileFilters,
  type StorageStats
} from '@/lib/api-clients/files-client'

// ============================================================================
// CHARTS - Recharts Wrappers with Theme Support
// ============================================================================
export {
  WorldClassAreaChart,
  WorldClassBarChart,
  WorldClassLineChart,
  WorldClassPieChart,
  type AreaChartDataPoint,
  type AreaConfig,
  type WorldClassAreaChartProps,
  type BarChartDataPoint,
  type BarConfig,
  type WorldClassBarChartProps,
  type LineChartDataPoint,
  type LineConfig,
  type ReferenceLineConfig,
  type WorldClassLineChartProps,
  type PieChartDataPoint,
  type WorldClassPieChartProps,
} from './charts'

// ============================================================================
// FORMS - Enhanced Form Components with react-hook-form & Zod
// ============================================================================
export {
  // Form Input
  FormInput,
  StandaloneInput,
  inputValidationSchemas,
  type FormInputProps,
  type StandaloneInputProps,
  // Form Select
  FormSelect,
  StandaloneSelect,
  type FormSelectProps,
  type StandaloneSelectProps,
  type SelectOption,
  type SelectGroup,
  // Form Textarea
  FormTextarea,
  StandaloneTextarea,
  TextDisplay,
  textareaValidationSchemas,
  type FormTextareaProps,
  type StandaloneTextareaProps,
  type TextDisplayProps,
  // Form Date Picker
  FormDatePicker,
  StandaloneDatePicker,
  dateValidationSchemas,
  type FormDatePickerProps,
  type StandaloneDatePickerProps,
  type DatePreset,
} from './forms'
