'use client'

import { useState, useMemo } from 'react'
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
  Key, Shield, TrendingUp, AlertCircle, Plus, Copy, Eye, EyeOff,
  RefreshCw, Settings, CheckCircle, XCircle, Clock, Lock, Trash2,
  Search, Filter, MoreHorizontal, Globe, Webhook, Zap, Activity,
  BarChart3, Users, Code, Terminal, Link, ExternalLink, Download,
  AlertTriangle, Info, Database, Server, Fingerprint, ShieldCheck,
  RotateCcw, History, FileText, Bell, Calendar, Hash, Layers,
  ChevronRight, ArrowUpRight, ArrowDownRight, Play, Pause, Edit,
  Cpu, Network, CircleDot, LayoutGrid, List
} from 'lucide-react'

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
// MAIN COMPONENT
// ============================================================================

export default function ApiKeysClient() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedKey, setSelectedKey] = useState<ApiKey | null>(null)
  const [selectedApp, setSelectedApp] = useState<Application | null>(null)
  const [selectedLog, setSelectedLog] = useState<ApiLog | null>(null)
  const [selectedWebhook, setSelectedWebhook] = useState<WebhookEndpoint | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list')

  // Dashboard stats
  const stats = useMemo(() => ({
    totalKeys: mockApiKeys.length,
    activeKeys: mockApiKeys.filter(k => k.status === 'active').length,
    totalRequests: mockApiKeys.reduce((sum, k) => sum + k.total_requests, 0),
    requestsToday: mockApiKeys.reduce((sum, k) => sum + k.requests_today, 0),
    expiringSoon: mockApiKeys.filter(k => {
      if (!k.expires_at) return false
      const days = Math.ceil((new Date(k.expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      return days > 0 && days <= 30
    }).length,
    totalApps: mockApplications.length,
    totalWebhooks: mockWebhooks.length,
    failingWebhooks: mockWebhooks.filter(w => w.status === 'failing').length
  }), [])

  // Filtered data
  const filteredKeys = useMemo(() => {
    return mockApiKeys.filter(key =>
      key.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      key.key_prefix.toLowerCase().includes(searchQuery.toLowerCase()) ||
      key.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    )
  }, [searchQuery])

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50 dark:bg-none dark:bg-gray-900 p-8">
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
              <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button className="bg-white text-slate-700 hover:bg-gray-100">
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
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${stat.color} flex items-center justify-center mb-3`}>
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
                { icon: Key, label: 'New Key', color: 'text-slate-600 dark:text-slate-400' },
                { icon: Activity, label: 'Live Feed', color: 'text-green-600 dark:text-green-400' },
                { icon: BarChart3, label: 'Analytics', color: 'text-blue-600 dark:text-blue-400' },
                { icon: Shield, label: 'Security', color: 'text-red-600 dark:text-red-400' },
                { icon: AlertTriangle, label: 'Alerts', color: 'text-orange-600 dark:text-orange-400' },
                { icon: FileText, label: 'Docs', color: 'text-purple-600 dark:text-purple-400' },
                { icon: Download, label: 'Export', color: 'text-cyan-600 dark:text-cyan-400' },
                { icon: Settings, label: 'Settings', color: 'text-gray-600 dark:text-gray-400' }
              ].map((action, i) => (
                <Button key={i} variant="outline" className="flex flex-col items-center gap-2 h-auto py-4 hover:scale-105 transition-all duration-200">
                  <action.icon className={`h-5 w-5 ${action.color}`} />
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
                          <p className={`text-sm font-medium ${log.status_code < 400 ? 'text-green-600' : 'text-red-600'}`}>
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
                { icon: Plus, label: 'Generate Key', color: 'text-amber-600 dark:text-amber-400' },
                { icon: RefreshCw, label: 'Rotate All', color: 'text-blue-600 dark:text-blue-400' },
                { icon: Copy, label: 'Copy Key', color: 'text-green-600 dark:text-green-400' },
                { icon: Lock, label: 'Revoke', color: 'text-red-600 dark:text-red-400' },
                { icon: Clock, label: 'Set Expiry', color: 'text-purple-600 dark:text-purple-400' },
                { icon: Shield, label: 'Permissions', color: 'text-orange-600 dark:text-orange-400' },
                { icon: Download, label: 'Export', color: 'text-cyan-600 dark:text-cyan-400' },
                { icon: History, label: 'History', color: 'text-gray-600 dark:text-gray-400' }
              ].map((action, i) => (
                <Button key={i} variant="outline" className="flex flex-col items-center gap-2 h-auto py-4 hover:scale-105 transition-all duration-200">
                  <action.icon className={`h-5 w-5 ${action.color}`} />
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
                <Button variant="outline" size="sm">
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
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
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
                      <Button variant="outline" size="sm" className="flex-1">
                        <Copy className="w-3 h-3 mr-1" />
                        Copy
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        <RefreshCw className="w-3 h-3 mr-1" />
                        Rotate
                      </Button>
                      <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
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
              <Button>
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

                    <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t dark:border-gray-700">
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
                      <Button variant="outline" size="sm" className="flex-1">
                        <Settings className="w-3 h-3 mr-1" />
                        Settings
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
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
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4 mr-2" />
                  Filters
                </Button>
              </div>
              <Button variant="outline">
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
                            <span className={`text-sm font-medium ${log.status_code < 400 ? 'text-green-600' : 'text-red-600'}`}>
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
              <Button>
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
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          webhook.status === 'active' ? 'bg-green-100' :
                          webhook.status === 'failing' ? 'bg-red-100' : 'bg-gray-100'
                        }`}>
                          <Webhook className={`w-5 h-5 ${
                            webhook.status === 'active' ? 'text-green-600' :
                            webhook.status === 'failing' ? 'text-red-600' : 'text-gray-600'
                          }`} />
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
                        <Button variant="ghost" size="sm">
                          <Play className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Settings className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {webhook.events.map(event => (
                        <Badge key={event} variant="outline" className="text-xs">{event}</Badge>
                      ))}
                    </div>

                    <div className="grid grid-cols-4 gap-4">
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
                      <Button variant="ghost" size="sm">
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
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
                    <Button variant="outline" className="flex-1">
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Rotate Key
                    </Button>
                    <Button variant="outline" className="flex-1 text-red-600 hover:text-red-700">
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
                  <span className={`font-medium ${selectedLog.status_code < 400 ? 'text-green-600' : 'text-red-600'}`}>
                    {selectedLog.status_code}
                  </span>
                </div>

                <code className="block p-3 rounded-lg bg-gray-100 dark:bg-gray-800 text-sm">
                  {selectedLog.endpoint}
                </code>

                <div className="grid grid-cols-2 gap-4">
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
      </div>
    </div>
  )
}
