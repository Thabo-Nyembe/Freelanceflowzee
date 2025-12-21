/**
 * Centralized Validation Schemas
 *
 * This module provides Zod validation schemas for all data entities
 * Used across server actions, API routes, and forms
 */

import { z } from 'zod'

// ============================================
// COMMON SCHEMAS
// ============================================

export const uuidSchema = z.string().uuid('Invalid UUID format')

export const emailSchema = z.string().email('Invalid email format').max(255)

export const phoneSchema = z.string()
  .regex(/^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/, 'Invalid phone number')
  .optional()
  .nullable()

export const urlSchema = z.string().url('Invalid URL format').optional().nullable()

export const dateSchema = z.string().datetime().or(z.date())

export const currencySchema = z.number().min(0).max(999999999.99)

export const percentageSchema = z.number().min(0).max(100)

export const paginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
  offset: z.number().int().min(0).optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
})

export const searchSchema = z.object({
  query: z.string().max(500).optional(),
  filters: z.record(z.any()).optional()
})

// ============================================
// USER & AUTH SCHEMAS
// ============================================

export const userSchema = z.object({
  id: uuidSchema.optional(),
  email: emailSchema,
  name: z.string().min(1).max(255),
  phone: phoneSchema,
  avatar_url: urlSchema,
  role: z.enum(['admin', 'owner', 'manager', 'member', 'viewer', 'guest']).default('member'),
  status: z.enum(['active', 'inactive', 'suspended', 'pending']).default('active')
})

export const createUserSchema = userSchema.omit({ id: true })
export const updateUserSchema = userSchema.partial().required({ id: true })

// ============================================
// PROJECT SCHEMAS
// ============================================

export const projectStatusSchema = z.enum([
  'draft', 'planning', 'in_progress', 'review', 'completed', 'on_hold', 'cancelled'
])

export const projectPrioritySchema = z.enum(['low', 'medium', 'high', 'urgent'])

export const projectSchema = z.object({
  id: uuidSchema.optional(),
  name: z.string().min(1, 'Project name is required').max(255),
  description: z.string().max(5000).optional().nullable(),
  client_id: uuidSchema.optional().nullable(),
  status: projectStatusSchema.default('draft'),
  priority: projectPrioritySchema.default('medium'),
  budget: currencySchema.optional().nullable(),
  start_date: dateSchema.optional().nullable(),
  end_date: dateSchema.optional().nullable(),
  progress: percentageSchema.default(0),
  tags: z.array(z.string().max(50)).max(20).optional(),
  metadata: z.record(z.any()).optional()
})

export const createProjectSchema = projectSchema.omit({ id: true })
export const updateProjectSchema = projectSchema.partial()

// ============================================
// CLIENT SCHEMAS
// ============================================

export const clientTypeSchema = z.enum(['individual', 'business', 'enterprise', 'agency'])

export const clientSchema = z.object({
  id: uuidSchema.optional(),
  name: z.string().min(1, 'Client name is required').max(255),
  email: emailSchema.optional().nullable(),
  phone: phoneSchema,
  company: z.string().max(255).optional().nullable(),
  website: urlSchema,
  address: z.string().max(500).optional().nullable(),
  city: z.string().max(100).optional().nullable(),
  country: z.string().max(100).optional().nullable(),
  type: clientTypeSchema.default('individual'),
  status: z.enum(['active', 'inactive', 'prospect', 'archived']).default('active'),
  notes: z.string().max(5000).optional().nullable(),
  tags: z.array(z.string().max(50)).max(20).optional(),
  metadata: z.record(z.any()).optional()
})

export const createClientSchema = clientSchema.omit({ id: true })
export const updateClientSchema = clientSchema.partial()

// ============================================
// INVOICE SCHEMAS
// ============================================

export const invoiceStatusSchema = z.enum([
  'draft', 'sent', 'viewed', 'paid', 'overdue', 'cancelled', 'refunded'
])

export const invoiceItemSchema = z.object({
  id: uuidSchema.optional(),
  description: z.string().min(1).max(500),
  quantity: z.number().min(0.01).max(999999),
  unit_price: currencySchema,
  tax_rate: percentageSchema.default(0),
  discount: percentageSchema.default(0),
  total: currencySchema.optional()
})

