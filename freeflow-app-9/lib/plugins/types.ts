/**
 * Plugin System Types
 *
 * Defines the architecture for extensible plugins in the FreeFlow platform.
 */

import type { ReactNode, ComponentType } from 'react'

// ============================================================================
// PLUGIN TYPES
// ============================================================================

export type PluginStatus = 'active' | 'inactive' | 'error' | 'updating' | 'pending_review'
export type PluginCategory =
  | 'productivity'
  | 'communication'
  | 'analytics'
  | 'finance'
  | 'design'
  | 'development'
  | 'automation'
  | 'integration'
  | 'utility'
  | 'ai'
  | 'security'
  | 'other'

export type PluginPermission =
  | 'read:projects'
  | 'write:projects'
  | 'read:tasks'
  | 'write:tasks'
  | 'read:clients'
  | 'write:clients'
  | 'read:invoices'
  | 'write:invoices'
  | 'read:files'
  | 'write:files'
  | 'read:messages'
  | 'write:messages'
  | 'read:calendar'
  | 'write:calendar'
  | 'read:analytics'
  | 'execute:webhooks'
  | 'read:settings'
  | 'write:settings'
  | 'admin:full'

// ============================================================================
// PLUGIN MANIFEST
// ============================================================================

export interface PluginManifest {
  id: string
  name: string
  version: string
  description: string
  author: {
    name: string
    email?: string
    url?: string
  }
  license?: string
  homepage?: string
  repository?: string
  category: PluginCategory
  tags: string[]
  icon?: string
  banner?: string
  permissions: PluginPermission[]
  minAppVersion?: string
  maxAppVersion?: string
  dependencies?: Record<string, string>
  settings?: PluginSettingDefinition[]
  entryPoints?: {
    main?: string
    settings?: string
    widget?: string
  }
}

// ============================================================================
// PLUGIN SETTINGS
// ============================================================================

export interface PluginSettingDefinition {
  key: string
  type: 'text' | 'number' | 'boolean' | 'select' | 'multiselect' | 'color' | 'secret' | 'json'
  label: string
  description?: string
  required?: boolean
  default?: unknown
  placeholder?: string
  options?: Array<{ value: string; label: string }>
  validation?: {
    min?: number
    max?: number
    pattern?: string
    message?: string
  }
}

export interface PluginSettings {
  [key: string]: unknown
}

// ============================================================================
// PLUGIN HOOKS
// ============================================================================

export interface PluginHooks {
  // Lifecycle hooks
  onInstall?: (context: PluginContext) => Promise<void>
  onUninstall?: (context: PluginContext) => Promise<void>
  onActivate?: (context: PluginContext) => Promise<void>
  onDeactivate?: (context: PluginContext) => Promise<void>
  onUpdate?: (context: PluginContext, fromVersion: string) => Promise<void>

  // Data hooks
  onProjectCreate?: (context: PluginContext, project: Record<string, unknown>) => Promise<Record<string, unknown>>
  onProjectUpdate?: (context: PluginContext, project: Record<string, unknown>) => Promise<Record<string, unknown>>
  onProjectDelete?: (context: PluginContext, projectId: string) => Promise<void>

  onTaskCreate?: (context: PluginContext, task: Record<string, unknown>) => Promise<Record<string, unknown>>
  onTaskUpdate?: (context: PluginContext, task: Record<string, unknown>) => Promise<Record<string, unknown>>
  onTaskComplete?: (context: PluginContext, task: Record<string, unknown>) => Promise<void>
  onTaskDelete?: (context: PluginContext, taskId: string) => Promise<void>

  onInvoiceCreate?: (context: PluginContext, invoice: Record<string, unknown>) => Promise<Record<string, unknown>>
  onInvoicePaid?: (context: PluginContext, invoice: Record<string, unknown>) => Promise<void>

  onMessageReceived?: (context: PluginContext, message: Record<string, unknown>) => Promise<void>
  onFileUploaded?: (context: PluginContext, file: Record<string, unknown>) => Promise<Record<string, unknown>>

  // Custom hooks
  onCustomEvent?: (context: PluginContext, event: string, data: unknown) => Promise<void>
}

// ============================================================================
// PLUGIN CONTEXT
// ============================================================================

export interface PluginContext {
  // Plugin info
  pluginId: string
  pluginVersion: string

  // User info
  userId: string
  userEmail?: string
  userRole?: string

  // Plugin settings
  settings: PluginSettings

  // API access
  api: PluginAPI

  // Storage
  storage: PluginStorage

  // Logger
  logger: PluginLogger

  // UI
  ui: PluginUI
}

// ============================================================================
// PLUGIN API
// ============================================================================

export interface PluginAPI {
  // Projects
  getProjects: (filters?: Record<string, unknown>) => Promise<unknown[]>
  getProject: (id: string) => Promise<unknown | null>
  createProject: (data: Record<string, unknown>) => Promise<unknown>
  updateProject: (id: string, data: Record<string, unknown>) => Promise<unknown>
  deleteProject: (id: string) => Promise<void>

  // Tasks
  getTasks: (filters?: Record<string, unknown>) => Promise<unknown[]>
  getTask: (id: string) => Promise<unknown | null>
  createTask: (data: Record<string, unknown>) => Promise<unknown>
  updateTask: (id: string, data: Record<string, unknown>) => Promise<unknown>
  deleteTask: (id: string) => Promise<void>

  // Clients
  getClients: (filters?: Record<string, unknown>) => Promise<unknown[]>
  getClient: (id: string) => Promise<unknown | null>
  createClient: (data: Record<string, unknown>) => Promise<unknown>
  updateClient: (id: string, data: Record<string, unknown>) => Promise<unknown>
  deleteClient: (id: string) => Promise<void>

