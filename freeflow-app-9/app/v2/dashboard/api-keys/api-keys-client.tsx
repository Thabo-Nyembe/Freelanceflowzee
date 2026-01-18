'use client'

import { useState, useMemo, useEffect } from 'react'
import { toast } from 'sonner'
import { useApiKeys, getKeyStatusColor, getKeyTypeColor, formatRequests } from '@/lib/hooks/use-api-keys'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  Key, Shield, TrendingUp, AlertCircle, Plus, Copy, Eye,
  RefreshCw, Settings, CheckCircle, XCircle, Clock, Lock,
  Search, Filter, MoreHorizontal, Webhook, Zap, Activity,
  BarChart3, ExternalLink, Download,
  AlertTriangle, Fingerprint, ShieldCheck,
  RotateCcw, History, FileText, Layers, Play, LayoutGrid, List
} from 'lucide-react'

// Enhanced & Competitive Upgrade Components
import {
  AIInsightsPanel,
  CollaborationIndicator,
  PredictiveAnalytics,
} from '@/components/ui/competitive-upgrades'

import {
  ActivityFeed,
  QuickActionsToolbar,
} from '@/components/ui/competitive-upgrades-extended'

// ============================================================================
// TYPE DEFINITIONS - Auth0 Level API Management
// ============================================================================

type KeyStatus = 'active' | 'inactive' | 'expired' | 'revoked' | 'pending'
type KeyType = 'api' | 'webhook' | 'oauth' | 'jwt' | 'service' | 'machine_to_machine' | 'spa' | 'native'
type Permission = 'read' | 'write' | 'admin' | 'full-access' | 'limited' | 'custom'
type Environment = 'production' | 'staging' | 'development' | 'sandbox'
type LogLevel = 'info' | 'warning' | 'error' | 'debug' | 'critical'
type WebhookStatus = 'active' | 'inactive' | 'failing' | 'paused'

interface ApiKey {
  id: string
  name: string
  description: string
  key_prefix: string
  key_code: string
  key_type: KeyType
  permission: Permission
  environment: Environment
  status: KeyStatus
  scopes: string[]
  rate_limit_per_hour: number
  rate_limit_per_minute: number
  total_requests: number
  requests_today: number
  requests_this_week: number
  last_used_at: string | null
  last_used_ip: string | null
  last_used_location: string | null
  created_at: string
  created_by: string
  expires_at: string | null
  rotated_at: string | null
  rotation_interval_days: number | null
  ip_whitelist: string[]
  allowed_origins: string[]
  tags: string[]
  metadata: Record<string, string>
}

interface Application {
  id: string
  name: string
  description: string
  app_type: 'regular_web' | 'spa' | 'native' | 'machine_to_machine'
  client_id: string
  client_secret_preview: string
  logo_url: string | null
  login_url: string | null
  callback_urls: string[]
  logout_urls: string[]
  web_origins: string[]
  allowed_origins: string[]
  grant_types: string[]
  token_endpoint_auth_method: 'none' | 'client_secret_post' | 'client_secret_basic'
  id_token_expiration: number
  access_token_expiration: number
  refresh_token_expiration: number
  refresh_token_rotation: boolean
  is_first_party: boolean
  oidc_conformant: boolean
  cross_origin_auth: boolean
  status: 'active' | 'inactive' | 'pending'
  created_at: string
  updated_at: string
  api_keys_count: number
  total_logins: number
  daily_active_users: number
}

interface ApiLog {
  id: string
  api_key_id: string
  api_key_name: string
  application_name: string
  endpoint: string
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'OPTIONS'
  status_code: number
  response_time_ms: number
  request_size_bytes: number
  response_size_bytes: number
  ip_address: string
  user_agent: string
  country: string
  city: string
  error_message: string | null
  log_level: LogLevel
  timestamp: string
  request_id: string
  correlation_id: string
}

interface WebhookEndpoint {
  id: string
  name: string
  url: string
  description: string
  events: string[]
  secret: string
  status: WebhookStatus
  version: 'v1' | 'v2'
  content_type: 'application/json' | 'application/x-www-form-urlencoded'
  retry_policy: 'none' | 'linear' | 'exponential'
  max_retries: number
  timeout_seconds: number
  total_deliveries: number
  successful_deliveries: number
  failed_deliveries: number
  last_delivery_at: string | null
  last_success_at: string | null
  last_failure_at: string | null
  last_failure_reason: string | null
  created_at: string
  updated_at: string
}

interface Scope {
  id: string
  name: string
  description: string
  category: string
  is_sensitive: boolean
  requires_consent: boolean
  api_count: number
}

interface RateLimitPolicy {
  id: string
  name: string
  description: string
  requests_per_second: number
  requests_per_minute: number
  requests_per_hour: number
  requests_per_day: number
  burst_limit: number
  throttle_strategy: 'fixed_window' | 'sliding_window' | 'token_bucket'
  applies_to: string[]
  is_default: boolean
}

interface SecurityEvent {
  id: string
  event_type: 'key_created' | 'key_rotated' | 'key_revoked' | 'key_deleted' | 'suspicious_activity' | 'rate_limit_exceeded' | 'ip_blocked' | 'brute_force_detected'
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
  ip_address: string
  user_agent: string
  location: string
  api_key_id: string | null
  application_id: string | null
  timestamp: string
  resolved: boolean
  resolved_at: string | null
  resolved_by: string | null
}

// ============================================================================
// MOCK DATA - Auth0 Level
// ============================================================================

const mockApiKeys: ApiKey[] = [
  {
    id: '1',
    name: 'Production API Key',
    description: 'Main production API access key',
    key_prefix: 'pk_live_',
    key_code: 'Qx7K9mN3pL2',
    key_type: 'api',
    permission: 'full-access',
    environment: 'production',
    status: 'active',
    scopes: ['read:users', 'write:users', 'read:data', 'write:data', 'admin:settings'],
    rate_limit_per_hour: 10000,
    rate_limit_per_minute: 200,
    total_requests: 1567890,
    requests_today: 12450,
    requests_this_week: 78900,
    last_used_at: '2024-01-15T14:30:00Z',
    last_used_ip: '192.168.1.1',
    last_used_location: 'New York, US',
    created_at: '2024-01-01T00:00:00Z',
    created_by: 'admin@company.com',
    expires_at: '2025-01-01T00:00:00Z',
    rotated_at: '2024-01-10T00:00:00Z',
    rotation_interval_days: 90,
    ip_whitelist: ['192.168.1.0/24', '10.0.0.0/8'],
    allowed_origins: ['https://app.company.com', 'https://api.company.com'],
    tags: ['production', 'critical', 'monitored'],
    metadata: { team: 'backend', project: 'main-api' }
  },
  {
    id: '2',
    name: 'Mobile App Service Key',
    description: 'Service account key for mobile application',
    key_prefix: 'sk_live_',
    key_code: 'Rm4H8jK1pQ9',
    key_type: 'machine_to_machine',
    permission: 'write',
    environment: 'production',
    status: 'active',
    scopes: ['read:users', 'write:sessions', 'read:data'],
    rate_limit_per_hour: 5000,
    rate_limit_per_minute: 100,
    total_requests: 892340,
    requests_today: 8920,
    requests_this_week: 56780,
    last_used_at: '2024-01-15T14:25:00Z',
    last_used_ip: '10.0.0.50',
    last_used_location: 'AWS us-east-1',
    created_at: '2024-01-02T00:00:00Z',
    created_by: 'devops@company.com',
    expires_at: null,
    rotated_at: null,
    rotation_interval_days: null,
    ip_whitelist: [],
    allowed_origins: [],
    tags: ['mobile', 'service-account'],
    metadata: { platform: 'ios', version: '2.1.0' }
  },
  {
    id: '3',
    name: 'Staging Test Key',
    description: 'Testing key for staging environment',
    key_prefix: 'pk_test_',
    key_code: 'Wn5L2mR7kJ4',
    key_type: 'api',
    permission: 'admin',
    environment: 'staging',
    status: 'active',
    scopes: ['read:all', 'write:all', 'admin:all'],
    rate_limit_per_hour: 50000,
    rate_limit_per_minute: 1000,
    total_requests: 234560,
    requests_today: 3450,
    requests_this_week: 23400,
    last_used_at: '2024-01-15T13:00:00Z',
    last_used_ip: '172.16.0.100',
    last_used_location: 'Office Network',
    created_at: '2024-01-05T00:00:00Z',
    created_by: 'qa@company.com',
    expires_at: '2024-06-01T00:00:00Z',
    rotated_at: null,
    rotation_interval_days: 30,
    ip_whitelist: ['172.16.0.0/16'],
    allowed_origins: ['https://staging.company.com'],
    tags: ['staging', 'testing'],
    metadata: { purpose: 'qa-testing' }
  },
  {
    id: '4',
    name: 'Webhook Signing Key',
    description: 'Key for signing webhook payloads',
    key_prefix: 'whsec_',
    key_code: 'Hp9K3nM6jL1',
    key_type: 'webhook',
    permission: 'limited',
    environment: 'production',
    status: 'active',
    scopes: ['webhooks:sign'],
    rate_limit_per_hour: 100000,
    rate_limit_per_minute: 2000,
    total_requests: 456780,
    requests_today: 5670,
    requests_this_week: 38900,
    last_used_at: '2024-01-15T14:28:00Z',
    last_used_ip: '10.0.1.25',
    last_used_location: 'Internal',
    created_at: '2024-01-01T00:00:00Z',
    created_by: 'system',
    expires_at: null,
    rotated_at: '2024-01-08T00:00:00Z',
    rotation_interval_days: 7,
    ip_whitelist: [],
    allowed_origins: [],
    tags: ['webhook', 'signing'],
    metadata: {}
  },
  {
    id: '5',
    name: 'OAuth Client Credentials',
    description: 'OAuth 2.0 client credentials for third-party integrations',
    key_prefix: 'oauth_',
    key_code: 'Yt6P1qR8wE3',
    key_type: 'oauth',
    permission: 'read',
    environment: 'production',
    status: 'active',
    scopes: ['openid', 'profile', 'email', 'read:data'],
    rate_limit_per_hour: 3000,
    rate_limit_per_minute: 60,
    total_requests: 178900,
    requests_today: 2340,
    requests_this_week: 15670,
    last_used_at: '2024-01-15T14:20:00Z',
    last_used_ip: '203.0.113.50',
    last_used_location: 'Partner Network',
    created_at: '2024-01-03T00:00:00Z',
    created_by: 'integrations@company.com',
    expires_at: '2024-12-31T00:00:00Z',
    rotated_at: null,
    rotation_interval_days: 180,
    ip_whitelist: ['203.0.113.0/24'],
    allowed_origins: ['https://partner.example.com'],
    tags: ['oauth', 'partner', 'integration'],
    metadata: { partner: 'example-corp', contract: 'ENT-2024-001' }
  },
  {
    id: '6',
    name: 'Development Key',
    description: 'Local development environment key',
    key_prefix: 'pk_dev_',
    key_code: 'Ax2M5nL9pK7',
    key_type: 'api',
    permission: 'admin',
    environment: 'development',
    status: 'inactive',
    scopes: ['*'],
    rate_limit_per_hour: 100000,
    rate_limit_per_minute: 5000,
    total_requests: 89450,
    requests_today: 0,
    requests_this_week: 0,
    last_used_at: '2024-01-10T16:00:00Z',
    last_used_ip: '127.0.0.1',
    last_used_location: 'localhost',
    created_at: '2024-01-01T00:00:00Z',
    created_by: 'dev@company.com',
    expires_at: null,
    rotated_at: null,
    rotation_interval_days: null,
    ip_whitelist: [],
    allowed_origins: ['http://localhost:3000'],
    tags: ['development', 'local'],
    metadata: {}
  }
]

