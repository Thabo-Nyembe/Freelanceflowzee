/**
 * Browser Extension Types
 * Complete type system for browser extension and web integration
 */

export type BrowserType = 'chrome' | 'firefox' | 'safari' | 'edge' | 'brave' | 'opera'
export type ExtensionFeature = 'quick-access' | 'page-capture' | 'web-clipper' | 'shortcuts' | 'sync' | 'ai-assistant'
export type ExtensionStatus = 'not-installed' | 'installed' | 'active' | 'disabled' | 'updating'
export type CaptureType = 'screenshot' | 'full-page' | 'selection' | 'video' | 'text'
export type QuickActionType = 'create-task' | 'save-link' | 'share' | 'translate' | 'summarize' | 'analyze'

export interface BrowserExtension {
  id: string
  name: string
  version: string
  description: string
  icon: string
  status: ExtensionStatus
  browser: BrowserType
  installedAt?: Date
  lastUpdated?: Date
  features: ExtensionFeatureInfo[]
  permissions: ExtensionPermission[]
  fileSize: number
  rating: number
  downloads: number
}

export interface ExtensionFeatureInfo {
  id: ExtensionFeature
  name: string
  description: string
  enabled: boolean
  icon: string
  shortcut?: string
}

export interface ExtensionPermission {
  id: string
  name: string
  description: string
  required: boolean
  granted: boolean
  type: 'storage' | 'tabs' | 'cookies' | 'notifications' | 'clipboard' | 'downloads'
}

export interface BrowserInfo {
  type: BrowserType
  name: string
  version: string
  icon: string
  marketUrl: string
  supported: boolean
  minVersion?: string
}

export interface QuickAction {
  id: string
  type: QuickActionType
  name: string
  description: string
  icon: string
  shortcut: string
  enabled: boolean
  config?: Record<string, any>
}

export interface PageCapture {
  id: string
  type: CaptureType
  url: string
  title: string
  timestamp: Date
  fileUrl: string
  fileSize: number
  thumbnail?: string
  tags: string[]
  notes?: string
}

export interface WebClipper {
  id: string
  content: string
  html: string
  url: string
  title: string
  selection?: {
    start: number
    end: number
    text: string
  }
  format: 'markdown' | 'html' | 'text'
  timestamp: Date
  tags: string[]
  folder?: string
}

export interface ExtensionSettings {
  theme: 'light' | 'dark' | 'auto'
  autoSync: boolean
  notifications: boolean
  quickAccessEnabled: boolean
  defaultCaptureType: CaptureType
  defaultSaveLocation: string
  shortcuts: Record<string, string>
  aiFeatures: {
    autoSummarize: boolean
    autoTranslate: boolean
    autoTag: boolean
  }
}

export interface ExtensionStats {
  totalCaptures: number
  totalClips: number
  totalQuickActions: number
  storageUsed: number
  storageLimit: number
  lastSync: Date
  capturesByType: Record<CaptureType, number>
  actionsByType: Record<QuickActionType, number>
}

export interface ExtensionUpdate {
  version: string
  releaseDate: Date
  changes: string[]
  breaking: boolean
  downloadUrl: string
}

export interface ShortcutConfig {
  action: string
  key: string
  modifiers: ('ctrl' | 'alt' | 'shift' | 'meta')[]
  description: string
  global: boolean
}

export interface SyncStatus {
  lastSync: Date
  status: 'synced' | 'syncing' | 'error' | 'pending'
  itemsSynced: number
  itemsPending: number
  conflicts: number
}

export interface ContextMenuAction {
  id: string
  label: string
  icon?: string
  contexts: ('page' | 'selection' | 'link' | 'image' | 'video')[]
  action: QuickActionType
  enabled: boolean
}

export interface BrowserTab {
  id: number
  url: string
  title: string
  favicon?: string
  active: boolean
  pinned: boolean
  muted: boolean
}

export interface ExtensionNotification {
  id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  action?: {
    label: string
    url: string
  }
  timestamp: Date
  read: boolean
}