export const invoiceSchema = z.object({
  id: uuidSchema.optional(),
  invoice_number: z.string().max(50).optional(),
  client_id: uuidSchema,
  project_id: uuidSchema.optional().nullable(),
  status: invoiceStatusSchema.default('draft'),
  issue_date: dateSchema,
  due_date: dateSchema,
  items: z.array(invoiceItemSchema).min(1, 'At least one item required'),
  subtotal: currencySchema.optional(),
  tax_amount: currencySchema.optional(),
  discount_amount: currencySchema.optional(),
  total: currencySchema.optional(),
  currency: z.string().length(3).default('USD'),
  notes: z.string().max(2000).optional().nullable(),
  terms: z.string().max(2000).optional().nullable(),
  payment_method: z.string().max(100).optional().nullable(),
  metadata: z.record(z.any()).optional()
})

export const createInvoiceSchema = invoiceSchema.omit({ id: true })
export const updateInvoiceSchema = invoiceSchema.partial()

// ============================================
// CONTRACT SCHEMAS
// ============================================

export const contractStatusSchema = z.enum([
  'draft', 'pending_review', 'active', 'completed', 'terminated', 'expired'
])

export const contractSchema = z.object({
  id: uuidSchema.optional(),
  title: z.string().min(1).max(255),
  client_id: uuidSchema,
  project_id: uuidSchema.optional().nullable(),
  status: contractStatusSchema.default('draft'),
  start_date: dateSchema,
  end_date: dateSchema.optional().nullable(),
  value: currencySchema.optional().nullable(),
  currency: z.string().length(3).default('USD'),
  terms: z.string().max(50000).optional().nullable(),
  signed_at: dateSchema.optional().nullable(),
  signed_by: z.string().max(255).optional().nullable(),
  metadata: z.record(z.any()).optional()
})

export const createContractSchema = contractSchema.omit({ id: true })
export const updateContractSchema = contractSchema.partial()

// ============================================
// TASK SCHEMAS
// ============================================

export const taskStatusSchema = z.enum([
  'todo', 'in_progress', 'in_review', 'blocked', 'completed', 'cancelled'
])

export const taskPrioritySchema = z.enum(['low', 'medium', 'high', 'urgent'])

export const taskSchema = z.object({
  id: uuidSchema.optional(),
  title: z.string().min(1).max(255),
  description: z.string().max(5000).optional().nullable(),
  project_id: uuidSchema.optional().nullable(),
  assignee_id: uuidSchema.optional().nullable(),
  status: taskStatusSchema.default('todo'),
  priority: taskPrioritySchema.default('medium'),
  due_date: dateSchema.optional().nullable(),
  estimated_hours: z.number().min(0).max(9999).optional().nullable(),
  actual_hours: z.number().min(0).max(9999).optional().nullable(),
  tags: z.array(z.string().max(50)).max(20).optional(),
  metadata: z.record(z.any()).optional()
})

export const createTaskSchema = taskSchema.omit({ id: true })
export const updateTaskSchema = taskSchema.partial()

// ============================================
// FILE SCHEMAS
// ============================================

export const fileTypeSchema = z.enum([
  'image', 'video', 'audio', 'document', 'archive', 'other'
])

export const fileSchema = z.object({
  id: uuidSchema.optional(),
  name: z.string().min(1).max(255),
  original_name: z.string().max(255),
  mime_type: z.string().max(100),
  size: z.number().int().min(0).max(10737418240), // 10GB max
  type: fileTypeSchema.default('other'),
  path: z.string().max(1000),
  url: urlSchema,
  folder_id: uuidSchema.optional().nullable(),
  project_id: uuidSchema.optional().nullable(),
  metadata: z.record(z.any()).optional()
})

export const createFileSchema = fileSchema.omit({ id: true })
export const updateFileSchema = fileSchema.partial()

// ============================================
// BOOKING SCHEMAS
// ============================================

export const bookingStatusSchema = z.enum([
  'pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show'
])

export const bookingSchema = z.object({
  id: uuidSchema.optional(),
  title: z.string().min(1).max(255),
  client_id: uuidSchema.optional().nullable(),
  service_id: uuidSchema.optional().nullable(),
  status: bookingStatusSchema.default('pending'),
  start_time: dateSchema,
  end_time: dateSchema,
  duration_minutes: z.number().int().min(1).max(1440),
  price: currencySchema.optional().nullable(),
  currency: z.string().length(3).default('USD'),
  location: z.string().max(500).optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
  metadata: z.record(z.any()).optional()
})

export const createBookingSchema = bookingSchema.omit({ id: true })
export const updateBookingSchema = bookingSchema.partial()

// ============================================
// TRANSACTION SCHEMAS
// ============================================

export const transactionTypeSchema = z.enum([
  'income', 'expense', 'transfer', 'refund', 'fee'
])