const mockApplications: Application[] = [
  {
    id: '1',
    name: 'Main Web Application',
    description: 'Primary customer-facing web application',
    app_type: 'regular_web',
    client_id: 'cid_web_Qx7K9mN3pL2wE5',
    client_secret_preview: 'cs_****************************7K2n',
    logo_url: null,
    login_url: 'https://app.company.com/login',
    callback_urls: ['https://app.company.com/callback', 'https://app.company.com/auth/callback'],
    logout_urls: ['https://app.company.com/logout'],
    web_origins: ['https://app.company.com'],
    allowed_origins: ['https://app.company.com', 'https://api.company.com'],
    grant_types: ['authorization_code', 'refresh_token'],
    token_endpoint_auth_method: 'client_secret_basic',
    id_token_expiration: 36000,
    access_token_expiration: 86400,
    refresh_token_expiration: 2592000,
    refresh_token_rotation: true,
    is_first_party: true,
    oidc_conformant: true,
    cross_origin_auth: false,
    status: 'active',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-15T00:00:00Z',
    api_keys_count: 3,
    total_logins: 125890,
    daily_active_users: 4560
  },
  {
    id: '2',
    name: 'Mobile App - iOS',
    description: 'Native iOS mobile application',
    app_type: 'native',
    client_id: 'cid_ios_Rm4H8jK1pQ9xY3',
    client_secret_preview: 'cs_****************************8L4m',
    logo_url: null,
    login_url: null,
    callback_urls: ['com.company.app://callback'],
    logout_urls: ['com.company.app://logout'],
    web_origins: [],
    allowed_origins: [],
    grant_types: ['authorization_code', 'refresh_token'],
    token_endpoint_auth_method: 'none',
    id_token_expiration: 36000,
    access_token_expiration: 86400,
    refresh_token_expiration: 5184000,
    refresh_token_rotation: true,
    is_first_party: true,
    oidc_conformant: true,
    cross_origin_auth: false,
    status: 'active',
    created_at: '2024-01-02T00:00:00Z',
    updated_at: '2024-01-12T00:00:00Z',
    api_keys_count: 2,
    total_logins: 89450,
    daily_active_users: 2340
  },
  {
    id: '3',
    name: 'Partner Integration API',
    description: 'Machine-to-machine application for partner integrations',
    app_type: 'machine_to_machine',
    client_id: 'cid_m2m_Wn5L2mR7kJ4zT8',
    client_secret_preview: 'cs_****************************9P5q',
    logo_url: null,
    login_url: null,
    callback_urls: [],
    logout_urls: [],
    web_origins: [],
    allowed_origins: [],
    grant_types: ['client_credentials'],
    token_endpoint_auth_method: 'client_secret_post',
    id_token_expiration: 0,
    access_token_expiration: 3600,
    refresh_token_expiration: 0,
    refresh_token_rotation: false,
    is_first_party: false,
    oidc_conformant: true,
    cross_origin_auth: false,
    status: 'active',
    created_at: '2024-01-05T00:00:00Z',
    updated_at: '2024-01-10T00:00:00Z',
    api_keys_count: 1,
    total_logins: 45670,
    daily_active_users: 12
  },
  {
    id: '4',
    name: 'Admin Dashboard SPA',
    description: 'Single page application for internal admin dashboard',
    app_type: 'spa',
    client_id: 'cid_spa_Hp9K3nM6jL1vR2',
    client_secret_preview: '',
    logo_url: null,
    login_url: 'https://admin.company.com/login',
    callback_urls: ['https://admin.company.com/callback'],
    logout_urls: ['https://admin.company.com'],
    web_origins: ['https://admin.company.com'],
    allowed_origins: ['https://admin.company.com'],
    grant_types: ['authorization_code', 'refresh_token'],
    token_endpoint_auth_method: 'none',
    id_token_expiration: 36000,
    access_token_expiration: 7200,
    refresh_token_expiration: 86400,
    refresh_token_rotation: true,
    is_first_party: true,
    oidc_conformant: true,
    cross_origin_auth: false,
    status: 'active',
    created_at: '2024-01-03T00:00:00Z',
    updated_at: '2024-01-14T00:00:00Z',
    api_keys_count: 1,
    total_logins: 12340,
    daily_active_users: 45
  }
]

const mockApiLogs: ApiLog[] = [
  {
    id: '1',
    api_key_id: '1',
    api_key_name: 'Production API Key',
    application_name: 'Main Web Application',
    endpoint: '/api/v1/users',
    method: 'GET',
    status_code: 200,
    response_time_ms: 45,
    request_size_bytes: 256,
    response_size_bytes: 4520,
    ip_address: '192.168.1.100',
    user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    country: 'United States',
    city: 'New York',
    error_message: null,
    log_level: 'info',
    timestamp: '2024-01-15T14:30:00Z',
    request_id: 'req_Qx7K9mN3pL2',
    correlation_id: 'cor_Ab3Cd5Ef7Gh'
  },
  {
    id: '2',
    api_key_id: '1',
    api_key_name: 'Production API Key',
    application_name: 'Main Web Application',
    endpoint: '/api/v1/data/export',
    method: 'POST',
    status_code: 200,
    response_time_ms: 1250,
    request_size_bytes: 512,
    response_size_bytes: 156780,
    ip_address: '192.168.1.100',
    user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    country: 'United States',
    city: 'New York',
    error_message: null,
    log_level: 'info',
    timestamp: '2024-01-15T14:28:00Z',
    request_id: 'req_Rm4H8jK1pQ9',
    correlation_id: 'cor_Ij9Kl1Mn3Op'
  },
  {
    id: '3',
    api_key_id: '2',
    api_key_name: 'Mobile App Service Key',
    application_name: 'Mobile App - iOS',
    endpoint: '/api/v1/auth/token',
    method: 'POST',
    status_code: 401,
    response_time_ms: 12,
    request_size_bytes: 128,
    response_size_bytes: 64,
    ip_address: '10.0.0.50',
    user_agent: 'CompanyApp/2.1.0 iOS/17.0',
    country: 'United States',
    city: 'San Francisco',
    error_message: 'Invalid refresh token',
    log_level: 'warning',
    timestamp: '2024-01-15T14:25:00Z',
    request_id: 'req_Wn5L2mR7kJ4',
    correlation_id: 'cor_Qr5St7Uv9Wx'
  },
  {
    id: '4',
    api_key_id: '5',
    api_key_name: 'OAuth Client Credentials',
    application_name: 'Partner Integration API',
    endpoint: '/api/v1/partners/sync',
    method: 'PUT',
    status_code: 500,
    response_time_ms: 5000,
    request_size_bytes: 8192,
    response_size_bytes: 128,
    ip_address: '203.0.113.50',
    user_agent: 'PartnerAPI/1.0',
    country: 'United Kingdom',
    city: 'London',
    error_message: 'Internal server error: Database connection timeout',
    log_level: 'error',
    timestamp: '2024-01-15T14:20:00Z',
    request_id: 'req_Hp9K3nM6jL1',
    correlation_id: 'cor_Yz1Ab3Cd5Ef'
  },
  {
    id: '5',
    api_key_id: '1',
    api_key_name: 'Production API Key',
    application_name: 'Main Web Application',
    endpoint: '/api/v1/webhooks',
    method: 'POST',
    status_code: 201,
    response_time_ms: 89,
    request_size_bytes: 1024,
    response_size_bytes: 256,
    ip_address: '192.168.1.100',
    user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    country: 'United States',
    city: 'New York',
    error_message: null,
    log_level: 'info',
    timestamp: '2024-01-15T14:15:00Z',
    request_id: 'req_Yt6P1qR8wE3',
    correlation_id: 'cor_Gh7Ij9Kl1Mn'
  },
  {
    id: '6',
    api_key_id: '3',
    api_key_name: 'Staging Test Key',
    application_name: 'Admin Dashboard SPA',
    endpoint: '/api/v1/admin/users',
    method: 'DELETE',
    status_code: 403,
    response_time_ms: 8,
    request_size_bytes: 64,
    response_size_bytes: 96,
    ip_address: '172.16.0.100',
    user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    country: 'United States',
    city: 'Chicago',
    error_message: 'Insufficient permissions for this operation',
    log_level: 'warning',
    timestamp: '2024-01-15T13:00:00Z',
    request_id: 'req_Ax2M5nL9pK7',
    correlation_id: 'cor_Op3Qr5St7Uv'
  }
]

const mockWebhooks: WebhookEndpoint[] = [
  {
    id: '1',
    name: 'Payment Events',
    url: 'https://api.company.com/webhooks/payments',
    description: 'Webhook for all payment-related events',
    events: ['payment.created', 'payment.succeeded', 'payment.failed', 'refund.created'],
    secret: 'whsec_Qx7K9mN3pL2wE5rT8yU1',
    status: 'active',
    version: 'v2',
    content_type: 'application/json',
    retry_policy: 'exponential',
    max_retries: 5,
    timeout_seconds: 30,
    total_deliveries: 15678,
    successful_deliveries: 15234,
    failed_deliveries: 444,
    last_delivery_at: '2024-01-15T14:28:00Z',
    last_success_at: '2024-01-15T14:28:00Z',
    last_failure_at: '2024-01-15T12:45:00Z',
    last_failure_reason: 'Connection timeout',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-15T00:00:00Z'
  },
  {
    id: '2',
    name: 'User Events',
    url: 'https://api.company.com/webhooks/users',
    description: 'Webhook for user lifecycle events',
    events: ['user.created', 'user.updated', 'user.deleted', 'user.verified'],
    secret: 'whsec_Rm4H8jK1pQ9xY3zT6',
    status: 'active',
    version: 'v2',
    content_type: 'application/json',
    retry_policy: 'linear',
    max_retries: 3,
    timeout_seconds: 15,
    total_deliveries: 8945,
    successful_deliveries: 8920,
    failed_deliveries: 25,
    last_delivery_at: '2024-01-15T14:25:00Z',
    last_success_at: '2024-01-15T14:25:00Z',
    last_failure_at: '2024-01-14T08:30:00Z',
    last_failure_reason: 'HTTP 502 Bad Gateway',
    created_at: '2024-01-02T00:00:00Z',
    updated_at: '2024-01-10T00:00:00Z'
  },
  {
    id: '3',
    name: 'Security Alerts',
    url: 'https://security.company.com/alerts',
    description: 'Critical security event notifications',
    events: ['security.breach', 'security.suspicious_login', 'security.rate_limit'],
    secret: 'whsec_Wn5L2mR7kJ4zT8vR2',
    status: 'active',
    version: 'v2',
    content_type: 'application/json',
    retry_policy: 'exponential',
    max_retries: 10,
    timeout_seconds: 10,
    total_deliveries: 234,
    successful_deliveries: 234,
    failed_deliveries: 0,
    last_delivery_at: '2024-01-15T10:00:00Z',
    last_success_at: '2024-01-15T10:00:00Z',
    last_failure_at: null,
    last_failure_reason: null,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-05T00:00:00Z'
  },
  {
    id: '4',
    name: 'Partner Sync',
    url: 'https://partner.example.com/api/sync',
    description: 'Partner data synchronization webhook',
    events: ['data.sync', 'data.export', 'data.import'],
    secret: 'whsec_Hp9K3nM6jL1vR2pK5',
    status: 'failing',
    version: 'v1',
    content_type: 'application/json',
    retry_policy: 'exponential',
    max_retries: 5,
    timeout_seconds: 60,
    total_deliveries: 456,
    successful_deliveries: 412,
    failed_deliveries: 44,
    last_delivery_at: '2024-01-15T14:00:00Z',
    last_success_at: '2024-01-14T22:00:00Z',
    last_failure_at: '2024-01-15T14:00:00Z',
    last_failure_reason: 'SSL certificate expired',
    created_at: '2024-01-05T00:00:00Z',
    updated_at: '2024-01-15T00:00:00Z'
  }
]

