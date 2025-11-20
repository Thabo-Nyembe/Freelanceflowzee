/**
 * External Integrations Types
 * Connect with third-party services and APIs
 */

export type IntegrationCategory = 'payment' | 'communication' | 'productivity' | 'analytics' | 'storage' | 'marketing' | 'crm' | 'development'
export type IntegrationStatus = 'connected' | 'disconnected' | 'error' | 'pending'
export type AuthType = 'oauth2' | 'api-key' | 'webhook' | 'basic' | 'custom'

export interface Integration {
  id: string
  name: string
  description: string
  category: IntegrationCategory
  icon: string
  logoUrl?: string
  status: IntegrationStatus
  authType: AuthType
  isPremium: boolean
  isPopular: boolean
  website: string
  documentationUrl: string
}

export interface ConnectedIntegration {
  integrationId: string
  connectedAt: Date
  lastSync?: Date
  config: IntegrationConfig
  credentials: EncryptedCredentials
  webhooks?: Webhook[]
  syncStats: SyncStats
}

export interface IntegrationConfig {
  autoSync: boolean
  syncFrequency?: 'real-time' | 'hourly' | 'daily' | 'weekly'
  features: Record<string, boolean>
  customSettings?: Record<string, any>
}

export interface EncryptedCredentials {
  accessToken?: string
  refreshToken?: string
  apiKey?: string
  secret?: string
  expiresAt?: Date
}

export interface Webhook {
  id: string
  url: string
  events: string[]
  secret: string
  isActive: boolean
  lastTriggered?: Date
}

export interface SyncStats {
  totalSyncs: number
  successfulSyncs: number
  failedSyncs: number
  lastSyncTime?: Date
  lastSyncStatus: 'success' | 'failed' | 'pending'
  dataTransferred: number
}

export interface IntegrationAction {
  id: string
  name: string
  description: string
  integrationId: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE'
  endpoint: string
  parameters: ActionParameter[]
}

export interface ActionParameter {
  name: string
  type: 'string' | 'number' | 'boolean' | 'object' | 'array'
  required: boolean
  description: string
  defaultValue?: any
}

export interface IntegrationTemplate {
  id: string
  name: string
  description: string
  integrations: string[]
  workflow: string
  icon: string
  usageCount: number
}

export interface IntegrationMetrics {
  totalIntegrations: number
  connectedIntegrations: number
  totalSyncs: number
  successRate: number
  averageSyncTime: number
  dataTransferred: number
  mostPopular: string[]
}