export const transactionStatusSchema = z.enum([
  'pending', 'completed', 'failed', 'cancelled', 'refunded'
])

export const transactionSchema = z.object({
  id: uuidSchema.optional(),
  type: transactionTypeSchema,
  status: transactionStatusSchema.default('pending'),
  amount: currencySchema,
  currency: z.string().length(3).default('USD'),
  description: z.string().max(500).optional().nullable(),
  category: z.string().max(100).optional().nullable(),
  client_id: uuidSchema.optional().nullable(),
  project_id: uuidSchema.optional().nullable(),
  invoice_id: uuidSchema.optional().nullable(),
  payment_method: z.string().max(100).optional().nullable(),
  reference: z.string().max(255).optional().nullable(),
  transaction_date: dateSchema,
  metadata: z.record(z.any()).optional()
})

export const createTransactionSchema = transactionSchema.omit({ id: true })
export const updateTransactionSchema = transactionSchema.partial()

// ============================================
// MESSAGE/COMMENT SCHEMAS
// ============================================

export const messageSchema = z.object({
  id: uuidSchema.optional(),
  content: z.string().min(1).max(10000),
  recipient_id: uuidSchema.optional().nullable(),
  conversation_id: uuidSchema.optional().nullable(),
  parent_id: uuidSchema.optional().nullable(),
  attachments: z.array(z.object({
    id: uuidSchema,
    name: z.string().max(255),
    url: z.string().url(),
    type: z.string().max(100)
  })).optional(),
  metadata: z.record(z.any()).optional()
})

export const createMessageSchema = messageSchema.omit({ id: true })

export const commentSchema = z.object({
  id: uuidSchema.optional(),
  content: z.string().min(1).max(5000),
  entity_type: z.string().max(50),
  entity_id: uuidSchema,
  parent_id: uuidSchema.optional().nullable(),
  metadata: z.record(z.any()).optional()
})

export const createCommentSchema = commentSchema.omit({ id: true })

// ============================================
// AI TOOL SCHEMAS
// ============================================

export const aiToolTypeSchema = z.enum([
  'text', 'image', 'audio', 'video', 'code', 'analysis'
])

export const aiToolCategorySchema = z.enum([
  'content', 'creative', 'productivity', 'analytics', 'automation', 'development'
])

export const aiToolSchema = z.object({
  id: uuidSchema.optional(),
  name: z.string().min(1).max(255),
  description: z.string().max(2000),
  type: aiToolTypeSchema.default('text'),
  category: aiToolCategorySchema.default('content'),
  model: z.string().max(100),
  provider: z.string().max(100),
  status: z.enum(['active', 'inactive', 'beta', 'deprecated']).default('active'),
  pricing_tier: z.enum(['free', 'basic', 'pro', 'enterprise']).default('free'),
  features: z.array(z.string().max(100)).max(20).optional(),
  tags: z.array(z.string().max(50)).max(20).optional(),
  version: z.string().max(20).default('1.0.0'),
  metadata: z.record(z.any()).optional()
})

export const createAIToolSchema = aiToolSchema.omit({ id: true })
export const updateAIToolSchema = aiToolSchema.partial()

// ============================================
// TEAM SCHEMAS
// ============================================

export const teamMemberRoleSchema = z.enum([
  'owner', 'admin', 'manager', 'member', 'viewer'
])

export const teamSchema = z.object({
  id: uuidSchema.optional(),
  name: z.string().min(1).max(255),
  description: z.string().max(1000).optional().nullable(),
  avatar_url: urlSchema,
  settings: z.record(z.any()).optional(),
  metadata: z.record(z.any()).optional()
})

export const createTeamSchema = teamSchema.omit({ id: true })
export const updateTeamSchema = teamSchema.partial()

export const teamMemberSchema = z.object({
  team_id: uuidSchema,
  user_id: uuidSchema,
  role: teamMemberRoleSchema.default('member'),
  permissions: z.array(z.string().max(50)).optional()
})

// ============================================
// NOTIFICATION SCHEMAS
// ============================================

export const notificationTypeSchema = z.enum([
  'info', 'success', 'warning', 'error', 'mention', 'assignment', 'reminder'
])

export const notificationSchema = z.object({
  id: uuidSchema.optional(),
  title: z.string().min(1).max(255),
  message: z.string().max(1000),
  type: notificationTypeSchema.default('info'),
  link: urlSchema,
  read: z.boolean().default(false),
  metadata: z.record(z.any()).optional()
})

export const createNotificationSchema = notificationSchema.omit({ id: true })

// ============================================
// ANALYTICS SCHEMAS
// ============================================