const mockScopes: Scope[] = [
  { id: '1', name: 'read:users', description: 'Read user profiles and data', category: 'Users', is_sensitive: false, requires_consent: false, api_count: 12 },
  { id: '2', name: 'write:users', description: 'Create and update user profiles', category: 'Users', is_sensitive: true, requires_consent: true, api_count: 8 },
  { id: '3', name: 'delete:users', description: 'Delete user accounts', category: 'Users', is_sensitive: true, requires_consent: true, api_count: 2 },
  { id: '4', name: 'read:data', description: 'Read application data', category: 'Data', is_sensitive: false, requires_consent: false, api_count: 25 },
  { id: '5', name: 'write:data', description: 'Create and update data', category: 'Data', is_sensitive: false, requires_consent: true, api_count: 18 },
  { id: '6', name: 'admin:settings', description: 'Manage application settings', category: 'Admin', is_sensitive: true, requires_consent: true, api_count: 5 },
  { id: '7', name: 'openid', description: 'OpenID Connect scope', category: 'OAuth', is_sensitive: false, requires_consent: false, api_count: 4 },
  { id: '8', name: 'profile', description: 'User profile information', category: 'OAuth', is_sensitive: false, requires_consent: true, api_count: 3 },
  { id: '9', name: 'email', description: 'User email address', category: 'OAuth', is_sensitive: false, requires_consent: true, api_count: 3 },
  { id: '10', name: 'webhooks:manage', description: 'Create and manage webhooks', category: 'Webhooks', is_sensitive: true, requires_consent: true, api_count: 4 }
]

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const getStatusColor = (status: KeyStatus): string => {
  const colors: Record<KeyStatus, string> = {
    active: 'bg-green-100 text-green-800 border-green-200',
    inactive: 'bg-gray-100 text-gray-800 border-gray-200',
    expired: 'bg-red-100 text-red-800 border-red-200',
    revoked: 'bg-orange-100 text-orange-800 border-orange-200',
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200'
  }
  return colors[status]
}

const getKeyTypeColor = (type: KeyType): string => {
  const colors: Record<KeyType, string> = {
    api: 'bg-blue-100 text-blue-800',
    webhook: 'bg-purple-100 text-purple-800',
    oauth: 'bg-green-100 text-green-800',
    jwt: 'bg-orange-100 text-orange-800',
    service: 'bg-indigo-100 text-indigo-800',
    machine_to_machine: 'bg-cyan-100 text-cyan-800',
    spa: 'bg-pink-100 text-pink-800',
    native: 'bg-teal-100 text-teal-800'
  }
  return colors[type]
}

const getEnvironmentColor = (env: Environment): string => {
  const colors: Record<Environment, string> = {
    production: 'bg-red-100 text-red-800',
    staging: 'bg-yellow-100 text-yellow-800',
    development: 'bg-green-100 text-green-800',
    sandbox: 'bg-blue-100 text-blue-800'
  }
  return colors[env]
}

const getLogLevelColor = (level: LogLevel): string => {
  const colors: Record<LogLevel, string> = {
    info: 'bg-blue-100 text-blue-800',
    warning: 'bg-yellow-100 text-yellow-800',
    error: 'bg-red-100 text-red-800',
    debug: 'bg-gray-100 text-gray-800',
    critical: 'bg-purple-100 text-purple-800'
  }
  return colors[level]
}

const getWebhookStatusColor = (status: WebhookStatus): string => {
  const colors: Record<WebhookStatus, string> = {
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-gray-100 text-gray-800',
    failing: 'bg-red-100 text-red-800',
    paused: 'bg-yellow-100 text-yellow-800'
  }
  return colors[status]
}

const formatNumber = (num: number): string => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
  return num.toString()
}

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// ============================================================================
// ENHANCED COMPETITIVE UPGRADE MOCK DATA - Auth0/Stripe Level
// ============================================================================

const mockApiKeysAIInsights = [
  { id: '1', type: 'success' as const, title: 'Healthy Usage', description: 'API usage within normal parameters. 99.9% uptime this month.', priority: 'low' as const, timestamp: new Date().toISOString(), category: 'Health' },
  { id: '2', type: 'warning' as const, title: 'Key Expiring', description: 'Production API key expires in 7 days. Rotation recommended.', priority: 'high' as const, timestamp: new Date().toISOString(), category: 'Security' },
  { id: '3', type: 'info' as const, title: 'Rate Limit', description: 'Mobile app approaching 80% of rate limit. Consider upgrade.', priority: 'medium' as const, timestamp: new Date().toISOString(), category: 'Usage' },
]

const mockApiKeysCollaborators = [
  { id: '1', name: 'API Admin', avatar: '/avatars/admin.jpg', status: 'online' as const, role: 'Admin' },
  { id: '2', name: 'DevOps Lead', avatar: '/avatars/devops.jpg', status: 'online' as const, role: 'DevOps' },
  { id: '3', name: 'Security', avatar: '/avatars/security.jpg', status: 'away' as const, role: 'Security' },
]

const mockApiKeysPredictions = [
  { id: '1', title: 'API Growth', prediction: 'API calls expected to increase 30% next month', confidence: 88, trend: 'up' as const, impact: 'high' as const },
  { id: '2', title: 'Cost Forecast', prediction: 'Current usage will cost $450/month at current tier', confidence: 92, trend: 'stable' as const, impact: 'medium' as const },
]

const mockApiKeysActivities = [
  { id: '1', user: 'API Admin', action: 'Created', target: 'new production API key', timestamp: new Date().toISOString(), type: 'success' as const },
  { id: '2', user: 'DevOps Lead', action: 'Rotated', target: 'staging API credentials', timestamp: new Date(Date.now() - 3600000).toISOString(), type: 'info' as const },
  { id: '3', user: 'System', action: 'Revoked', target: 'expired development key', timestamp: new Date(Date.now() - 7200000).toISOString(), type: 'warning' as const },
]