  // Invoices
  getInvoices: (filters?: Record<string, unknown>) => Promise<unknown[]>
  getInvoice: (id: string) => Promise<unknown | null>
  createInvoice: (data: Record<string, unknown>) => Promise<unknown>
  updateInvoice: (id: string, data: Record<string, unknown>) => Promise<unknown>
  deleteInvoice: (id: string) => Promise<void>

  // Files
  getFiles: (filters?: Record<string, unknown>) => Promise<unknown[]>
  uploadFile: (file: File, metadata?: Record<string, unknown>) => Promise<unknown>
  deleteFile: (id: string) => Promise<void>
  getFileUrl: (id: string) => Promise<string>

  // Messages
  sendMessage: (to: string, content: string, options?: Record<string, unknown>) => Promise<unknown>

  // Calendar
  getEvents: (startDate: Date, endDate: Date) => Promise<unknown[]>
  createEvent: (data: Record<string, unknown>) => Promise<unknown>
  updateEvent: (id: string, data: Record<string, unknown>) => Promise<unknown>
  deleteEvent: (id: string) => Promise<void>

  // Notifications
  sendNotification: (title: string, body: string, options?: {
    type?: 'info' | 'success' | 'warning' | 'error'
    link?: string
    data?: Record<string, unknown>
  }) => Promise<void>

  // Custom API calls
  fetch: (endpoint: string, options?: RequestInit) => Promise<Response>

  // Webhooks
  triggerWebhook: (event: string, data: unknown) => Promise<void>
}

// ============================================================================
// PLUGIN STORAGE
// ============================================================================

export interface PluginStorage {
  get: <T = unknown>(key: string) => Promise<T | null>
  set: <T = unknown>(key: string, value: T) => Promise<void>
  delete: (key: string) => Promise<void>
  clear: () => Promise<void>
  list: () => Promise<string[]>
  getAll: () => Promise<Record<string, unknown>>
}

// ============================================================================
// PLUGIN LOGGER
// ============================================================================

export interface PluginLogger {
  debug: (message: string, data?: unknown) => void
  info: (message: string, data?: unknown) => void
  warn: (message: string, data?: unknown) => void
  error: (message: string, error?: Error | unknown) => void
}

// ============================================================================
// PLUGIN UI
// ============================================================================

export interface PluginUI {
  // Toast notifications
  toast: {
    success: (message: string, options?: { duration?: number }) => void
    error: (message: string, options?: { duration?: number }) => void
    info: (message: string, options?: { duration?: number }) => void
    warning: (message: string, options?: { duration?: number }) => void
  }

  // Dialogs
  showConfirm: (options: {
    title: string
    message: string
    confirmText?: string
    cancelText?: string
    variant?: 'default' | 'destructive'
  }) => Promise<boolean>

  showPrompt: (options: {
    title: string
    message: string
    placeholder?: string
    defaultValue?: string
  }) => Promise<string | null>

  showDialog: (options: {
    title: string
    content: ReactNode
    actions?: Array<{
      label: string
      onClick: () => void
      variant?: 'default' | 'destructive' | 'outline' | 'ghost'
    }>
  }) => Promise<void>

  // Command palette
  registerCommand: (command: {
    id: string
    label: string
    description?: string
    icon?: string
    shortcut?: string
    action: () => void | Promise<void>
  }) => void

  unregisterCommand: (commandId: string) => void
}

// ============================================================================
// PLUGIN DEFINITION
// ============================================================================

export interface Plugin {
  manifest: PluginManifest
  hooks?: PluginHooks
  components?: {
    // Dashboard widget
    Widget?: ComponentType<{ context: PluginContext }>

    // Settings panel
    Settings?: ComponentType<{ context: PluginContext }>

    // Sidebar item
    SidebarItem?: ComponentType<{ context: PluginContext }>

    // Project tab
    ProjectTab?: ComponentType<{ context: PluginContext; projectId: string }>

    // Task tab
    TaskTab?: ComponentType<{ context: PluginContext; taskId: string }>

    // Custom components
    [key: string]: ComponentType<Record<string, unknown>> | undefined
  }
  api?: Record<string, (...args: unknown[]) => Promise<unknown>>
}

// ============================================================================
// INSTALLED PLUGIN
// ============================================================================

export interface InstalledPlugin {
  id: string
  plugin_id: string
  user_id: string
  version: string
  status: PluginStatus
  settings: PluginSettings
  permissions_granted: PluginPermission[]
  installed_at: string
  updated_at: string
  last_error?: string
  error_count: number
  metadata: Record<string, unknown>
}

// ============================================================================
// PLUGIN REGISTRY ENTRY
// ============================================================================

export interface PluginRegistryEntry {
  id: string
  name: string
  slug: string
  description: string
  author: {
    name: string
    email?: string
    url?: string
    verified?: boolean
  }
  category: PluginCategory
  tags: string[]
  version: string
  versions: Array<{
    version: string
    changelog: string
    published_at: string
    downloads: number
  }>
  icon?: string
  banner?: string
  screenshots?: string[]
  permissions: PluginPermission[]
  rating: number
  reviews_count: number
  installs_count: number
  price?: {
    type: 'free' | 'paid' | 'subscription'
    amount?: number
    currency?: string
    period?: 'monthly' | 'yearly' | 'one_time'
  }
  is_verified: boolean
  is_official: boolean
  published_at: string
  updated_at: string
  documentation_url?: string
  support_url?: string
  repository_url?: string
}