export const analyticsEventSchema = z.object({
  event_name: z.string().min(1).max(100),
  event_type: z.string().max(50).optional(),
  properties: z.record(z.any()).optional(),
  timestamp: dateSchema.optional(),
  session_id: z.string().max(100).optional(),
  page_url: z.string().max(2000).optional(),
  referrer: z.string().max(2000).optional(),
  user_agent: z.string().max(500).optional()
})

export const analyticsQuerySchema = z.object({
  start_date: dateSchema,
  end_date: dateSchema,
  metrics: z.array(z.string().max(50)).min(1).max(20),
  dimensions: z.array(z.string().max(50)).max(10).optional(),
  filters: z.record(z.any()).optional(),
  granularity: z.enum(['hour', 'day', 'week', 'month', 'year']).default('day')
})

// ============================================
// VALIDATION HELPER FUNCTIONS
// ============================================

/**
 * Validate data against a schema and return typed result
 */
export function validateData<T>(schema: z.ZodSchema<T>, data: unknown): {
  success: boolean
  data?: T
  errors?: z.ZodError['errors']
} {
  const result = schema.safeParse(data)
  if (result.success) {
    return { success: true, data: result.data }
  }
  return { success: false, errors: result.error.errors }
}

/**
 * Validate and throw on error (for server actions)
 */
export function parseData<T>(schema: z.ZodSchema<T>, data: unknown): T {
  return schema.parse(data)
}

/**
 * Create validation error response for API routes
 */
export function createValidationError(errors: z.ZodError['errors']) {
  return {
    error: 'Validation failed',
    code: 'VALIDATION_ERROR',
    details: errors.map(err => ({
      field: err.path.join('.'),
      message: err.message,
      code: err.code
    }))
  }
}

// Export types
export type User = z.infer<typeof userSchema>
export type CreateUser = z.infer<typeof createUserSchema>
export type UpdateUser = z.infer<typeof updateUserSchema>

export type Project = z.infer<typeof projectSchema>
export type CreateProject = z.infer<typeof createProjectSchema>
export type UpdateProject = z.infer<typeof updateProjectSchema>

export type Client = z.infer<typeof clientSchema>
export type CreateClient = z.infer<typeof createClientSchema>
export type UpdateClient = z.infer<typeof updateClientSchema>

export type Invoice = z.infer<typeof invoiceSchema>
export type CreateInvoice = z.infer<typeof createInvoiceSchema>
export type UpdateInvoice = z.infer<typeof updateInvoiceSchema>
export type InvoiceItem = z.infer<typeof invoiceItemSchema>

export type Contract = z.infer<typeof contractSchema>
export type CreateContract = z.infer<typeof createContractSchema>
export type UpdateContract = z.infer<typeof updateContractSchema>

export type Task = z.infer<typeof taskSchema>
export type CreateTask = z.infer<typeof createTaskSchema>
export type UpdateTask = z.infer<typeof updateTaskSchema>

export type File = z.infer<typeof fileSchema>
export type CreateFile = z.infer<typeof createFileSchema>
export type UpdateFile = z.infer<typeof updateFileSchema>

export type Booking = z.infer<typeof bookingSchema>
export type CreateBooking = z.infer<typeof createBookingSchema>
export type UpdateBooking = z.infer<typeof updateBookingSchema>

export type Transaction = z.infer<typeof transactionSchema>
export type CreateTransaction = z.infer<typeof createTransactionSchema>
export type UpdateTransaction = z.infer<typeof updateTransactionSchema>

export type Message = z.infer<typeof messageSchema>
export type CreateMessage = z.infer<typeof createMessageSchema>

export type Comment = z.infer<typeof commentSchema>
export type CreateComment = z.infer<typeof createCommentSchema>

export type AITool = z.infer<typeof aiToolSchema>
export type CreateAITool = z.infer<typeof createAIToolSchema>
export type UpdateAITool = z.infer<typeof updateAIToolSchema>

export type Team = z.infer<typeof teamSchema>
export type CreateTeam = z.infer<typeof createTeamSchema>
export type UpdateTeam = z.infer<typeof updateTeamSchema>
export type TeamMember = z.infer<typeof teamMemberSchema>

export type Notification = z.infer<typeof notificationSchema>
export type CreateNotification = z.infer<typeof createNotificationSchema>

export type AnalyticsEvent = z.infer<typeof analyticsEventSchema>
export type AnalyticsQuery = z.infer<typeof analyticsQuerySchema>

export type Pagination = z.infer<typeof paginationSchema>
export type Search = z.infer<typeof searchSchema>