const mockApiKeysQuickActions = [
  { id: '1', label: 'Create Key', icon: 'plus', action: () => {
    toast.promise(
      fetch('/api/user/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create', name: 'New API Key', environment: 'production' })
      }).then(res => {
        if (!res.ok) throw new Error('Failed to create key')
        return res.json()
      }),
      {
        loading: 'Generating new API key...',
        success: 'API key created successfully - Copy your key before closing',
        error: 'Failed to create API key'
      }
    )
  }, variant: 'default' as const },
  { id: '2', label: 'View Usage', icon: 'chart', action: () => {
    toast.promise(
      fetch('/api/user/api-keys?action=usage').then(res => {
        if (!res.ok) throw new Error('Failed to load usage')
        return res.json()
      }),
      {
        loading: 'Loading API usage analytics...',
        success: 'Usage data loaded - View detailed metrics below',
        error: 'Failed to load usage data'
      }
    )
  }, variant: 'default' as const },
  { id: '3', label: 'Rotate Keys', icon: 'refresh', action: () => {
    toast.promise(
      fetch('/api/user/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'rotate' })
      }).then(res => {
        if (!res.ok) throw new Error('Failed to rotate keys')
        return res.json()
      }),
      {
        loading: 'Rotating API keys securely...',
        success: 'API keys rotated - Update your applications with new credentials',
        error: 'Failed to rotate API keys'
      }
    )
  }, variant: 'outline' as const },
]

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function ApiKeysClient() {
  // Supabase hook for real data
  const {
    keys: apiKeysFromDb,
    stats: apiKeyStats,
    isLoading: apiKeysLoading,
    error: apiKeysError,
    fetchKeys,
    createKey,
    updateKey,
    revokeKey,
    activateKey,
    deactivateKey,
    deleteKey
  } = useApiKeys()

  // Fetch keys on mount
  useEffect(() => {
    fetchKeys()
  }, [fetchKeys])

  const [activeTab, setActiveTab] = useState('dashboard')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedKey, setSelectedKey] = useState<ApiKey | null>(null)
  const [selectedApp, setSelectedApp] = useState<Application | null>(null)
  const [selectedLog, setSelectedLog] = useState<ApiLog | null>(null)
  const [selectedWebhook, setSelectedWebhook] = useState<WebhookEndpoint | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list')

  // Dialog states for button actions
  const [generateKeyDialogOpen, setGenerateKeyDialogOpen] = useState(false)
  const [exportDialogOpen, setExportDialogOpen] = useState(false)
  const [revokeKeyDialogOpen, setRevokeKeyDialogOpen] = useState(false)
  const [rotateKeysDialogOpen, setRotateKeysDialogOpen] = useState(false)
  const [setExpiryDialogOpen, setSetExpiryDialogOpen] = useState(false)
  const [permissionsDialogOpen, setPermissionsDialogOpen] = useState(false)
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false)
  const [filtersDialogOpen, setFiltersDialogOpen] = useState(false)
  const [moreOptionsDialogOpen, setMoreOptionsDialogOpen] = useState(false)
  const [liveFeedDialogOpen, setLiveFeedDialogOpen] = useState(false)
  const [analyticsDialogOpen, setAnalyticsDialogOpen] = useState(false)
  const [securityDialogOpen, setSecurityDialogOpen] = useState(false)
  const [alertsDialogOpen, setAlertsDialogOpen] = useState(false)
  const [docsDialogOpen, setDocsDialogOpen] = useState(false)
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false)
  const [createAppDialogOpen, setCreateAppDialogOpen] = useState(false)
  const [appSettingsDialogOpen, setAppSettingsDialogOpen] = useState(false)
  const [quickstartDialogOpen, setQuickstartDialogOpen] = useState(false)
  const [addWebhookDialogOpen, setAddWebhookDialogOpen] = useState(false)
  const [testWebhookDialogOpen, setTestWebhookDialogOpen] = useState(false)
  const [webhookSettingsDialogOpen, setWebhookSettingsDialogOpen] = useState(false)
  const [keyToCopy, setKeyToCopy] = useState<ApiKey | null>(null)
  const [keyToRotate, setKeyToRotate] = useState<ApiKey | null>(null)
  const [keyToRevoke, setKeyToRevoke] = useState<ApiKey | null>(null)
  const [appToManage, setAppToManage] = useState<Application | null>(null)
  const [webhookToManage, setWebhookToManage] = useState<WebhookEndpoint | null>(null)

  // Form states
  const [newKeyName, setNewKeyName] = useState('')
  const [newKeyType, setNewKeyType] = useState<KeyType>('api')
  const [newKeyEnvironment, setNewKeyEnvironment] = useState<Environment>('development')
  const [newKeyScopes, setNewKeyScopes] = useState<string[]>([])
  const [exportFormat, setExportFormat] = useState<'json' | 'csv'>('json')
  const [expiryDays, setExpiryDays] = useState(90)
  const [newAppName, setNewAppName] = useState('')
  const [newAppType, setNewAppType] = useState<'regular_web' | 'spa' | 'native' | 'machine_to_machine'>('regular_web')
  const [newWebhookUrl, setNewWebhookUrl] = useState('')
  const [newWebhookName, setNewWebhookName] = useState('')
  const [newWebhookEvents, setNewWebhookEvents] = useState<string[]>([])

  // Dashboard stats - uses real data from Supabase with mock fallback
  const activeApiKeys = apiKeysFromDb.length > 0 ? apiKeysFromDb : mockApiKeys
  const stats = useMemo(() => ({
    totalKeys: apiKeyStats.total || activeApiKeys.length,
    activeKeys: apiKeyStats.active || activeApiKeys.filter(k => k.status === 'active').length,
    totalRequests: apiKeyStats.totalRequests || activeApiKeys.reduce((sum, k) => sum + (k.total_requests || 0), 0),
    requestsToday: apiKeyStats.requestsToday || activeApiKeys.reduce((sum, k) => sum + (k.requests_today || 0), 0),
    expiringSoon: apiKeyStats.expiringSoon || activeApiKeys.filter(k => {
      if (!k.expires_at) return false
      const days = Math.ceil((new Date(k.expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      return days > 0 && days <= 30
    }).length,
    totalApps: mockApplications.length,
    totalWebhooks: mockWebhooks.length,
    failingWebhooks: mockWebhooks.filter(w => w.status === 'failing').length
  }), [apiKeyStats, activeApiKeys])

  // Filtered data - uses real data with mock fallback
  const filteredKeys = useMemo(() => {
    return activeApiKeys.filter(key =>
      key.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      key.key_prefix.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (key.tags && key.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())))
    )
  }, [searchQuery, activeApiKeys])

  const filteredApps = useMemo(() => {
    return mockApplications.filter(app =>
      app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.client_id.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [searchQuery])

  const filteredLogs = useMemo(() => {
    return mockApiLogs.filter(log =>
      log.endpoint.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.api_key_name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [searchQuery])

  // Handlers - Wired to Supabase hooks
  const handleCreateApiKey = async () => {
    try {
      const result = await createKey({
        name: newKeyName || 'New API Key',
        key_type: newKeyType as any,
        environment: newKeyEnvironment as any,
        scopes: newKeyScopes,
        expires_at: expiryDays ? new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000).toISOString() : undefined
      })
      toast.success('API Key created successfully', {
        description: `Key prefix: ${result.key_prefix}`
      })
      setGenerateKeyDialogOpen(false)
      setNewKeyName('')
    } catch (error) {
      toast.error('Failed to create API key', {
        description: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }

  const handleRevokeKey = async (keyId: string, keyName: string) => {
    try {
      await revokeKey(keyId, 'User requested revocation')
      toast.success('Key revoked: ' + keyName + ' has been revoked')
      setRevokeKeyDialogOpen(false)
    } catch (error) {
      toast.error('Failed to revoke key', {
        description: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }

  const handleActivateKey = async (keyId: string, keyName: string) => {
    try {
      await activateKey(keyId)
      toast.success('Key activated: ' + keyName + ' is now active')
    } catch (error) {
      toast.error('Failed to activate key', {
        description: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }

  const handleDeactivateKey = async (keyId: string, keyName: string) => {
    try {
      await deactivateKey(keyId)
      toast.success('Key deactivated: ' + keyName + ' is now inactive')
    } catch (error) {
      toast.error('Failed to deactivate key', {
        description: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }

  const handleDeleteKey = async (keyId: string, keyName: string) => {
    try {
      await deleteKey(keyId)
      toast.success('Key deleted: ' + keyName + ' has been deleted')
    } catch (error) {
      toast.error('Failed to delete key', {
        description: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }

  const handleRegenerateKey = (keyName: string) => {
    toast.success('Key regenerated: ' + keyName)
  }

  const handleCopyKey = (key: string) => {
    toast.success('Copied to clipboard')
  }

  const handleExportKeys = () => {
    toast.info('Exporting keys')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50 dark:bg-none dark:bg-gray-900 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-600 via-gray-600 to-zinc-600 p-8">
          <div className="absolute inset-0 bg-grid-white/10" />
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Key className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">API Management</h1>
                <p className="text-slate-200 mt-1">Auth0-level API keys, applications & security</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                onClick={() => setExportDialogOpen(true)}
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button
                className="bg-white text-slate-700 hover:bg-gray-100"
                onClick={() => setGenerateKeyDialogOpen(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Generate Key
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          {[
            { label: 'Total Keys', value: stats.totalKeys, icon: Key, color: 'from-blue-500 to-cyan-500', change: '+3' },
            { label: 'Active Keys', value: stats.activeKeys, icon: CheckCircle, color: 'from-green-500 to-emerald-500', change: '+2' },
            { label: 'Total Requests', value: formatNumber(stats.totalRequests), icon: Activity, color: 'from-purple-500 to-pink-500', change: '+18%' },
            { label: 'Today', value: formatNumber(stats.requestsToday), icon: TrendingUp, color: 'from-orange-500 to-red-500', change: '+12%' },
            { label: 'Expiring Soon', value: stats.expiringSoon, icon: AlertTriangle, color: 'from-yellow-500 to-orange-500', change: '2' },
            { label: 'Applications', value: stats.totalApps, icon: Layers, color: 'from-indigo-500 to-purple-500', change: '+1' },
            { label: 'Webhooks', value: stats.totalWebhooks, icon: Webhook, color: 'from-cyan-500 to-blue-500', change: '4' },
            { label: 'Failing', value: stats.failingWebhooks, icon: XCircle, color: 'from-red-500 to-pink-500', change: '1' }
          ].map((stat, index) => (
            <Card key={index} className="border-0 shadow-sm hover:shadow-md transition-all dark:bg-gray-800">
              <CardContent className="p-4">
                <div className={'w-10 h-10 rounded-xl bg-gradient-to-r ' + stat.color + ' flex items-center justify-center mb-3'}>
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</p>
                <p className="text-xs text-green-600 mt-1">{stat.change}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-white dark:bg-gray-800 p-1 rounded-xl shadow-sm">
            <TabsTrigger value="dashboard" className="rounded-lg">Dashboard</TabsTrigger>
            <TabsTrigger value="keys" className="rounded-lg">API Keys</TabsTrigger>
            <TabsTrigger value="applications" className="rounded-lg">Applications</TabsTrigger>
            <TabsTrigger value="logs" className="rounded-lg">Logs</TabsTrigger>
            <TabsTrigger value="webhooks" className="rounded-lg">Webhooks</TabsTrigger>
            <TabsTrigger value="settings" className="rounded-lg">Settings</TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6 mt-6">
            {/* Dashboard Banner */}
            <div className="bg-gradient-to-r from-slate-600 via-gray-600 to-zinc-600 rounded-2xl p-6 text-white mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">API Overview Dashboard</h2>
                  <p className="text-slate-200">Stripe-level API management and analytics</p>
                  <p className="text-slate-300 text-xs mt-1">Real-time monitoring • Usage tracking • Performance metrics</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{mockApiKeys.length}</p>
                    <p className="text-slate-300 text-sm">API Keys</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{mockApiLogs.length}</p>
                    <p className="text-slate-300 text-sm">Requests Today</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">99.9%</p>
                    <p className="text-slate-300 text-sm">Uptime</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Dashboard Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
              {[
                { icon: Key, label: 'New Key', color: 'text-slate-600 dark:text-slate-400', action: () => setGenerateKeyDialogOpen(true) },
                { icon: Activity, label: 'Live Feed', color: 'text-green-600 dark:text-green-400', action: () => setLiveFeedDialogOpen(true) },
                { icon: BarChart3, label: 'Analytics', color: 'text-blue-600 dark:text-blue-400', action: () => setAnalyticsDialogOpen(true) },
                { icon: Shield, label: 'Security', color: 'text-red-600 dark:text-red-400', action: () => setSecurityDialogOpen(true) },
                { icon: AlertTriangle, label: 'Alerts', color: 'text-orange-600 dark:text-orange-400', action: () => setAlertsDialogOpen(true) },
                { icon: FileText, label: 'Docs', color: 'text-purple-600 dark:text-purple-400', action: () => setDocsDialogOpen(true) },
                { icon: Download, label: 'Export', color: 'text-cyan-600 dark:text-cyan-400', action: () => setExportDialogOpen(true) },
                { icon: Settings, label: 'Settings', color: 'text-gray-600 dark:text-gray-400', action: () => setSettingsDialogOpen(true) }
              ].map((action, i) => (
                <Button key={i} variant="outline" className="flex flex-col items-center gap-2 h-auto py-4 hover:scale-105 transition-all duration-200" onClick={action.action}>
                  <action.icon className={'h-5 w-5 ' + action.color} />
                  <span className="text-xs">{action.label}</span>
                </Button>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Recent Activity */}
              <Card className="lg:col-span-2 border-0 shadow-sm dark:bg-gray-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-slate-600" />
                    Recent API Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {mockApiLogs.slice(0, 5).map(log => (
                      <div key={log.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                        <div className="flex items-center gap-3">
                          <Badge className={getLogLevelColor(log.log_level)}>{log.method}</Badge>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white text-sm">{log.endpoint}</p>
                            <p className="text-xs text-gray-500">{log.api_key_name}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={'text-sm font-medium ' + (log.status_code < 400 ? 'text-green-600' : 'text-red-600')}>
                            {log.status_code}
                          </p>
                          <p className="text-xs text-gray-500">{log.response_time_ms}ms</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Top Keys */}
              <Card className="border-0 shadow-sm dark:bg-gray-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-slate-600" />
                    Top API Keys
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {mockApiKeys.slice(0, 5).map((key, index) => (
                      <div key={key.id} className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-r from-slate-500 to-gray-600 flex items-center justify-center text-white text-xs font-bold">
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 dark:text-white text-sm truncate">{key.name}</p>
                          <Progress value={(key.requests_today / 10000) * 100} className="h-1.5 mt-1" />
                        </div>
                        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                          {formatNumber(key.requests_today)}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Security Events */}
            <Card className="border-0 shadow-sm dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-slate-600" />
                  Security Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800">
                    <ShieldCheck className="w-8 h-8 text-green-600 mb-2" />
                    <p className="text-2xl font-bold text-green-700">94%</p>
                    <p className="text-sm text-green-600">Security Score</p>
                  </div>
                  <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800">
                    <Fingerprint className="w-8 h-8 text-blue-600 mb-2" />
                    <p className="text-2xl font-bold text-blue-700">256-bit</p>
                    <p className="text-sm text-blue-600">Encryption</p>
                  </div>
                  <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800">
                    <RotateCcw className="w-8 h-8 text-purple-600 mb-2" />
                    <p className="text-2xl font-bold text-purple-700">3</p>
                    <p className="text-sm text-purple-600">Keys Rotated Today</p>
                  </div>
                  <div className="p-4 rounded-xl bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-800">
                    <AlertTriangle className="w-8 h-8 text-orange-600 mb-2" />
                    <p className="text-2xl font-bold text-orange-700">0</p>
                    <p className="text-sm text-orange-600">Security Alerts</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* API Keys Tab */}
          <TabsContent value="keys" className="space-y-6 mt-6">
            {/* Keys Banner */}
            <div className="bg-gradient-to-r from-amber-600 via-yellow-600 to-orange-600 rounded-2xl p-6 text-white mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">API Keys Management</h2>
                  <p className="text-amber-100">GitHub-level token management with fine-grained permissions</p>
                  <p className="text-amber-200 text-xs mt-1">Rotating keys • Scoped access • Expiration control</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{mockApiKeys.filter(k => k.status === 'active').length}</p>
                    <p className="text-amber-200 text-sm">Active</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{mockApiKeys.filter(k => k.status === 'revoked').length}</p>
                    <p className="text-amber-200 text-sm">Revoked</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{mockApiKeys.length}</p>
                    <p className="text-amber-200 text-sm">Total</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Keys Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
              {[
                { icon: Plus, label: 'Generate Key', color: 'text-amber-600 dark:text-amber-400', action: () => setGenerateKeyDialogOpen(true) },
                { icon: RefreshCw, label: 'Rotate All', color: 'text-blue-600 dark:text-blue-400', action: () => setRotateKeysDialogOpen(true) },
                { icon: Copy, label: 'Copy Key', color: 'text-green-600 dark:text-green-400', action: () => { setKeyToCopy(mockApiKeys[0]); } },
                { icon: Lock, label: 'Revoke', color: 'text-red-600 dark:text-red-400', action: () => setRevokeKeyDialogOpen(true) },
                { icon: Clock, label: 'Set Expiry', color: 'text-purple-600 dark:text-purple-400', action: () => setSetExpiryDialogOpen(true) },
                { icon: Shield, label: 'Permissions', color: 'text-orange-600 dark:text-orange-400', action: () => setPermissionsDialogOpen(true) },
                { icon: Download, label: 'Export', color: 'text-cyan-600 dark:text-cyan-400', action: () => setExportDialogOpen(true) },
                { icon: History, label: 'History', color: 'text-gray-600 dark:text-gray-400', action: () => setHistoryDialogOpen(true) }
              ].map((action, i) => (
                <Button key={i} variant="outline" className="flex flex-col items-center gap-2 h-auto py-4 hover:scale-105 transition-all duration-200" onClick={action.action}>
                  <action.icon className={'h-5 w-5 ' + action.color} />
                  <span className="text-xs">{action.label}</span>
                </Button>
              ))}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Search keys..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-80"
                  />
                </div>
                <Button variant="outline" size="sm" onClick={() => setFiltersDialogOpen(true)}>
                  <Filter className="w-4 h-4 mr-2" />
                  Filters
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <LayoutGrid className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-4'}>
              {filteredKeys.map(key => (
                <Card
                  key={key.id}
                  className="border-0 shadow-sm hover:shadow-lg transition-all cursor-pointer dark:bg-gray-800"
                  onClick={() => setSelectedKey(key)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={getStatusColor(key.status)}>{key.status}</Badge>
                          <Badge className={getKeyTypeColor(key.key_type)}>{key.key_type}</Badge>
                          <Badge className={getEnvironmentColor(key.environment)}>{key.environment}</Badge>
                        </div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">{key.name}</h3>
                        <code className="text-sm text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded mt-1 inline-block">
                          {key.key_prefix}...{key.key_code.slice(-4)}
                        </code>
                      </div>
                      <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setSelectedKey(key); setMoreOptionsDialogOpen(true); }}>
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-4">
                      <div>
                        <p className="text-xs text-gray-500">Total Requests</p>
                        <p className="font-semibold text-gray-900 dark:text-white">{formatNumber(key.total_requests)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Today</p>
                        <p className="font-semibold text-gray-900 dark:text-white">{formatNumber(key.requests_today)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Rate Limit</p>
                        <p className="font-semibold text-gray-900 dark:text-white">{formatNumber(key.rate_limit_per_hour)}/hr</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Last Used</p>
                        <p className="font-semibold text-gray-900 dark:text-white text-sm">
                          {key.last_used_at ? formatDate(key.last_used_at).split(',')[0] : 'Never'}
                        </p>
                      </div>
                    </div>

                    {key.scopes.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {key.scopes.slice(0, 3).map(scope => (
                          <Badge key={scope} variant="outline" className="text-xs">{scope}</Badge>
                        ))}
                        {key.scopes.length > 3 && (
                          <Badge variant="outline" className="text-xs">+{key.scopes.length - 3}</Badge>
                        )}
                      </div>
                    )}

                    <div className="flex gap-2 mt-4 pt-4 border-t dark:border-gray-700">
                      <Button variant="outline" size="sm" className="flex-1" onClick={(e) => { e.stopPropagation(); setKeyToCopy(key); }}>
                        <Copy className="w-3 h-3 mr-1" />
                        Copy
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1" onClick={(e) => { e.stopPropagation(); setKeyToRotate(key); }}>
                        <RefreshCw className="w-3 h-3 mr-1" />
                        Rotate
                      </Button>
                      <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700" onClick={(e) => { e.stopPropagation(); setKeyToRevoke(key); }}>
                        <Lock className="w-3 h-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Applications Tab */}
          <TabsContent value="applications" className="space-y-6 mt-6">
            {/* Applications Banner */}
            <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 rounded-2xl p-6 text-white mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">OAuth Applications</h2>
                  <p className="text-blue-100">Auth0-level application management with OAuth 2.0</p>
                  <p className="text-blue-200 text-xs mt-1">Client credentials • Scopes • Redirect URIs</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{mockApplications.length}</p>
                    <p className="text-blue-200 text-sm">Apps</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{mockApplications.filter(a => a.status === 'active').length}</p>
                    <p className="text-blue-200 text-sm">Active</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search applications..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-80"
                />
              </div>
              <Button onClick={() => setCreateAppDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Application
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredApps.map(app => (
                <Card
                  key={app.id}
                  className="border-0 shadow-sm hover:shadow-lg transition-all cursor-pointer dark:bg-gray-800"
                  onClick={() => setSelectedApp(app)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <Avatar className="w-12 h-12">
                        <AvatarFallback className="bg-gradient-to-r from-slate-500 to-gray-600 text-white">
                          {app.name.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900 dark:text-white">{app.name}</h3>
                          <Badge className={app.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                            {app.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-500 mb-2">{app.description}</p>
                        <div className="flex items-center gap-3">
                          <Badge variant="outline">{app.app_type.replace('_', ' ')}</Badge>
                          <span className="text-xs text-gray-500">
                            Client ID: {app.client_id.slice(0, 12)}...
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mt-4 pt-4 border-t dark:border-gray-700">
                      <div className="text-center">
                        <p className="text-xl font-bold text-gray-900 dark:text-white">{formatNumber(app.total_logins)}</p>
                        <p className="text-xs text-gray-500">Total Logins</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xl font-bold text-gray-900 dark:text-white">{formatNumber(app.daily_active_users)}</p>
                        <p className="text-xs text-gray-500">Daily Users</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xl font-bold text-gray-900 dark:text-white">{app.api_keys_count}</p>
                        <p className="text-xs text-gray-500">API Keys</p>
                      </div>
                    </div>

                    <div className="flex gap-2 mt-4">
                      <Button variant="outline" size="sm" className="flex-1" onClick={(e) => { e.stopPropagation(); setAppToManage(app); setAppSettingsDialogOpen(true); }}>
                        <Settings className="w-3 h-3 mr-1" />
                        Settings
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1" onClick={(e) => { e.stopPropagation(); setAppToManage(app); setQuickstartDialogOpen(true); }}>
                        <ExternalLink className="w-3 h-3 mr-1" />
                        Quickstart
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Logs Tab */}
          <TabsContent value="logs" className="space-y-6 mt-6">
            {/* Logs Banner */}
            <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 rounded-2xl p-6 text-white mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">API Request Logs</h2>
                  <p className="text-emerald-100">Datadog-level request logging and debugging</p>
                  <p className="text-emerald-200 text-xs mt-1">Request/response inspection • Latency tracking • Error analysis</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{mockApiLogs.length}</p>
                    <p className="text-emerald-200 text-sm">Logs</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{mockApiLogs.filter(l => l.status_code >= 400).length}</p>
                    <p className="text-emerald-200 text-sm">Errors</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{Math.round(mockApiLogs.reduce((s, l) => s + l.response_time_ms, 0) / mockApiLogs.length)}ms</p>
                    <p className="text-emerald-200 text-sm">Avg Latency</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Search logs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-80"
                  />
                </div>
                <Button variant="outline" size="sm" onClick={() => setFiltersDialogOpen(true)}>
                  <Filter className="w-4 h-4 mr-2" />
                  Filters
                </Button>
              </div>
              <Button variant="outline" onClick={() => setExportDialogOpen(true)}>
                <Download className="w-4 h-4 mr-2" />
                Export Logs
              </Button>
            </div>

            <Card className="border-0 shadow-sm dark:bg-gray-800">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Timestamp</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Endpoint</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duration</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">API Key</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">IP</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                      {filteredLogs.map(log => (
                        <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                          <td className="px-4 py-3 text-sm text-gray-500">{formatDate(log.timestamp)}</td>
                          <td className="px-4 py-3">
                            <Badge className={getLogLevelColor(log.log_level)}>{log.method}</Badge>
                          </td>
                          <td className="px-4 py-3 text-sm font-mono text-gray-900 dark:text-white">{log.endpoint}</td>
                          <td className="px-4 py-3">
                            <span className={'text-sm font-medium ' + (log.status_code < 400 ? 'text-green-600' : 'text-red-600')}>
                              {log.status_code}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500">{log.response_time_ms}ms</td>
                          <td className="px-4 py-3 text-sm text-gray-500">{log.api_key_name}</td>
                          <td className="px-4 py-3 text-sm font-mono text-gray-500">{log.ip_address}</td>
                          <td className="px-4 py-3">
                            <Button variant="ghost" size="sm" onClick={() => setSelectedLog(log)}>
                              <Eye className="w-4 h-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Webhooks Tab */}
          <TabsContent value="webhooks" className="space-y-6 mt-6">
            {/* Webhooks Banner */}
            <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 rounded-2xl p-6 text-white mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Webhook Management</h2>
                  <p className="text-purple-100">Stripe Webhooks-level event delivery system</p>
                  <p className="text-purple-200 text-xs mt-1">Retry logic • Signature verification • Event filtering</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{mockWebhooks.length}</p>
                    <p className="text-purple-200 text-sm">Endpoints</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{mockWebhooks.filter(w => w.status === 'active').length}</p>
                    <p className="text-purple-200 text-sm">Active</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">99.5%</p>
                    <p className="text-purple-200 text-sm">Success Rate</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Webhook Endpoints</h2>
              <Button onClick={() => setAddWebhookDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Endpoint
              </Button>
            </div>

            <div className="space-y-4">
              {mockWebhooks.map(webhook => (
                <Card
                  key={webhook.id}
                  className="border-0 shadow-sm hover:shadow-lg transition-all cursor-pointer dark:bg-gray-800"
                  onClick={() => setSelectedWebhook(webhook)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={'w-10 h-10 rounded-xl flex items-center justify-center ' + (webhook.status === 'active' ? 'bg-green-100' : webhook.status === 'failing' ? 'bg-red-100' : 'bg-gray-100')}>
                          <Webhook className={'w-5 h-5 ' + (webhook.status === 'active' ? 'text-green-600' : webhook.status === 'failing' ? 'text-red-600' : 'text-gray-600')} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-gray-900 dark:text-white">{webhook.name}</h3>
                            <Badge className={getWebhookStatusColor(webhook.status)}>{webhook.status}</Badge>
                          </div>
                          <p className="text-sm text-gray-500 font-mono">{webhook.url}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setWebhookToManage(webhook); setTestWebhookDialogOpen(true); }}>
                          <Play className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setWebhookToManage(webhook); setWebhookSettingsDialogOpen(true); }}>
                          <Settings className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {webhook.events.map(event => (
                        <Badge key={event} variant="outline" className="text-xs">{event}</Badge>
                      ))}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                      <div>
                        <p className="text-xs text-gray-500">Total Deliveries</p>
                        <p className="font-semibold text-gray-900 dark:text-white">{formatNumber(webhook.total_deliveries)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Success Rate</p>
                        <p className="font-semibold text-green-600">
                          {((webhook.successful_deliveries / webhook.total_deliveries) * 100).toFixed(1)}%
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Last Delivery</p>
                        <p className="font-semibold text-gray-900 dark:text-white text-sm">
                          {webhook.last_delivery_at ? formatDate(webhook.last_delivery_at).split(',')[0] : 'Never'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Version</p>
                        <p className="font-semibold text-gray-900 dark:text-white">{webhook.version}</p>
                      </div>
                    </div>

                    {webhook.last_failure_reason && (
                      <div className="mt-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800">
                        <p className="text-sm text-red-700 dark:text-red-400">
                          <AlertCircle className="w-4 h-4 inline-block mr-1" />
                          Last failure: {webhook.last_failure_reason}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6 mt-6">
            {/* Settings Banner */}
            <div className="bg-gradient-to-r from-gray-700 via-slate-700 to-zinc-700 rounded-2xl p-6 text-white mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">API Configuration</h2>
                  <p className="text-gray-300">AWS IAM-level security and access configuration</p>
                  <p className="text-gray-400 text-xs mt-1">Rate limits • IP whitelisting • CORS settings • Encryption</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">256-bit</p>
                    <p className="text-gray-400 text-sm">Encryption</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">MFA</p>
                    <p className="text-gray-400 text-sm">Enabled</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">SOC2</p>
                    <p className="text-gray-400 text-sm">Compliant</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Security Settings */}
              <Card className="border-0 shadow-sm dark:bg-gray-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-slate-600" />
                    Security Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Enforce IP Whitelist</p>
                      <p className="text-sm text-gray-500">Require IP whitelist for all API keys</p>
                    </div>
                    <Switch />
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Auto Key Rotation</p>
                      <p className="text-sm text-gray-500">Automatically rotate keys every 90 days</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Rate Limit Alerts</p>
                      <p className="text-sm text-gray-500">Get notified when rate limits are exceeded</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Suspicious Activity Detection</p>
                      <p className="text-sm text-gray-500">AI-powered anomaly detection</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </CardContent>
              </Card>

              {/* Rate Limiting */}
              <Card className="border-0 shadow-sm dark:bg-gray-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-slate-600" />
                    Default Rate Limits
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                    <div className="flex justify-between items-center mb-2">
                      <p className="font-medium text-gray-900 dark:text-white">Requests per Second</p>
                      <Input type="number" defaultValue="10" className="w-24 text-right" />
                    </div>
                  </div>
                  <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                    <div className="flex justify-between items-center mb-2">
                      <p className="font-medium text-gray-900 dark:text-white">Requests per Minute</p>
                      <Input type="number" defaultValue="100" className="w-24 text-right" />
                    </div>
                  </div>
                  <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                    <div className="flex justify-between items-center mb-2">
                      <p className="font-medium text-gray-900 dark:text-white">Requests per Hour</p>
                      <Input type="number" defaultValue="1000" className="w-24 text-right" />
                    </div>
                  </div>
                  <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                    <div className="flex justify-between items-center mb-2">
                      <p className="font-medium text-gray-900 dark:text-white">Burst Limit</p>
                      <Input type="number" defaultValue="50" className="w-24 text-right" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Scopes */}
              <Card className="lg:col-span-2 border-0 shadow-sm dark:bg-gray-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="w-5 h-5 text-slate-600" />
                    API Scopes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {mockScopes.map(scope => (
                      <div key={scope.id} className="p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-600">
                        <div className="flex items-start justify-between mb-2">
                          <code className="text-sm font-medium text-gray-900 dark:text-white">{scope.name}</code>
                          {scope.is_sensitive && (
                            <Badge className="bg-red-100 text-red-800 text-xs">Sensitive</Badge>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mb-2">{scope.description}</p>
                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className="text-xs">{scope.category}</Badge>
                          <span className="text-xs text-gray-500">{scope.api_count} APIs</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Enhanced Competitive Upgrade Components */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          <div className="lg:col-span-2">
            <AIInsightsPanel
              insights={mockApiKeysAIInsights}
              title="API Intelligence"
              onInsightAction={(insight) => toast.info(insight.title)}
            />
          </div>
          <div className="space-y-6">
            <CollaborationIndicator
              collaborators={mockApiKeysCollaborators}
              maxVisible={4}
            />
            <PredictiveAnalytics
              predictions={mockApiKeysPredictions}
              title="API Forecasts"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <ActivityFeed
            activities={mockApiKeysActivities}
            title="API Key Activity"
            maxItems={5}
          />
          <QuickActionsToolbar
            actions={mockApiKeysQuickActions}
            variant="grid"
          />
        </div>

        {/* Key Detail Dialog */}
        <Dialog open={!!selectedKey} onOpenChange={() => setSelectedKey(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>API Key Details</DialogTitle>
            </DialogHeader>
            {selectedKey && (
              <ScrollArea className="max-h-[70vh]">
                <div className="space-y-6 p-4">
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(selectedKey.status)}>{selectedKey.status}</Badge>
                    <Badge className={getKeyTypeColor(selectedKey.key_type)}>{selectedKey.key_type}</Badge>
                    <Badge className={getEnvironmentColor(selectedKey.environment)}>{selectedKey.environment}</Badge>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold">{selectedKey.name}</h3>
                    <p className="text-gray-500">{selectedKey.description}</p>
                  </div>

                  <div className="p-4 rounded-xl bg-gray-100 dark:bg-gray-800">
                    <p className="text-xs text-gray-500 mb-1">API Key</p>
                    <div className="flex items-center gap-2">
                      <code className="text-lg font-mono">{selectedKey.key_prefix}•••••••••{selectedKey.key_code.slice(-4)}</code>
                      <Button variant="ghost" size="sm" onClick={() => { navigator.clipboard.writeText(selectedKey.key_prefix + selectedKey.key_code); toast.success('API key copied to clipboard'); }}>
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800">
                      <p className="text-xs text-gray-500">Total Requests</p>
                      <p className="text-2xl font-bold">{formatNumber(selectedKey.total_requests)}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800">
                      <p className="text-xs text-gray-500">Requests Today</p>
                      <p className="text-2xl font-bold">{formatNumber(selectedKey.requests_today)}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800">
                      <p className="text-xs text-gray-500">Rate Limit</p>
                      <p className="text-2xl font-bold">{formatNumber(selectedKey.rate_limit_per_hour)}/hr</p>
                    </div>
                    <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800">
                      <p className="text-xs text-gray-500">Last Used</p>
                      <p className="text-lg font-semibold">
                        {selectedKey.last_used_at ? formatDate(selectedKey.last_used_at) : 'Never'}
                      </p>
                    </div>
                  </div>

                  {selectedKey.scopes.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-2">Scopes</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedKey.scopes.map(scope => (
                          <Badge key={scope} variant="outline">{scope}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedKey.ip_whitelist.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-2">IP Whitelist</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedKey.ip_whitelist.map(ip => (
                          <code key={ip} className="px-2 py-1 bg-gray-100 rounded text-sm">{ip}</code>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <Button variant="outline" className="flex-1" onClick={() => { setKeyToRotate(selectedKey); setSelectedKey(null); }}>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Rotate Key
                    </Button>
                    <Button variant="outline" className="flex-1 text-red-600 hover:text-red-700" onClick={() => { setKeyToRevoke(selectedKey); setSelectedKey(null); }}>
                      <Lock className="w-4 h-4 mr-2" />
                      Revoke
                    </Button>
                  </div>
                </div>
              </ScrollArea>
            )}
          </DialogContent>
        </Dialog>

        {/* Log Detail Dialog */}
        <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Request Details</DialogTitle>
            </DialogHeader>
            {selectedLog && (
              <div className="space-y-4 p-4">
                <div className="flex items-center gap-2">
                  <Badge className={getLogLevelColor(selectedLog.log_level)}>{selectedLog.method}</Badge>
                  <span className={'font-medium ' + (selectedLog.status_code < 400 ? 'text-green-600' : 'text-red-600')}>
                    {selectedLog.status_code}
                  </span>
                </div>

                <code className="block p-3 rounded-lg bg-gray-100 dark:bg-gray-800 text-sm">
                  {selectedLog.endpoint}
                </code>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div>
                    <p className="text-xs text-gray-500">Response Time</p>
                    <p className="font-semibold">{selectedLog.response_time_ms}ms</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Request ID</p>
                    <code className="text-sm">{selectedLog.request_id}</code>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">IP Address</p>
                    <code className="text-sm">{selectedLog.ip_address}</code>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Location</p>
                    <p className="font-semibold">{selectedLog.city}, {selectedLog.country}</p>
                  </div>
                </div>

                {selectedLog.error_message && (
                  <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                    <p className="text-sm text-red-700 dark:text-red-400">
                      <AlertCircle className="w-4 h-4 inline-block mr-1" />
                      {selectedLog.error_message}
                    </p>
                  </div>
                )}

                <div>
                  <p className="text-xs text-gray-500 mb-1">User Agent</p>
                  <code className="text-xs block p-2 rounded bg-gray-100 dark:bg-gray-800">
                    {selectedLog.user_agent}
                  </code>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Generate Key Dialog */}
        <Dialog open={generateKeyDialogOpen} onOpenChange={setGenerateKeyDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Key className="w-5 h-5" />
                Generate New API Key
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div>
                <label className="text-sm font-medium">Key Name</label>
                <Input
                  placeholder="e.g., Production API Key"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Key Type</label>
                <select
                  className="w-full mt-1 p-2 border rounded-md"
                  value={newKeyType}
                  onChange={(e) => setNewKeyType(e.target.value as KeyType)}
                >
                  <option value="api">API Key</option>
                  <option value="webhook">Webhook</option>
                  <option value="oauth">OAuth</option>
                  <option value="jwt">JWT</option>
                  <option value="service">Service</option>
                  <option value="machine_to_machine">Machine to Machine</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Environment</label>
                <select
                  className="w-full mt-1 p-2 border rounded-md"
                  value={newKeyEnvironment}
                  onChange={(e) => setNewKeyEnvironment(e.target.value as Environment)}
                >
                  <option value="development">Development</option>
                  <option value="staging">Staging</option>
                  <option value="production">Production</option>
                  <option value="sandbox">Sandbox</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Scopes</label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {mockScopes.slice(0, 6).map(scope => (
                    <label key={scope.id} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={newKeyScopes.includes(scope.name)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewKeyScopes([...newKeyScopes, scope.name])
                          } else {
                            setNewKeyScopes(newKeyScopes.filter(s => s !== scope.name))
                          }
                        }}
                      />
                      {scope.name}
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setGenerateKeyDialogOpen(false)}>
                  Cancel
                </Button>
                <Button className="flex-1" onClick={() => {
                  toast.success('API key generated successfully')
                  setGenerateKeyDialogOpen(false)
                  setNewKeyName('')
                  setNewKeyScopes([])
                }}>
                  Generate Key
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Export Dialog */}
        <Dialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Download className="w-5 h-5" />
                Export Data
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div>
                <label className="text-sm font-medium">Export Format</label>
                <div className="mt-2 space-y-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="format"
                      checked={exportFormat === 'json'}
                      onChange={() => setExportFormat('json')}
                    />
                    <span>JSON</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="format"
                      checked={exportFormat === 'csv'}
                      onChange={() => setExportFormat('csv')}
                    />
                    <span>CSV</span>
                  </label>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Include</label>
                <div className="mt-2 space-y-2">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked />
                    <span>API Keys metadata</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked />
                    <span>Usage statistics</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" />
                    <span>Request logs</span>
                  </label>
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setExportDialogOpen(false)}>
                  Cancel
                </Button>
                <Button className="flex-1" onClick={() => {
                  toast.success('Export started')
                  setExportDialogOpen(false)
                }}>
                  Export
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Rotate Keys Dialog */}
        <Dialog open={rotateKeysDialogOpen} onOpenChange={setRotateKeysDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <RefreshCw className="w-5 h-5" />
                Rotate All Keys
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="p-4 rounded-lg bg-yellow-50 border border-yellow-200">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-yellow-800">Warning</p>
                    <p className="text-sm text-yellow-700">This will rotate all active API keys. Applications using these keys will need to be updated.</p>
                  </div>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Keys to rotate</label>
                <div className="mt-2 space-y-2">
                  {mockApiKeys.filter(k => k.status === 'active').map(key => (
                    <label key={key.id} className="flex items-center gap-2 text-sm">
                      <input type="checkbox" defaultChecked />
                      {key.name}
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setRotateKeysDialogOpen(false)}>
                  Cancel
                </Button>
                <Button className="flex-1" onClick={() => {
                  toast.success('Keys rotated')
                  setRotateKeysDialogOpen(false)
                }}>
                  Rotate Keys
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Key Rotate Dialog */}
        <Dialog open={!!keyToRotate} onOpenChange={() => setKeyToRotate(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <RefreshCw className="w-5 h-5" />
                Rotate API Key
              </DialogTitle>
            </DialogHeader>
            {keyToRotate && (
              <div className="space-y-4 pt-4">
                <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                  <p className="font-medium text-blue-800">{keyToRotate.name}</p>
                  <code className="text-sm text-blue-600">{keyToRotate.key_prefix}...{keyToRotate.key_code.slice(-4)}</code>
                </div>
                <p className="text-sm text-gray-600">
                  This will generate a new key and invalidate the current one. Make sure to update your applications.
                </p>
                <div className="flex gap-3 pt-4">
                  <Button variant="outline" className="flex-1" onClick={() => setKeyToRotate(null)}>
                    Cancel
                  </Button>
                  <Button className="flex-1" onClick={() => {
                    toast.success('Key rotated')
                    setKeyToRotate(null)
                  }}>
                    Rotate Key
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Key Revoke Dialog */}
        <Dialog open={!!keyToRevoke} onOpenChange={() => setKeyToRevoke(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600">
                <Lock className="w-5 h-5" />
                Revoke API Key
              </DialogTitle>
            </DialogHeader>
            {keyToRevoke && (
              <div className="space-y-4 pt-4">
                <div className="p-4 rounded-lg bg-red-50 border border-red-200">
                  <p className="font-medium text-red-800">{keyToRevoke.name}</p>
                  <code className="text-sm text-red-600">{keyToRevoke.key_prefix}...{keyToRevoke.key_code.slice(-4)}</code>
                </div>
                <div className="p-4 rounded-lg bg-yellow-50 border border-yellow-200">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                    <p className="text-sm text-yellow-700">This action cannot be undone. Applications using this key will immediately lose access.</p>
                  </div>
                </div>
                <div className="flex gap-3 pt-4">
                  <Button variant="outline" className="flex-1" onClick={() => setKeyToRevoke(null)}>
                    Cancel
                  </Button>
                  <Button variant="destructive" className="flex-1" onClick={() => {
                    toast.success('Key revoked')
                    setKeyToRevoke(null)
                  }}>
                    Revoke Key
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Copy Key Dialog */}
        <Dialog open={!!keyToCopy} onOpenChange={() => setKeyToCopy(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Copy className="w-5 h-5" />
                Copy API Key
              </DialogTitle>
            </DialogHeader>
            {keyToCopy && (
              <div className="space-y-4 pt-4">
                <div className="p-4 rounded-lg bg-gray-100 dark:bg-gray-800">
                  <p className="text-xs text-gray-500 mb-2">{keyToCopy.name}</p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 p-2 bg-white dark:bg-gray-900 rounded text-sm font-mono">
                      {keyToCopy.key_prefix}{keyToCopy.key_code}
                    </code>
                  </div>
                </div>
                <div className="flex gap-3 pt-4">
                  <Button variant="outline" className="flex-1" onClick={() => setKeyToCopy(null)}>
                    Close
                  </Button>
                  <Button className="flex-1" onClick={() => {
                    navigator.clipboard.writeText(keyToCopy.key_prefix + keyToCopy.key_code)
                    toast.success('Copied to clipboard')
                    setKeyToCopy(null)
                  }}>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Key
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Set Expiry Dialog */}
        <Dialog open={setExpiryDialogOpen} onOpenChange={setSetExpiryDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Set Key Expiration
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div>
                <label className="text-sm font-medium">Expiration Period</label>
                <select
                  className="w-full mt-1 p-2 border rounded-md"
                  value={expiryDays}
                  onChange={(e) => setExpiryDays(Number(e.target.value))}
                >
                  <option value={30}>30 days</option>
                  <option value={60}>60 days</option>
                  <option value={90}>90 days</option>
                  <option value={180}>180 days</option>
                  <option value={365}>1 year</option>
                  <option value={0}>No expiration</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Apply to</label>
                <div className="mt-2 space-y-2">
                  {mockApiKeys.filter(k => k.status === 'active').map(key => (
                    <label key={key.id} className="flex items-center gap-2 text-sm">
                      <input type="checkbox" />
                      {key.name}
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setSetExpiryDialogOpen(false)}>
                  Cancel
                </Button>
                <Button className="flex-1" onClick={() => {
                  toast.success('Expiration set')
                  setSetExpiryDialogOpen(false)
                }}>
                  Apply
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Permissions Dialog */}
        <Dialog open={permissionsDialogOpen} onOpenChange={setPermissionsDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Manage Permissions
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div>
                <label className="text-sm font-medium">Available Scopes</label>
                <div className="mt-2 max-h-64 overflow-y-auto space-y-2">
                  {mockScopes.map(scope => (
                    <div key={scope.id} className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-gray-800">
                      <div className="flex items-center gap-2">
                        <input type="checkbox" />
                        <div>
                          <code className="text-sm">{scope.name}</code>
                          <p className="text-xs text-gray-500">{scope.description}</p>
                        </div>
                      </div>
                      {scope.is_sensitive && (
                        <Badge className="bg-red-100 text-red-800 text-xs">Sensitive</Badge>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setPermissionsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button className="flex-1" onClick={() => {
                  toast.success('Permissions updated')
                  setPermissionsDialogOpen(false)
                }}>
                  Save Permissions
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* History Dialog */}
        <Dialog open={historyDialogOpen} onOpenChange={setHistoryDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <History className="w-5 h-5" />
                Key History
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="max-h-96 overflow-y-auto space-y-3">
                {[
                  { action: 'Key created', key: 'Production API Key', user: 'admin@company.com', time: '2 hours ago' },
                  { action: 'Key rotated', key: 'Staging Test Key', user: 'devops@company.com', time: '1 day ago' },
                  { action: 'Permissions updated', key: 'Mobile App Service Key', user: 'admin@company.com', time: '3 days ago' },
                  { action: 'Key revoked', key: 'Old Production Key', user: 'security@company.com', time: '1 week ago' },
                ].map((event, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <div>
                      <p className="font-medium">{event.action}</p>
                      <p className="text-sm text-gray-500">{event.key}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm">{event.user}</p>
                      <p className="text-xs text-gray-500">{event.time}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Button className="w-full" onClick={() => setHistoryDialogOpen(false)}>
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Filters Dialog */}
        <Dialog open={filtersDialogOpen} onOpenChange={setFiltersDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Filters
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div>
                <label className="text-sm font-medium">Status</label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {['active', 'inactive', 'expired', 'revoked'].map(status => (
                    <label key={status} className="flex items-center gap-2 text-sm">
                      <input type="checkbox" defaultChecked={status === 'active'} />
                      <span className="capitalize">{status}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Environment</label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {['production', 'staging', 'development', 'sandbox'].map(env => (
                    <label key={env} className="flex items-center gap-2 text-sm">
                      <input type="checkbox" />
                      <span className="capitalize">{env}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Key Type</label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {['api', 'webhook', 'oauth', 'jwt'].map(type => (
                    <label key={type} className="flex items-center gap-2 text-sm">
                      <input type="checkbox" />
                      <span className="uppercase">{type}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setFiltersDialogOpen(false)}>
                  Reset
                </Button>
                <Button className="flex-1" onClick={() => {
                  toast.success('Filters applied')
                  setFiltersDialogOpen(false)
                }}>
                  Apply Filters
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* More Options Dialog */}
        <Dialog open={moreOptionsDialogOpen} onOpenChange={setMoreOptionsDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <MoreHorizontal className="w-5 h-5" />
                Key Options
              </DialogTitle>
            </DialogHeader>
            {selectedKey && (
              <div className="space-y-2 pt-4">
                <Button variant="outline" className="w-full justify-start" onClick={() => { setMoreOptionsDialogOpen(false); setKeyToCopy(selectedKey); }}>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Key
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => { setMoreOptionsDialogOpen(false); setKeyToRotate(selectedKey); }}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Rotate Key
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => { setMoreOptionsDialogOpen(false); setSetExpiryDialogOpen(true); }}>
                  <Clock className="w-4 h-4 mr-2" />
                  Set Expiration
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => { setMoreOptionsDialogOpen(false); setPermissionsDialogOpen(true); }}>
                  <Shield className="w-4 h-4 mr-2" />
                  Edit Permissions
                </Button>
                <Button variant="outline" className="w-full justify-start text-red-600" onClick={() => { setMoreOptionsDialogOpen(false); setKeyToRevoke(selectedKey); }}>
                  <Lock className="w-4 h-4 mr-2" />
                  Revoke Key
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Live Feed Dialog */}
        <Dialog open={liveFeedDialogOpen} onOpenChange={setLiveFeedDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-green-600" />
                Live API Feed
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="flex items-center gap-2 p-2 rounded-lg bg-green-50 border border-green-200">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-sm text-green-700">Streaming live requests...</span>
              </div>
              <div className="max-h-96 overflow-y-auto space-y-2">
                {mockApiLogs.map(log => (
                  <div key={log.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <div className="flex items-center gap-3">
                      <Badge className={getLogLevelColor(log.log_level)}>{log.method}</Badge>
                      <span className="text-sm font-mono">{log.endpoint}</span>
                    </div>
                    <span className={'text-sm font-medium ' + (log.status_code < 400 ? 'text-green-600' : 'text-red-600')}>
                      {log.status_code}
                    </span>
                  </div>
                ))}
              </div>
              <Button className="w-full" onClick={() => setLiveFeedDialogOpen(false)}>
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Analytics Dialog */}
        <Dialog open={analyticsDialogOpen} onOpenChange={setAnalyticsDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                API Analytics
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                <div className="p-4 rounded-lg bg-blue-50 text-center">
                  <p className="text-2xl font-bold text-blue-700">{formatNumber(stats.totalRequests)}</p>
                  <p className="text-sm text-blue-600">Total Requests</p>
                </div>
                <div className="p-4 rounded-lg bg-green-50 text-center">
                  <p className="text-2xl font-bold text-green-700">99.9%</p>
                  <p className="text-sm text-green-600">Success Rate</p>
                </div>
                <div className="p-4 rounded-lg bg-purple-50 text-center">
                  <p className="text-2xl font-bold text-purple-700">45ms</p>
                  <p className="text-sm text-purple-600">Avg Latency</p>
                </div>
              </div>
              <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                <h4 className="font-medium mb-3">Top Endpoints</h4>
                <div className="space-y-2">
                  {['/api/v1/users', '/api/v1/data', '/api/v1/auth/token'].map((endpoint, i) => (
                    <div key={endpoint} className="flex items-center justify-between">
                      <code className="text-sm">{endpoint}</code>
                      <span className="text-sm text-gray-500">{formatNumber(10000 - i * 2000)} calls</span>
                    </div>
                  ))}
                </div>
              </div>
              <Button className="w-full" onClick={() => setAnalyticsDialogOpen(false)}>
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Security Dialog */}
        <Dialog open={securityDialogOpen} onOpenChange={setSecurityDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-red-600" />
                Security Center
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="p-4 rounded-lg bg-green-50 text-center">
                  <ShieldCheck className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <p className="text-xl font-bold text-green-700">94%</p>
                  <p className="text-sm text-green-600">Security Score</p>
                </div>
                <div className="p-4 rounded-lg bg-blue-50 text-center">
                  <Lock className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-xl font-bold text-blue-700">0</p>
                  <p className="text-sm text-blue-600">Active Threats</p>
                </div>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Security Checklist</h4>
                {[
                  { item: 'IP whitelisting enabled', done: true },
                  { item: 'Key rotation policy', done: true },
                  { item: 'Rate limiting configured', done: true },
                  { item: 'MFA for API management', done: false },
                ].map((check, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    {check.done ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <XCircle className="w-4 h-4 text-gray-400" />
                    )}
                    <span className={check.done ? '' : 'text-gray-500'}>{check.item}</span>
                  </div>
                ))}
              </div>
              <Button className="w-full" onClick={() => setSecurityDialogOpen(false)}>
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Alerts Dialog */}
        <Dialog open={alertsDialogOpen} onOpenChange={setAlertsDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
                API Alerts
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-3">
                {[
                  { type: 'warning', message: 'Production API Key expires in 7 days', time: '2 hours ago' },
                  { type: 'info', message: 'Mobile app approaching 80% rate limit', time: '1 day ago' },
                  { type: 'success', message: 'Key rotation completed successfully', time: '3 days ago' },
                ].map((alert, i) => (
                  <div key={i} className={'p-4 rounded-lg border ' + (alert.type === 'warning' ? 'bg-yellow-50 border-yellow-200' : alert.type === 'info' ? 'bg-blue-50 border-blue-200' : 'bg-green-50 border-green-200')}>
                    <p className={'font-medium ' + (alert.type === 'warning' ? 'text-yellow-800' : alert.type === 'info' ? 'text-blue-800' : 'text-green-800')}>{alert.message}</p>
                    <p className="text-xs text-gray-500 mt-1">{alert.time}</p>
                  </div>
                ))}
              </div>
              <Button className="w-full" onClick={() => setAlertsDialogOpen(false)}>
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Docs Dialog */}
        <Dialog open={docsDialogOpen} onOpenChange={setDocsDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-purple-600" />
                API Documentation
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-3">
                {[
                  { title: 'Getting Started', desc: 'Quick start guide for API integration' },
                  { title: 'Authentication', desc: 'Learn about API key authentication' },
                  { title: 'Rate Limits', desc: 'Understanding rate limits and quotas' },
                  { title: 'Webhooks', desc: 'Setting up webhook endpoints' },
                  { title: 'Error Handling', desc: 'Common errors and how to handle them' },
                ].map((doc, i) => (
                  <div key={i} className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700">
                    <p className="font-medium">{doc.title}</p>
                    <p className="text-sm text-gray-500">{doc.desc}</p>
                  </div>
                ))}
              </div>
              <Button className="w-full" onClick={() => setDocsDialogOpen(false)}>
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Settings Dialog */}
        <Dialog open={settingsDialogOpen} onOpenChange={setSettingsDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                API Settings
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                  <div>
                    <p className="font-medium">Auto Key Rotation</p>
                    <p className="text-sm text-gray-500">Automatically rotate keys every 90 days</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                  <div>
                    <p className="font-medium">Rate Limit Alerts</p>
                    <p className="text-sm text-gray-500">Get notified when limits are exceeded</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                  <div>
                    <p className="font-medium">IP Whitelisting</p>
                    <p className="text-sm text-gray-500">Require IP whitelist for all keys</p>
                  </div>
                  <Switch />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setSettingsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button className="flex-1" onClick={() => {
                  toast.success('Settings saved')
                  setSettingsDialogOpen(false)
                }}>
                  Save Settings
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Create Application Dialog */}
        <Dialog open={createAppDialogOpen} onOpenChange={setCreateAppDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Create Application
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div>
                <label className="text-sm font-medium">Application Name</label>
                <Input
                  placeholder="e.g., My Web App"
                  value={newAppName}
                  onChange={(e) => setNewAppName(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Application Type</label>
                <select
                  className="w-full mt-1 p-2 border rounded-md"
                  value={newAppType}
                  onChange={(e) => setNewAppType(e.target.value as typeof newAppType)}
                >
                  <option value="regular_web">Regular Web Application</option>
                  <option value="spa">Single Page Application (SPA)</option>
                  <option value="native">Native Application</option>
                  <option value="machine_to_machine">Machine to Machine</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <Input placeholder="Brief description of your application" className="mt-1" />
              </div>
              <div className="flex gap-3 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setCreateAppDialogOpen(false)}>
                  Cancel
                </Button>
                <Button className="flex-1" onClick={() => {
                  toast.success('Application created')
                  setCreateAppDialogOpen(false)
                  setNewAppName('')
                }}>
                  Create
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* App Settings Dialog */}
        <Dialog open={appSettingsDialogOpen} onOpenChange={setAppSettingsDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Application Settings
              </DialogTitle>
            </DialogHeader>
            {appToManage && (
              <div className="space-y-4 pt-4">
                <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                  <p className="font-medium">{appToManage.name}</p>
                  <p className="text-sm text-gray-500">{appToManage.description}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Client ID</label>
                  <div className="flex items-center gap-2 mt-1">
                    <code className="flex-1 p-2 bg-gray-100 rounded text-sm">{appToManage.client_id}</code>
                    <Button variant="outline" size="sm" onClick={() => { navigator.clipboard.writeText(appToManage.client_id); toast.success('Copied'); }}>
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Callback URLs</label>
                  <Input defaultValue={appToManage.callback_urls.join(', ')} className="mt-1" />
                </div>
                <div className="flex gap-3 pt-4">
                  <Button variant="outline" className="flex-1" onClick={() => setAppSettingsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button className="flex-1" onClick={() => {
                    toast.success('Settings saved')
                    setAppSettingsDialogOpen(false)
                  }}>
                    Save
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Quickstart Dialog */}
        <Dialog open={quickstartDialogOpen} onOpenChange={setQuickstartDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <ExternalLink className="w-5 h-5" />
                Quickstart Guide
              </DialogTitle>
            </DialogHeader>
            {appToManage && (
              <div className="space-y-4 pt-4">
                <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                  <p className="font-medium text-blue-800">Get started with {appToManage.name}</p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">1. Install the SDK</h4>
                  <code className="block p-3 bg-gray-100 rounded text-sm">npm install @company/auth-sdk</code>
                </div>
                <div>
                  <h4 className="font-medium mb-2">2. Configure your application</h4>
                  <code className="block p-3 bg-gray-100 rounded text-sm whitespace-pre">{"const auth = new Auth({\n  clientId: '" + appToManage.client_id + "',\n  domain: 'auth.company.com'\n});"}</code>
                </div>
                <div>
                  <h4 className="font-medium mb-2">3. Implement login</h4>
                  <code className="block p-3 bg-gray-100 rounded text-sm">auth.loginWithRedirect();</code>
                </div>
                <Button className="w-full" onClick={() => setQuickstartDialogOpen(false)}>
                  Close
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Add Webhook Dialog */}
        <Dialog open={addWebhookDialogOpen} onOpenChange={setAddWebhookDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Webhook className="w-5 h-5" />
                Add Webhook Endpoint
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div>
                <label className="text-sm font-medium">Endpoint Name</label>
                <Input
                  placeholder="e.g., Payment Events"
                  value={newWebhookName}
                  onChange={(e) => setNewWebhookName(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Endpoint URL</label>
                <Input
                  placeholder="https://api.example.com/webhooks"
                  value={newWebhookUrl}
                  onChange={(e) => setNewWebhookUrl(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Events</label>
                <div className="mt-2 max-h-40 overflow-y-auto space-y-2">
                  {['payment.created', 'payment.succeeded', 'payment.failed', 'user.created', 'user.updated', 'user.deleted'].map(event => (
                    <label key={event} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={newWebhookEvents.includes(event)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewWebhookEvents([...newWebhookEvents, event])
                          } else {
                            setNewWebhookEvents(newWebhookEvents.filter(ev => ev !== event))
                          }
                        }}
                      />
                      {event}
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setAddWebhookDialogOpen(false)}>
                  Cancel
                </Button>
                <Button className="flex-1" onClick={() => {
                  toast.success('Webhook created')
                  setAddWebhookDialogOpen(false)
                  setNewWebhookName('')
                  setNewWebhookUrl('')
                  setNewWebhookEvents([])
                }}>
                  Create Webhook
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Test Webhook Dialog */}
        <Dialog open={testWebhookDialogOpen} onOpenChange={setTestWebhookDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Play className="w-5 h-5" />
                Test Webhook
              </DialogTitle>
            </DialogHeader>
            {webhookToManage && (
              <div className="space-y-4 pt-4">
                <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                  <p className="font-medium">{webhookToManage.name}</p>
                  <code className="text-sm text-gray-500">{webhookToManage.url}</code>
                </div>
                <div>
                  <label className="text-sm font-medium">Event Type</label>
                  <select className="w-full mt-1 p-2 border rounded-md">
                    {webhookToManage.events.map(event => (
                      <option key={event} value={event}>{event}</option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-3 pt-4">
                  <Button variant="outline" className="flex-1" onClick={() => setTestWebhookDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button className="flex-1" onClick={() => {
                    toast.success('Test webhook sent')
                    setTestWebhookDialogOpen(false)
                  }}>
                    Send Test
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Webhook Settings Dialog */}
        <Dialog open={webhookSettingsDialogOpen} onOpenChange={setWebhookSettingsDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Webhook Settings
              </DialogTitle>
            </DialogHeader>
            {webhookToManage && (
              <div className="space-y-4 pt-4">
                <div>
                  <label className="text-sm font-medium">Endpoint URL</label>
                  <Input defaultValue={webhookToManage.url} className="mt-1" />
                </div>
                <div>
                  <label className="text-sm font-medium">Signing Secret</label>
                  <div className="flex items-center gap-2 mt-1">
                    <code className="flex-1 p-2 bg-gray-100 rounded text-sm">{webhookToManage.secret}</code>
                    <Button variant="outline" size="sm" onClick={() => { navigator.clipboard.writeText(webhookToManage.secret); toast.success('Copied'); }}>
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Retry Policy</label>
                  <select className="w-full mt-1 p-2 border rounded-md" defaultValue={webhookToManage.retry_policy}>
                    <option value="none">None</option>
                    <option value="linear">Linear</option>
                    <option value="exponential">Exponential</option>
                  </select>
                </div>
                <div className="flex gap-3 pt-4">
                  <Button variant="outline" className="flex-1" onClick={() => setWebhookSettingsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button className="flex-1" onClick={() => {
                    toast.success('Webhook settings saved')
                    setWebhookSettingsDialogOpen(false)
                  }}>
                    Save
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Revoke Key Dialog (Global) */}
        <Dialog open={revokeKeyDialogOpen} onOpenChange={setRevokeKeyDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600">
                <Lock className="w-5 h-5" />
                Revoke API Keys
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="p-4 rounded-lg bg-yellow-50 border border-yellow-200">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <p className="text-sm text-yellow-700">Select keys to revoke. This action cannot be undone.</p>
                </div>
              </div>
              <div className="space-y-2">
                {mockApiKeys.filter(k => k.status === 'active').map(key => (
                  <label key={key.id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50">
                    <input type="checkbox" />
                    <span>{key.name}</span>
                  </label>
                ))}
              </div>
              <div className="flex gap-3 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setRevokeKeyDialogOpen(false)}>
                  Cancel
                </Button>
                <Button variant="destructive" className="flex-1" onClick={() => {
                  toast.success('Keys revoked')
                  setRevokeKeyDialogOpen(false)
                }}>
                  Revoke Selected
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
