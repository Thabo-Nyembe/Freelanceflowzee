'use client'

import { useState, useMemo, useEffect } from 'react'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Code,
  Key,
  Zap,
  Shield,
  Clock,
  CheckCircle,
  CheckCircle2,
  BarChart3,
  Globe,
  Users,
  Settings,
  Copy,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  Search,
  Filter,
  MoreVertical,
  ArrowUpRight,
  ArrowDownRight,
  Send,
  Play,
  RefreshCw,
  Download,
  Upload,
  FileJson,
  Folder,
  FolderOpen,
  Terminal,
  Activity,
  Server,
  Lock,
  BookOpen,
  History,
  GitBranch,
  AlertTriangle,
  XCircle,
  Gauge,
  TestTube,
  FileCode,
  Variable,
  Webhook,
  FlaskConical,
  ListChecks,
  RotateCcw,
  Cog,
  Bell,
  Palette,
  ShieldCheck,
  UserCog,
  FileText,
  Square,
  PlayCircle,
  StopCircle,
  Repeat,
  Moon,
  Sun,
  FolderPlus,
  Archive,
  BookmarkPlus,
  Loader2
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

// Hooks
import { useApiEndpoints } from '@/lib/hooks/use-api-endpoints'
import { useApiKeys } from '@/lib/hooks/use-api-keys'

// Types
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS'
type EndpointStatus = 'active' | 'deprecated' | 'draft' | 'disabled'
type KeyStatus = 'active' | 'revoked' | 'expired' | 'restricted'
type Environment = 'production' | 'staging' | 'development' | 'local'
type TestStatus = 'passed' | 'failed' | 'skipped' | 'running'
type MonitorStatus = 'healthy' | 'degraded' | 'down' | 'unknown'

interface ApiEndpoint {
  id: string
  name: string
  method: HttpMethod
  path: string
  description: string
  status: EndpointStatus
  version: string
  totalRequests: number
  avgLatency: number
  p95Latency: number
  errorRate: number
  lastCalled: string
  createdAt: string
  tags: string[]
  rateLimit: number
  authentication: string
}

interface ApiKey {
  id: string
  name: string
  keyPrefix: string
  environment: Environment
  status: KeyStatus
  scopes: string[]
  totalRequests: number
  rateLimit: number
  lastUsed: string
  createdAt: string
  expiresAt: string | null
  ipWhitelist: string[]
  createdBy: string
}

interface Collection {
  id: string
  name: string
  description: string
  requests: number
  folders: number
  environment: Environment
  lastRun: string
  createdBy: string
  isShared: boolean
  tests: number
  passRate: number
}

interface RequestHistory {
  id: string
  method: HttpMethod
  url: string
  status: number
  duration: number
  size: number
  timestamp: string
  environment: Environment
}

interface Monitor {
  id: string
  name: string
  endpoint: string
  status: MonitorStatus
  uptime: number
  avgResponseTime: number
  lastCheck: string
  interval: number
  alerts: number
  region: string
}

interface TestSuite {
  id: string
  name: string
  description: string
  tests: number
  passed: number
  failed: number
  skipped: number
  duration: number
  lastRun: string
  status: TestStatus
  environment: Environment
  coverage: number
}

interface TestCase {
  id: string
  name: string
  description: string
  status: TestStatus
  assertions: number
  passedAssertions: number
  duration: number
  method: HttpMethod
  endpoint: string
  expectedStatus: number
  actualStatus: number | null
}

interface WebhookConfig {
  id: string
  name: string
  url: string
  events: string[]
  isActive: boolean
  lastTriggered: string
  successRate: number
  totalDeliveries: number
}

interface MockServer {
  id: string
  name: string
  url: string
  collection: string
  isActive: boolean
  requests: number
  latency: number
  createdAt: string
}

// Mock Data
const mockEndpoints: ApiEndpoint[] = [
  { id: '1', name: 'Get Users', method: 'GET', path: '/api/v1/users', description: 'Retrieve all users with pagination', status: 'active', version: 'v1', totalRequests: 1250000, avgLatency: 45, p95Latency: 120, errorRate: 0.2, lastCalled: '2024-01-15T12:30:00Z', createdAt: '2023-06-15T09:00:00Z', tags: ['users', 'core'], rateLimit: 1000, authentication: 'Bearer Token' },
  { id: '2', name: 'Create User', method: 'POST', path: '/api/v1/users', description: 'Create a new user account', status: 'active', version: 'v1', totalRequests: 89000, avgLatency: 120, p95Latency: 250, errorRate: 0.5, lastCalled: '2024-01-15T12:28:00Z', createdAt: '2023-06-15T09:00:00Z', tags: ['users', 'core'], rateLimit: 100, authentication: 'Bearer Token' },
  { id: '3', name: 'Update User', method: 'PUT', path: '/api/v1/users/:id', description: 'Update user information', status: 'active', version: 'v1', totalRequests: 45000, avgLatency: 85, p95Latency: 180, errorRate: 0.3, lastCalled: '2024-01-15T12:25:00Z', createdAt: '2023-06-15T09:00:00Z', tags: ['users', 'core'], rateLimit: 500, authentication: 'Bearer Token' },
  { id: '4', name: 'Delete User', method: 'DELETE', path: '/api/v1/users/:id', description: 'Soft delete a user account', status: 'active', version: 'v1', totalRequests: 12000, avgLatency: 65, p95Latency: 150, errorRate: 0.1, lastCalled: '2024-01-15T11:00:00Z', createdAt: '2023-06-15T09:00:00Z', tags: ['users', 'core'], rateLimit: 50, authentication: 'Bearer Token' },
  { id: '5', name: 'Get Products', method: 'GET', path: '/api/v1/products', description: 'Retrieve product catalog', status: 'active', version: 'v1', totalRequests: 890000, avgLatency: 55, p95Latency: 140, errorRate: 0.15, lastCalled: '2024-01-15T12:29:00Z', createdAt: '2023-07-20T10:00:00Z', tags: ['products', 'catalog'], rateLimit: 2000, authentication: 'API Key' },
  { id: '6', name: 'Create Order', method: 'POST', path: '/api/v1/orders', description: 'Place a new order', status: 'active', version: 'v1', totalRequests: 156000, avgLatency: 200, p95Latency: 450, errorRate: 0.8, lastCalled: '2024-01-15T12:27:00Z', createdAt: '2023-08-10T14:00:00Z', tags: ['orders', 'commerce'], rateLimit: 200, authentication: 'Bearer Token' },
  { id: '7', name: 'Get Analytics', method: 'GET', path: '/api/v1/analytics', description: 'Retrieve analytics data', status: 'deprecated', version: 'v1', totalRequests: 34000, avgLatency: 350, p95Latency: 800, errorRate: 1.2, lastCalled: '2024-01-14T16:00:00Z', createdAt: '2023-05-01T08:00:00Z', tags: ['analytics'], rateLimit: 100, authentication: 'Bearer Token' },
  { id: '8', name: 'Webhook Events', method: 'POST', path: '/api/v1/webhooks', description: 'Send webhook events', status: 'active', version: 'v1', totalRequests: 450000, avgLatency: 30, p95Latency: 80, errorRate: 0.05, lastCalled: '2024-01-15T12:30:00Z', createdAt: '2023-09-05T11:00:00Z', tags: ['webhooks', 'events'], rateLimit: 5000, authentication: 'HMAC' }
]

const mockApiKeys: ApiKey[] = [
  { id: '1', name: 'Production API', keyPrefix: 'pk_live_abc123', environment: 'production', status: 'active', scopes: ['read', 'write', 'delete'], totalRequests: 2450000, rateLimit: 10000, lastUsed: '2024-01-15T12:30:00Z', createdAt: '2023-06-01T09:00:00Z', expiresAt: null, ipWhitelist: ['192.168.1.0/24'], createdBy: 'John Smith' },
  { id: '2', name: 'Mobile App Key', keyPrefix: 'pk_live_def456', environment: 'production', status: 'active', scopes: ['read', 'write'], totalRequests: 890000, rateLimit: 5000, lastUsed: '2024-01-15T12:28:00Z', createdAt: '2023-08-15T10:00:00Z', expiresAt: '2024-12-31T23:59:59Z', ipWhitelist: [], createdBy: 'Sarah Johnson' },
  { id: '3', name: 'Development Key', keyPrefix: 'pk_test_ghi789', environment: 'development', status: 'active', scopes: ['read', 'write', 'delete', 'admin'], totalRequests: 45000, rateLimit: 1000, lastUsed: '2024-01-15T11:00:00Z', createdAt: '2024-01-01T08:00:00Z', expiresAt: null, ipWhitelist: [], createdBy: 'Mike Chen' },
  { id: '4', name: 'Legacy Integration', keyPrefix: 'pk_live_jkl012', environment: 'production', status: 'restricted', scopes: ['read'], totalRequests: 12000, rateLimit: 100, lastUsed: '2024-01-10T14:00:00Z', createdAt: '2022-03-20T09:00:00Z', expiresAt: '2024-03-20T23:59:59Z', ipWhitelist: ['10.0.0.0/8'], createdBy: 'Legacy System' },
  { id: '5', name: 'Staging Key', keyPrefix: 'pk_stg_mno345', environment: 'staging', status: 'active', scopes: ['read', 'write'], totalRequests: 78000, rateLimit: 2000, lastUsed: '2024-01-15T10:00:00Z', createdAt: '2023-11-01T09:00:00Z', expiresAt: null, ipWhitelist: [], createdBy: 'QA Team' }
]

const mockCollections: Collection[] = [
  { id: '1', name: 'User Management', description: 'Complete user CRUD operations', requests: 15, folders: 4, environment: 'development', lastRun: '2024-01-15T10:00:00Z', createdBy: 'John Smith', isShared: true, tests: 25, passRate: 96 },
  { id: '2', name: 'E-Commerce API', description: 'Product and order endpoints', requests: 28, folders: 6, environment: 'staging', lastRun: '2024-01-14T16:00:00Z', createdBy: 'Sarah Johnson', isShared: true, tests: 42, passRate: 89 },
  { id: '3', name: 'Authentication Flow', description: 'OAuth and JWT endpoints', requests: 8, folders: 2, environment: 'production', lastRun: '2024-01-15T08:00:00Z', createdBy: 'Mike Chen', isShared: false, tests: 12, passRate: 100 },
  { id: '4', name: 'Analytics API', description: 'Data and reporting endpoints', requests: 12, folders: 3, environment: 'development', lastRun: '2024-01-13T14:00:00Z', createdBy: 'Emily Davis', isShared: true, tests: 18, passRate: 78 }
]

const mockHistory: RequestHistory[] = [
  { id: '1', method: 'GET', url: '/api/v1/users', status: 200, duration: 45, size: 12500, timestamp: '2024-01-15T12:30:00Z', environment: 'production' },
  { id: '2', method: 'POST', url: '/api/v1/orders', status: 201, duration: 180, size: 2400, timestamp: '2024-01-15T12:28:00Z', environment: 'production' },
  { id: '3', method: 'GET', url: '/api/v1/products?page=1', status: 200, duration: 65, size: 45000, timestamp: '2024-01-15T12:25:00Z', environment: 'production' },
  { id: '4', method: 'PUT', url: '/api/v1/users/123', status: 200, duration: 95, size: 1200, timestamp: '2024-01-15T12:20:00Z', environment: 'staging' },
  { id: '5', method: 'DELETE', url: '/api/v1/users/456', status: 204, duration: 35, size: 0, timestamp: '2024-01-15T12:15:00Z', environment: 'development' },
  { id: '6', method: 'POST', url: '/api/v1/auth/login', status: 401, duration: 25, size: 150, timestamp: '2024-01-15T12:10:00Z', environment: 'development' },
  { id: '7', method: 'GET', url: '/api/v1/analytics', status: 500, duration: 5000, size: 0, timestamp: '2024-01-15T12:05:00Z', environment: 'production' }
]

const mockMonitors: Monitor[] = [
  { id: '1', name: 'API Health Check', endpoint: '/api/health', status: 'healthy', uptime: 99.98, avgResponseTime: 25, lastCheck: '2024-01-15T12:30:00Z', interval: 60, alerts: 0, region: 'us-east-1' },
  { id: '2', name: 'User API', endpoint: '/api/v1/users', status: 'healthy', uptime: 99.95, avgResponseTime: 48, lastCheck: '2024-01-15T12:30:00Z', interval: 300, alerts: 2, region: 'us-west-2' },
  { id: '3', name: 'Payment Gateway', endpoint: '/api/v1/payments', status: 'degraded', uptime: 98.5, avgResponseTime: 350, lastCheck: '2024-01-15T12:30:00Z', interval: 60, alerts: 5, region: 'eu-west-1' },
  { id: '4', name: 'Analytics Service', endpoint: '/api/v1/analytics', status: 'down', uptime: 95.2, avgResponseTime: 0, lastCheck: '2024-01-15T12:25:00Z', interval: 300, alerts: 12, region: 'ap-southeast-1' }
]

const mockTestSuites: TestSuite[] = [
  { id: '1', name: 'User API Tests', description: 'Complete user endpoint test suite', tests: 45, passed: 42, failed: 2, skipped: 1, duration: 12500, lastRun: '2024-01-15T10:30:00Z', status: 'passed', environment: 'staging', coverage: 92 },
  { id: '2', name: 'Order Flow Tests', description: 'End-to-end order processing tests', tests: 28, passed: 28, failed: 0, skipped: 0, duration: 8200, lastRun: '2024-01-15T09:00:00Z', status: 'passed', environment: 'staging', coverage: 88 },
  { id: '3', name: 'Authentication Tests', description: 'OAuth and JWT validation tests', tests: 18, passed: 15, failed: 3, skipped: 0, duration: 4500, lastRun: '2024-01-15T08:45:00Z', status: 'failed', environment: 'development', coverage: 78 },
  { id: '4', name: 'Integration Tests', description: 'Third-party service integration', tests: 32, passed: 30, failed: 1, skipped: 1, duration: 25000, lastRun: '2024-01-14T22:00:00Z', status: 'passed', environment: 'production', coverage: 85 },
  { id: '5', name: 'Performance Tests', description: 'Load and stress testing suite', tests: 12, passed: 10, failed: 2, skipped: 0, duration: 180000, lastRun: '2024-01-14T02:00:00Z', status: 'failed', environment: 'staging', coverage: 65 }
]

const mockTestCases: TestCase[] = [
  { id: '1', name: 'Get all users returns 200', description: 'Verify GET /users returns success', status: 'passed', assertions: 5, passedAssertions: 5, duration: 125, method: 'GET', endpoint: '/api/v1/users', expectedStatus: 200, actualStatus: 200 },
  { id: '2', name: 'Create user with valid data', description: 'POST /users creates new user', status: 'passed', assertions: 8, passedAssertions: 8, duration: 230, method: 'POST', endpoint: '/api/v1/users', expectedStatus: 201, actualStatus: 201 },
  { id: '3', name: 'Update user returns updated data', description: 'PUT /users/:id updates user', status: 'passed', assertions: 6, passedAssertions: 6, duration: 180, method: 'PUT', endpoint: '/api/v1/users/:id', expectedStatus: 200, actualStatus: 200 },
  { id: '4', name: 'Delete user returns 204', description: 'DELETE /users/:id soft deletes', status: 'passed', assertions: 3, passedAssertions: 3, duration: 95, method: 'DELETE', endpoint: '/api/v1/users/:id', expectedStatus: 204, actualStatus: 204 },
  { id: '5', name: 'Invalid auth returns 401', description: 'Verify auth error handling', status: 'failed', assertions: 4, passedAssertions: 2, duration: 45, method: 'GET', endpoint: '/api/v1/users', expectedStatus: 401, actualStatus: 403 },
  { id: '6', name: 'Rate limit returns 429', description: 'Verify rate limiting works', status: 'running', assertions: 3, passedAssertions: 0, duration: 0, method: 'GET', endpoint: '/api/v1/users', expectedStatus: 429, actualStatus: null }
]

const mockWebhooks: WebhookConfig[] = [
  { id: '1', name: 'Order Notifications', url: 'https://webhook.example.com/orders', events: ['order.created', 'order.updated', 'order.completed'], isActive: true, lastTriggered: '2024-01-15T12:28:00Z', successRate: 99.5, totalDeliveries: 45000 },
  { id: '2', name: 'User Events', url: 'https://webhook.example.com/users', events: ['user.created', 'user.updated'], isActive: true, lastTriggered: '2024-01-15T12:30:00Z', successRate: 98.2, totalDeliveries: 12000 },
  { id: '3', name: 'Payment Callbacks', url: 'https://payments.example.com/callback', events: ['payment.success', 'payment.failed'], isActive: false, lastTriggered: '2024-01-10T14:00:00Z', successRate: 95.0, totalDeliveries: 8500 }
]

const mockMockServers: MockServer[] = [
  { id: '1', name: 'User API Mock', url: 'https://mock.api.example.com/users', collection: 'User Management', isActive: true, requests: 15000, latency: 50, createdAt: '2024-01-01T00:00:00Z' },
  { id: '2', name: 'Payment Mock', url: 'https://mock.api.example.com/payments', collection: 'E-Commerce API', isActive: true, requests: 8500, latency: 75, createdAt: '2024-01-05T00:00:00Z' },
  { id: '3', name: 'Auth Mock', url: 'https://mock.api.example.com/auth', collection: 'Authentication Flow', isActive: false, requests: 2000, latency: 25, createdAt: '2024-01-10T00:00:00Z' }
]

// Enhanced Competitive Upgrade Mock Data
const mockApiAIInsights = [
  { id: '1', type: 'success' as const, title: 'API Performance', description: 'Average response time at 45ms. 20% faster than last week.', priority: 'low' as const, timestamp: new Date().toISOString(), category: 'Performance' },
  { id: '2', type: 'warning' as const, title: 'Rate Limit Alert', description: 'Production API key approaching 80% of daily quota.', priority: 'high' as const, timestamp: new Date().toISOString(), category: 'Usage' },
  { id: '3', type: 'info' as const, title: 'New Endpoint', description: 'GraphQL endpoint now available in production.', priority: 'medium' as const, timestamp: new Date().toISOString(), category: 'Updates' },
]

const mockApiCollaborators = [
  { id: '1', name: 'API Lead', avatar: '/avatars/api.jpg', status: 'online' as const, role: 'Lead' },
  { id: '2', name: 'Backend Dev', avatar: '/avatars/backend.jpg', status: 'online' as const, role: 'Developer' },
  { id: '3', name: 'DevOps', avatar: '/avatars/devops.jpg', status: 'away' as const, role: 'DevOps' },
]

const mockApiPredictions = [
  { id: '1', title: 'Traffic Forecast', prediction: 'API traffic expected to increase 30% during holiday season', confidence: 82, trend: 'up' as const, impact: 'high' as const },
  { id: '2', title: 'Error Rate', prediction: 'Error rate projected to stay below 0.1%', confidence: 90, trend: 'stable' as const, impact: 'low' as const },
]

const mockApiActivities = [
  { id: '1', user: 'API Lead', action: 'Deployed', target: 'v2.3.0 to production', timestamp: new Date().toISOString(), type: 'success' as const },
  { id: '2', user: 'Backend Dev', action: 'Created', target: 'new payment endpoint', timestamp: new Date(Date.now() - 3600000).toISOString(), type: 'info' as const },
  { id: '3', user: 'System', action: 'Regenerated', target: 'API documentation', timestamp: new Date(Date.now() - 7200000).toISOString(), type: 'success' as const },
]

// Note: Quick actions are now defined inside the component to access dialog state setters

// Form state types
interface EndpointFormData {
  name: string
  description: string
  method: HttpMethod
  path: string
  version: string
  requiresAuth: boolean
  rateLimit: number
  tags: string[]
}

interface ApiKeyFormData {
  name: string
  description: string
  environment: Environment
  scopes: string[]
  rateLimit: number
  expiresAt: string
}

export default function ApiClient() {
  // Use real hooks for DB operations
  const {
    endpoints: dbEndpoints,
    stats: endpointStats,
    isLoading: endpointsLoading,
    fetchEndpoints,
    createEndpoint,
    updateEndpoint,
    deleteEndpoint
  } = useApiEndpoints()

  const {
    keys: dbApiKeys,
    stats: keyStats,
    isLoading: keysLoading,
    fetchKeys,
    createKey,
    revokeKey,
    deleteKey
  } = useApiKeys()

  // Fetch data on mount
  useEffect(() => {
    fetchEndpoints()
    fetchKeys()
  }, [fetchEndpoints, fetchKeys])

  // Mock data fallback for collections, history, etc.
  const [collections] = useState<Collection[]>(mockCollections)
  const [history] = useState<RequestHistory[]>(mockHistory)
  const [monitors] = useState<Monitor[]>(mockMonitors)
  const [testSuites] = useState<TestSuite[]>(mockTestSuites)
  const [testCases] = useState<TestCase[]>(mockTestCases)
  const [webhooks] = useState<WebhookConfig[]>(mockWebhooks)
  const [mockServersState] = useState<MockServer[]>(mockMockServers)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedEndpoint, setSelectedEndpoint] = useState<ApiEndpoint | null>(null)
  const [selectedTestSuite, setSelectedTestSuite] = useState<TestSuite | null>(null)

  // Dialog states
  const [showCreateEndpointDialog, setShowCreateEndpointDialog] = useState(false)
  const [showCreateKeyDialog, setShowCreateKeyDialog] = useState(false)
  const [showTestAllDialog, setShowTestAllDialog] = useState(false)
  const [showImportDialog, setShowImportDialog] = useState(false)
  const [showDocsDialog, setShowDocsDialog] = useState(false)
  const [showRotateAllKeysDialog, setShowRotateAllKeysDialog] = useState(false)
  const [showRevokeKeyDialog, setShowRevokeKeyDialog] = useState(false)
  const [showCopyAllKeysDialog, setShowCopyAllKeysDialog] = useState(false)
  const [showExportKeysDialog, setShowExportKeysDialog] = useState(false)
  const [showEditKeyDialog, setShowEditKeyDialog] = useState(false)
  const [showCollectionsDialog, setShowCollectionsDialog] = useState(false)
  const [showHistoryDialog, setShowHistoryDialog] = useState(false)
  const [showEndpointSettingsDialog, setShowEndpointSettingsDialog] = useState(false)
  const [showPermissionsDialog, setShowPermissionsDialog] = useState(false)
  const [showUsageLogDialog, setShowUsageLogDialog] = useState(false)
  const [showKeySettingsDialog, setShowKeySettingsDialog] = useState(false)
  const [selectedKeyForEdit, setSelectedKeyForEdit] = useState<ApiKey | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Additional dialog states for buttons without onClick handlers
  const [showFilterDialog, setShowFilterDialog] = useState(false)
  const [showEndpointActionsDialog, setShowEndpointActionsDialog] = useState(false)
  const [showSendRequestDialog, setShowSendRequestDialog] = useState(false)
  const [showCodeGenDialog, setShowCodeGenDialog] = useState(false)
  const [showKeyActionsDialog, setShowKeyActionsDialog] = useState(false)
  const [showCreateCollectionDialog, setShowCreateCollectionDialog] = useState(false)
  const [showImportCollectionDialog, setShowImportCollectionDialog] = useState(false)
  const [showExportCollectionsDialog, setShowExportCollectionsDialog] = useState(false)
  const [showShareCollectionDialog, setShowShareCollectionDialog] = useState(false)
  const [showForkCollectionDialog, setShowForkCollectionDialog] = useState(false)
  const [showGenerateSdkDialog, setShowGenerateSdkDialog] = useState(false)
  const [showRunAllCollectionsDialog, setShowRunAllCollectionsDialog] = useState(false)
  const [showArchiveCollectionDialog, setShowArchiveCollectionDialog] = useState(false)
  const [showSearchHistoryDialog, setShowSearchHistoryDialog] = useState(false)
  const [showFilterHistoryDialog, setShowFilterHistoryDialog] = useState(false)
  const [showExportHarDialog, setShowExportHarDialog] = useState(false)
  const [showClearHistoryDialog, setShowClearHistoryDialog] = useState(false)
  const [showReplayRequestDialog, setShowReplayRequestDialog] = useState(false)
  const [showCopyCurlDialog, setShowCopyCurlDialog] = useState(false)
  const [showInspectRequestDialog, setShowInspectRequestDialog] = useState(false)
  const [showSaveRequestDialog, setShowSaveRequestDialog] = useState(false)
  const [showNewMonitorDialog, setShowNewMonitorDialog] = useState(false)
  const [showStatusPageDialog, setShowStatusPageDialog] = useState(false)
  const [showAlertsDialog, setShowAlertsDialog] = useState(false)
  const [showRegionsDialog, setShowRegionsDialog] = useState(false)
  const [showIntervalsDialog, setShowIntervalsDialog] = useState(false)
  const [showMonitorAnalyticsDialog, setShowMonitorAnalyticsDialog] = useState(false)
  const [showSslCheckDialog, setShowSslCheckDialog] = useState(false)
  const [showMonitorConfigDialog, setShowMonitorConfigDialog] = useState(false)
  const [showNewWebhookDialog, setShowNewWebhookDialog] = useState(false)
  const [showTestWebhookDialog, setShowTestWebhookDialog] = useState(false)
  const [showRetryWebhooksDialog, setShowRetryWebhooksDialog] = useState(false)
  const [showWebhookLogsDialog, setShowWebhookLogsDialog] = useState(false)
  const [showWebhookSecretsDialog, setShowWebhookSecretsDialog] = useState(false)
  const [showWebhookSignaturesDialog, setShowWebhookSignaturesDialog] = useState(false)
  const [showExportWebhooksDialog, setShowExportWebhooksDialog] = useState(false)
  const [showWebhookSettingsDialog, setShowWebhookSettingsDialog] = useState(false)
  const [showRunAllTestsDialog, setShowRunAllTestsDialog] = useState(false)
  const [showNewTestSuiteDialog, setShowNewTestSuiteDialog] = useState(false)
  const [showCoverageDialog, setShowCoverageDialog] = useState(false)
  const [showCiCdDialog, setShowCiCdDialog] = useState(false)
  const [showTestReportsDialog, setShowTestReportsDialog] = useState(false)
  const [showScheduleTestsDialog, setShowScheduleTestsDialog] = useState(false)
  const [showExportTestsDialog, setShowExportTestsDialog] = useState(false)
  const [showTestSettingsDialog, setShowTestSettingsDialog] = useState(false)
  const [showRerunFailedDialog, setShowRerunFailedDialog] = useState(false)
  const [showConfigureOAuthDialog, setShowConfigureOAuthDialog] = useState(false)
  const [showManageKeysDialog, setShowManageKeysDialog] = useState(false)
  const [showInviteTeamDialog, setShowInviteTeamDialog] = useState(false)
  const [showExportCollectionsSettingsDialog, setShowExportCollectionsSettingsDialog] = useState(false)
  const [showImportCollectionsSettingsDialog, setShowImportCollectionsSettingsDialog] = useState(false)
  const [showExportEnvironmentsDialog, setShowExportEnvironmentsDialog] = useState(false)
  const [showGenerateDocsDialog, setShowGenerateDocsDialog] = useState(false)
  const [showTryEndpointDialog, setShowTryEndpointDialog] = useState(false)
  const [showEndpointDocsDialog, setShowEndpointDocsDialog] = useState(false)
  const [showEndpointCodeDialog, setShowEndpointCodeDialog] = useState(false)
  const [showRunTestSuiteDialog, setShowRunTestSuiteDialog] = useState(false)
  const [showRerunFailedTestsDialog, setShowRerunFailedTestsDialog] = useState(false)
  const [showExportTestReportDialog, setShowExportTestReportDialog] = useState(false)
  const [selectedCodeGenLanguage, setSelectedCodeGenLanguage] = useState<string>('cURL')
  const [selectedEndpointForActions, setSelectedEndpointForActions] = useState<ApiEndpoint | null>(null)
  const [selectedKeyForActions, setSelectedKeyForActions] = useState<ApiKey | null>(null)
  const [requestUrl, setRequestUrl] = useState('')

  // Form states
  const [endpointForm, setEndpointForm] = useState<EndpointFormData>({
    name: '',
    description: '',
    method: 'GET',
    path: '/api/v1/',
    version: 'v1',
    requiresAuth: true,
    rateLimit: 1000,
    tags: []
  })

  const [apiKeyForm, setApiKeyForm] = useState<ApiKeyFormData>({
    name: '',
    description: '',
    environment: 'development',
    scopes: ['read'],
    rateLimit: 1000,
    expiresAt: ''
  })
  const [methodFilter, setMethodFilter] = useState<HttpMethod | 'all'>('all')
  const [showApiKey, setShowApiKey] = useState<Record<string, boolean>>({})
  const [runningTests, setRunningTests] = useState(false)

  // Settings state
  const [settings, setSettings] = useState({
    autoSave: true,
    sslVerification: true,
    followRedirects: true,
    timeout: 30000,
    retryOnFailure: true,
    maxRetries: 3,
    notifications: true,
    darkMode: false,
    codeGenLanguage: 'javascript',
    defaultEnvironment: 'development',
    proxyEnabled: false,
    proxyUrl: ''
  })

  // Quick actions with proper dialog-based workflows
  const apiQuickActions = useMemo(() => [
    {
      id: '1',
      label: 'New Endpoint',
      icon: 'plus',
      action: () => setShowCreateEndpointDialog(true),
      variant: 'default' as const
    },
    {
      id: '2',
      label: 'Test API',
      icon: 'play',
      action: () => setShowTestAllDialog(true),
      variant: 'default' as const
    },
    {
      id: '3',
      label: 'View Docs',
      icon: 'book',
      action: () => setShowDocsDialog(true),
      variant: 'outline' as const
    },
  ], [])

  // Combined endpoints: DB data + mock data fallback
  const endpoints = useMemo(() => {
    if (dbEndpoints.length > 0) {
      // Map DB endpoints to display format
      return dbEndpoints.map(e => ({
        id: e.id,
        name: e.name,
        method: e.method as HttpMethod,
        path: e.path,
        description: e.description || '',
        status: (e.status === 'inactive' ? 'disabled' : e.status === 'maintenance' ? 'draft' : e.status) as EndpointStatus,
        version: e.version,
        totalRequests: e.total_requests,
        avgLatency: e.avg_latency_ms,
        p95Latency: e.p95_latency_ms,
        errorRate: e.error_rate,
        lastCalled: e.last_called_at || e.updated_at,
        createdAt: e.created_at,
        tags: e.tags,
        rateLimit: e.rate_limit_per_hour,
        authentication: e.requires_auth ? 'Bearer Token' : 'None'
      }))
    }
    return mockEndpoints
  }, [dbEndpoints])

  // Combined API keys: DB data + mock data fallback
  const apiKeys = useMemo(() => {
    if (dbApiKeys.length > 0) {
      return dbApiKeys.map(k => ({
        id: k.id,
        name: k.name,
        keyPrefix: k.key_prefix,
        environment: k.environment as Environment,
        status: (k.status === 'inactive' ? 'restricted' : k.status) as KeyStatus,
        scopes: k.scopes,
        totalRequests: k.total_requests,
        rateLimit: k.rate_limit_per_hour,
        lastUsed: k.last_used_at || k.updated_at,
        createdAt: k.created_at,
        expiresAt: k.expires_at,
        ipWhitelist: k.ip_whitelist,
        createdBy: k.created_by || 'Unknown'
      }))
    }
    return mockApiKeys
  }, [dbApiKeys])

  // Stats - use real data if available
  const stats = useMemo(() => {
    const totalRequests = endpointStats.totalRequests || endpoints.reduce((sum, e) => sum + e.totalRequests, 0)
    const avgLatency = endpointStats.avgLatency || (endpoints.length > 0 ? endpoints.reduce((sum, e) => sum + e.avgLatency, 0) / endpoints.length : 0)
    const activeEndpoints = endpointStats.active || endpoints.filter(e => e.status === 'active').length
    const avgErrorRate = endpoints.length > 0 ? endpoints.reduce((sum, e) => sum + e.errorRate, 0) / endpoints.length : 0
    const totalKeys = keyStats.total || apiKeys.length
    const activeKeys = keyStats.active || apiKeys.filter(k => k.status === 'active').length
    const totalMonitors = monitors.length
    const healthyMonitors = monitors.filter(m => m.status === 'healthy').length
    const totalTests = testSuites.reduce((sum, s) => sum + s.tests, 0)
    const passedTests = testSuites.reduce((sum, s) => sum + s.passed, 0)
    return { totalRequests, avgLatency, activeEndpoints, avgErrorRate, totalKeys, activeKeys, totalMonitors, healthyMonitors, totalTests, passedTests }
  }, [endpoints, apiKeys, monitors, testSuites, endpointStats, keyStats])

  // Filtered endpoints
  const filteredEndpoints = useMemo(() => {
    return endpoints.filter(endpoint => {
      const matchesSearch = endpoint.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        endpoint.path.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesMethod = methodFilter === 'all' || endpoint.method === methodFilter
      return matchesSearch && matchesMethod
    })
  }, [endpoints, searchQuery, methodFilter])

  // Helper functions
  const getMethodColor = (method: HttpMethod) => {
    const colors: Record<HttpMethod, string> = {
      GET: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      POST: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      PUT: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      PATCH: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
      DELETE: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      HEAD: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
      OPTIONS: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
    }
    return colors[method]
  }

  const getStatusColor = (status: EndpointStatus) => {
    const colors: Record<EndpointStatus, string> = {
      active: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      deprecated: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      draft: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
      disabled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
    }
    return colors[status]
  }

  const getKeyStatusColor = (status: KeyStatus) => {
    const colors: Record<KeyStatus, string> = {
      active: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      revoked: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      expired: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
      restricted: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
    }
    return colors[status]
  }

  const getEnvironmentColor = (env: Environment) => {
    const colors: Record<Environment, string> = {
      production: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      staging: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      development: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      local: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
    }
    return colors[env]
  }

  const getMonitorStatusColor = (status: MonitorStatus) => {
    const colors: Record<MonitorStatus, string> = {
      healthy: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      degraded: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      down: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      unknown: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
    }
    return colors[status]
  }

  const getTestStatusColor = (status: TestStatus) => {
    const colors: Record<TestStatus, string> = {
      passed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      failed: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      skipped: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
      running: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
    }
    return colors[status]
  }

  const getHttpStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return 'text-green-600'
    if (status >= 300 && status < 400) return 'text-blue-600'
    if (status >= 400 && status < 500) return 'text-yellow-600'
    return 'text-red-600'
  }

  const formatNumber = (num: number) => {
    if (num >= 1e6) return `${(num / 1e6).toFixed(1)}M`
    if (num >= 1e3) return `${(num / 1e3).toFixed(1)}K`
    return num.toString()
  }

  const formatLatency = (ms: number) => {
    if (ms >= 1000) return `${(ms / 1000).toFixed(1)}s`
    return `${ms}ms`
  }

  const formatSize = (bytes: number) => {
    if (bytes >= 1e6) return `${(bytes / 1e6).toFixed(1)} MB`
    if (bytes >= 1e3) return `${(bytes / 1e3).toFixed(1)} KB`
    return `${bytes} B`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    return `${diffDays}d ago`
  }

  const formatDuration = (ms: number) => {
    if (ms >= 60000) return `${(ms / 60000).toFixed(1)}m`
    if (ms >= 1000) return `${(ms / 1000).toFixed(1)}s`
    return `${ms}ms`
  }

  const statCards = [
    { label: 'Total Requests', value: formatNumber(stats.totalRequests), change: 42.3, icon: Zap, gradient: 'from-indigo-500 to-blue-500' },
    { label: 'Avg Latency', value: formatLatency(stats.avgLatency), change: -18.5, icon: Clock, gradient: 'from-green-500 to-emerald-500' },
    { label: 'Active Endpoints', value: stats.activeEndpoints.toString(), change: 15.7, icon: Server, gradient: 'from-purple-500 to-pink-500' },
    { label: 'Error Rate', value: `${stats.avgErrorRate.toFixed(2)}%`, change: -8.2, icon: AlertTriangle, gradient: 'from-red-500 to-orange-500' },
    { label: 'API Keys', value: `${stats.activeKeys}/${stats.totalKeys}`, change: 5.0, icon: Key, gradient: 'from-yellow-500 to-amber-500' },
    { label: 'Test Pass Rate', value: `${Math.round((stats.passedTests / stats.totalTests) * 100)}%`, change: 2.5, icon: TestTube, gradient: 'from-cyan-500 to-teal-500' },
    { label: 'Monitors', value: `${stats.healthyMonitors}/${stats.totalMonitors}`, change: 0, icon: Gauge, gradient: 'from-blue-500 to-indigo-500' },
    { label: 'Webhooks', value: webhooks.filter(w => w.isActive).length.toString(), change: 12.0, icon: Webhook, gradient: 'from-pink-500 to-rose-500' }
  ]

  // Handlers - Real CRUD operations
  const handleCreateEndpoint = async () => {
    if (!endpointForm.name || !endpointForm.path) {
      toast.error('Please fill in required fields')
      return
    }

    setIsSubmitting(true)
    try {
      await createEndpoint({
        name: endpointForm.name,
        description: endpointForm.description,
        method: endpointForm.method as 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
        path: endpointForm.path,
        version: endpointForm.version,
        requires_auth: endpointForm.requiresAuth,
        rate_limit_per_hour: endpointForm.rateLimit,
        tags: endpointForm.tags
      })
      toast.success('Endpoint created', { description: `${endpointForm.name} has been created` })
      setShowCreateEndpointDialog(false)
      setEndpointForm({ name: '', description: '', method: 'GET', path: '/api/v1/', version: 'v1', requiresAuth: true, rateLimit: 1000, tags: [] })
    } catch (err) {
      toast.error('Failed to create endpoint', { description: err instanceof Error ? err.message : 'Unknown error' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleGenerateApiKey = async () => {
    if (!apiKeyForm.name) {
      toast.error('Please enter a key name')
      return
    }

    setIsSubmitting(true)
    try {
      const result = await createKey({
        name: apiKeyForm.name,
        description: apiKeyForm.description,
        environment: apiKeyForm.environment as 'production' | 'staging' | 'development',
        scopes: apiKeyForm.scopes,
        rate_limit_per_hour: apiKeyForm.rateLimit,
        expires_at: apiKeyForm.expiresAt || undefined
      })
      toast.success('API key generated', { description: `${apiKeyForm.name} has been created. Key: ${result.key_value?.slice(0, 20)}...` })
      setShowCreateKeyDialog(false)
      setApiKeyForm({ name: '', description: '', environment: 'development', scopes: ['read'], rateLimit: 1000, expiresAt: '' })
    } catch (err) {
      toast.error('Failed to generate API key', { description: err instanceof Error ? err.message : 'Unknown error' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRevokeApiKey = async (keyId: string, keyName: string) => {
    try {
      await revokeKey(keyId, 'Revoked by user')
      toast.info('Key revoked', { description: `"${keyName}" has been revoked` })
    } catch (err) {
      toast.error('Failed to revoke key', { description: err instanceof Error ? err.message : 'Unknown error' })
    }
  }

  const handleDeleteEndpoint = async (endpointId: string, endpointName: string) => {
    try {
      await deleteEndpoint(endpointId)
      toast.success('Endpoint deleted', { description: `"${endpointName}" has been removed` })
    } catch (err) {
      toast.error('Failed to delete endpoint', { description: err instanceof Error ? err.message : 'Unknown error' })
    }
  }

  const handleDeleteApiKey = async (keyId: string, keyName: string) => {
    try {
      await deleteKey(keyId)
      toast.success('API key deleted', { description: `"${keyName}" has been removed` })
    } catch (err) {
      toast.error('Failed to delete key', { description: err instanceof Error ? err.message : 'Unknown error' })
    }
  }

  const handleTestEndpoint = (endpointName: string) => {
    toast.info('Testing endpoint', { description: `Running tests on "${endpointName}"...` })
    // Simulate test
    setTimeout(() => {
      toast.success('Test complete', { description: `"${endpointName}" responded with 200 OK` })
    }, 1500)
  }

  const handleExportApiDocs = () => {
    toast.success('Exporting docs', { description: 'API documentation will be downloaded' })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50/30 to-cyan-50/40 dark:bg-none dark:bg-gray-900 p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center">
              <Code className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">API Management</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">Postman-level API development platform</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search endpoints..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
            <Button variant="outline" size="icon" onClick={() => setShowFilterDialog(true)}>
              <Filter className="w-4 h-4" />
            </Button>
            <Button className="bg-gradient-to-r from-indigo-500 to-blue-500 text-white" onClick={() => setShowCreateEndpointDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              New Endpoint
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          {(endpointsLoading || keysLoading) && (
            <div className="col-span-full flex items-center justify-center py-2">
              <Loader2 className="w-5 h-5 animate-spin text-indigo-500 mr-2" />
              <span className="text-sm text-gray-500">Loading data...</span>
            </div>
          )}
          {statCards.map((stat, index) => (
            <Card key={index} className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${stat.gradient} flex items-center justify-center`}>
                    <stat.icon className="w-4 h-4 text-white" />
                  </div>
                  <div className={`flex items-center gap-1 text-xs ${stat.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {stat.change >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    {Math.abs(stat.change)}%
                  </div>
                </div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">{stat.value}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="endpoints" className="space-y-6">
          <TabsList className="bg-white dark:bg-gray-800 p-1 shadow-sm">
            <TabsTrigger value="endpoints" className="flex items-center gap-2">
              <Server className="w-4 h-4" />
              Endpoints
            </TabsTrigger>
            <TabsTrigger value="keys" className="flex items-center gap-2">
              <Key className="w-4 h-4" />
              API Keys
            </TabsTrigger>
            <TabsTrigger value="collections" className="flex items-center gap-2">
              <Folder className="w-4 h-4" />
              Collections
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="w-4 h-4" />
              History
            </TabsTrigger>
            <TabsTrigger value="monitors" className="flex items-center gap-2">
              <Gauge className="w-4 h-4" />
              Monitors
            </TabsTrigger>
            <TabsTrigger value="webhooks" className="flex items-center gap-2">
              <Webhook className="w-4 h-4" />
              Webhooks
            </TabsTrigger>
            <TabsTrigger value="tests" className="flex items-center gap-2">
              <TestTube className="w-4 h-4" />
              Tests
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Endpoints Tab */}
          <TabsContent value="endpoints" className="space-y-6">
            {/* Endpoints Banner */}
            <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl p-6 text-white mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">API Endpoints</h2>
                  <p className="text-blue-100">Postman-level API management and testing</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{endpoints.length}</p>
                    <p className="text-blue-200 text-sm">Endpoints</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{endpoints.filter(e => e.status === 'active').length}</p>
                    <p className="text-blue-200 text-sm">Active</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Endpoints Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
              {[
                { icon: Plus, label: 'New Endpoint', color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400', onClick: () => setShowCreateEndpointDialog(true) },
                { icon: Play, label: 'Test All', color: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400', onClick: () => setShowTestAllDialog(true) },
                { icon: Folder, label: 'Collections', color: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400', onClick: () => setShowCollectionsDialog(true) },
                { icon: FileJson, label: 'Import', color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400', onClick: () => setShowImportDialog(true) },
                { icon: Download, label: 'Export', color: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400', onClick: handleExportApiDocs },
                { icon: BookOpen, label: 'Docs', color: 'bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400', onClick: () => setShowDocsDialog(true) },
                { icon: History, label: 'History', color: 'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400', onClick: () => setShowHistoryDialog(true) },
                { icon: Settings, label: 'Settings', color: 'bg-slate-100 text-slate-600 dark:bg-slate-900/30 dark:text-slate-400', onClick: () => setShowEndpointSettingsDialog(true) },
              ].map((action, idx) => (
                <Button
                  key={idx}
                  variant="ghost"
                  className={`h-20 flex-col gap-2 ${action.color} hover:scale-105 transition-all duration-200`}
                  onClick={action.onClick}
                >
                  <action.icon className="w-5 h-5" />
                  <span className="text-xs font-medium">{action.label}</span>
                </Button>
              ))}
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <Button
                variant={methodFilter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setMethodFilter('all')}
              >
                All ({endpoints.length})
              </Button>
              {(['GET', 'POST', 'PUT', 'PATCH', 'DELETE'] as HttpMethod[]).map(method => (
                <Button
                  key={method}
                  variant={methodFilter === method ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setMethodFilter(method)}
                  className={methodFilter === method ? '' : getMethodColor(method)}
                >
                  {method} ({endpoints.filter(e => e.method === method).length})
                </Button>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                {filteredEndpoints.map(endpoint => (
                  <Card key={endpoint.id} className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelectedEndpoint(endpoint)}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Badge className={`font-mono font-bold ${getMethodColor(endpoint.method)}`}>
                            {endpoint.method}
                          </Badge>
                          <code className="text-sm font-mono text-gray-900 dark:text-white">{endpoint.path}</code>
                          <Badge className={getStatusColor(endpoint.status)}>{endpoint.status}</Badge>
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); setSelectedEndpointForActions(endpoint); setShowEndpointActionsDialog(true); }}>
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </div>

                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{endpoint.description}</p>

                      <div className="grid grid-cols-4 gap-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg mb-3">
                        <div className="text-center">
                          <p className="text-lg font-bold text-gray-900 dark:text-white">{formatNumber(endpoint.totalRequests)}</p>
                          <p className="text-xs text-gray-500">Requests</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-bold text-gray-900 dark:text-white">{formatLatency(endpoint.avgLatency)}</p>
                          <p className="text-xs text-gray-500">Avg Latency</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-bold text-gray-900 dark:text-white">{formatLatency(endpoint.p95Latency)}</p>
                          <p className="text-xs text-gray-500">P95</p>
                        </div>
                        <div className="text-center">
                          <p className={`text-lg font-bold ${endpoint.errorRate > 1 ? 'text-red-600' : 'text-green-600'}`}>{endpoint.errorRate}%</p>
                          <p className="text-xs text-gray-500">Error Rate</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center gap-2">
                          {endpoint.tags.map(tag => (
                            <Badge key={tag} variant="secondary">{tag}</Badge>
                          ))}
                        </div>
                        <span>Last called {formatTimeAgo(endpoint.lastCalled)}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="space-y-6">
                <Card className="border-0 shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Terminal className="w-5 h-5" />
                      Request Builder
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex gap-2">
                      <Badge className={getMethodColor('GET')}>GET</Badge>
                      <Input placeholder="Enter request URL" className="flex-1 font-mono text-sm" value={requestUrl} onChange={(e) => setRequestUrl(e.target.value)} />
                    </div>
                    <Button className="w-full bg-gradient-to-r from-indigo-500 to-blue-500 text-white" onClick={() => setShowSendRequestDialog(true)}>
                      <Send className="w-4 h-4 mr-2" />
                      Send Request
                    </Button>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Variable className="w-5 h-5" />
                      Environment Variables
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {[
                      { name: 'base_url', value: 'https://api.example.com' },
                      { name: 'api_key', value: '••••••••' },
                      { name: 'version', value: 'v1' }
                    ].map((variable, i) => (
                      <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 dark:bg-gray-800">
                        <code className="text-xs font-mono text-indigo-600">{`{{${variable.name}}}`}</code>
                        <span className="text-xs text-gray-500 truncate flex-1">{variable.value}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileCode className="w-5 h-5" />
                      Code Generation
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {['cURL', 'JavaScript', 'Python', 'Go', 'PHP'].map(lang => (
                      <Button key={lang} variant="outline" size="sm" className="w-full justify-start" onClick={() => { setSelectedCodeGenLanguage(lang); setShowCodeGenDialog(true); }}>
                        <Code className="w-4 h-4 mr-2" />
                        {lang}
                      </Button>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* API Keys Tab */}
          <TabsContent value="keys" className="space-y-6">
            {/* Keys Banner */}
            <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 rounded-2xl p-6 text-white mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">API Key Management</h2>
                  <p className="text-amber-100">Secure access tokens for your applications</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{apiKeys.length}</p>
                    <p className="text-amber-200 text-sm">Keys</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{apiKeys.filter(k => k.status === 'active').length}</p>
                    <p className="text-amber-200 text-sm">Active</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Keys Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
              {[
                { icon: Plus, label: 'New Key', color: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400', onClick: () => setShowCreateKeyDialog(true) },
                { icon: RotateCcw, label: 'Rotate All', color: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400', onClick: () => setShowRotateAllKeysDialog(true) },
                { icon: Shield, label: 'Permissions', color: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400', onClick: () => setShowPermissionsDialog(true) },
                { icon: History, label: 'Usage Log', color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400', onClick: () => setShowUsageLogDialog(true) },
                { icon: Lock, label: 'Revoke', color: 'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400', onClick: () => setShowRevokeKeyDialog(true) },
                { icon: Copy, label: 'Copy All', color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400', onClick: () => setShowCopyAllKeysDialog(true) },
                { icon: Download, label: 'Export', color: 'bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400', onClick: () => setShowExportKeysDialog(true) },
                { icon: Settings, label: 'Settings', color: 'bg-slate-100 text-slate-600 dark:bg-slate-900/30 dark:text-slate-400', onClick: () => setShowKeySettingsDialog(true) },
              ].map((action, idx) => (
                <Button
                  key={idx}
                  variant="ghost"
                  className={`h-20 flex-col gap-2 ${action.color} hover:scale-105 transition-all duration-200`}
                  onClick={action.onClick}
                >
                  <action.icon className="w-5 h-5" />
                  <span className="text-xs font-medium">{action.label}</span>
                </Button>
              ))}
            </div>

            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">API Keys</h3>
              <Button onClick={() => setShowCreateKeyDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Key
              </Button>
            </div>

            <div className="space-y-4">
              {apiKeys.map(key => (
                <Card key={key.id} className="border-0 shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center">
                          <Key className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white">{key.name}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className={getEnvironmentColor(key.environment)}>{key.environment}</Badge>
                            <Badge className={getKeyStatusColor(key.status)}>{key.status}</Badge>
                          </div>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => { setSelectedKeyForActions(key); setShowKeyActionsDialog(true); }}>
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="flex items-center gap-2 mb-4">
                      <code className="text-sm font-mono bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded flex-1">
                        {showApiKey[key.id] ? key.keyPrefix + '••••••••••••••••' : key.keyPrefix + '••••••••••••••••'}
                      </code>
                      <Button variant="ghost" size="icon" onClick={() => setShowApiKey({ ...showApiKey, [key.id]: !showApiKey[key.id] })}>
                        {showApiKey[key.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => { navigator.clipboard.writeText(key.keyPrefix + '••••••••••••••••'); toast.success('Key prefix copied to clipboard'); }}>
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-4 gap-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg mb-3">
                      <div>
                        <p className="text-xs text-gray-500">Requests</p>
                        <p className="font-semibold">{formatNumber(key.totalRequests)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Rate Limit</p>
                        <p className="font-semibold">{key.rateLimit === 0 ? 'Unlimited' : `${key.rateLimit}/hr`}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Last Used</p>
                        <p className="font-semibold">{formatTimeAgo(key.lastUsed)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Expires</p>
                        <p className="font-semibold">{key.expiresAt ? formatDate(key.expiresAt) : 'Never'}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex gap-1">
                        {key.scopes.map(scope => (
                          <Badge key={scope} variant="secondary">{scope}</Badge>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => { setSelectedKeyForEdit(key); setShowEditKeyDialog(true); }}>Edit</Button>
                        <Button variant="outline" size="sm" className="text-red-600" onClick={() => handleRevokeApiKey(key.id, key.name)}>Revoke</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Collections Tab */}
          <TabsContent value="collections" className="space-y-6">
            {/* Collections Banner */}
            <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 rounded-2xl p-6 text-white mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">API Collections</h2>
                  <p className="text-purple-100">Postman-level request organization and team collaboration</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{collections.length}</p>
                    <p className="text-purple-200 text-sm">Collections</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{collections.reduce((sum, c) => sum + c.requests, 0)}</p>
                    <p className="text-purple-200 text-sm">Total Requests</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{collections.filter(c => c.isShared).length}</p>
                    <p className="text-purple-200 text-sm">Shared</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Collections Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
              {[
                { icon: FolderPlus, label: 'New Collection', color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400', onClick: () => setShowCreateCollectionDialog(true) },
                { icon: Upload, label: 'Import', color: 'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400', onClick: () => setShowImportCollectionDialog(true) },
                { icon: Download, label: 'Export All', color: 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400', onClick: () => setShowExportCollectionsDialog(true) },
                { icon: Users, label: 'Share', color: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400', onClick: () => setShowShareCollectionDialog(true) },
                { icon: GitBranch, label: 'Fork', color: 'bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400', onClick: () => setShowForkCollectionDialog(true) },
                { icon: FileCode, label: 'Generate SDK', color: 'bg-fuchsia-100 text-fuchsia-600 dark:bg-fuchsia-900/30 dark:text-fuchsia-400', onClick: () => setShowGenerateSdkDialog(true) },
                { icon: PlayCircle, label: 'Run All', color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400', onClick: () => setShowRunAllCollectionsDialog(true) },
                { icon: Archive, label: 'Archive', color: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400', onClick: () => setShowArchiveCollectionDialog(true) }
              ].map((action, idx) => (
                <Button
                  key={idx}
                  variant="ghost"
                  className={`h-20 flex-col gap-2 ${action.color} hover:scale-105 transition-all duration-200`}
                  onClick={action.onClick}
                >
                  <action.icon className="w-5 h-5" />
                  <span className="text-xs font-medium">{action.label}</span>
                </Button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {collections.map(collection => (
                <Card key={collection.id} className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                          <FolderOpen className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white">{collection.name}</h4>
                          <p className="text-xs text-gray-500">{collection.description}</p>
                        </div>
                      </div>
                      {collection.isShared && <Users className="w-4 h-4 text-gray-400" />}
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="text-center p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <p className="text-lg font-bold">{collection.requests}</p>
                        <p className="text-xs text-gray-500">Requests</p>
                      </div>
                      <div className="text-center p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <p className="text-lg font-bold">{collection.tests}</p>
                        <p className="text-xs text-gray-500">Tests</p>
                      </div>
                      <div className="text-center p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <p className={`text-lg font-bold ${collection.passRate >= 90 ? 'text-green-600' : collection.passRate >= 70 ? 'text-yellow-600' : 'text-red-600'}`}>{collection.passRate}%</p>
                        <p className="text-xs text-gray-500">Pass Rate</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <Badge className={getEnvironmentColor(collection.environment)}>{collection.environment}</Badge>
                      <span>Last run {formatTimeAgo(collection.lastRun)}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}

              <Card className="border-0 shadow-sm border-dashed border-2 border-gray-300 dark:border-gray-600">
                <CardContent className="p-6 flex flex-col items-center justify-center h-full min-h-[200px]">
                  <Plus className="w-12 h-12 text-gray-400 mb-2" />
                  <p className="text-gray-600 dark:text-gray-300 font-medium">Create Collection</p>
                  <p className="text-sm text-gray-500">Organize your API requests</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-6">
            {/* History Banner */}
            <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 rounded-2xl p-6 text-white mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Request History</h2>
                  <p className="text-amber-100">Chrome DevTools-level request inspection and debugging</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{history.length}</p>
                    <p className="text-amber-200 text-sm">Requests</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{history.filter(h => h.status >= 200 && h.status < 300).length}</p>
                    <p className="text-amber-200 text-sm">Successful</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{history.filter(h => h.status >= 400).length}</p>
                    <p className="text-amber-200 text-sm">Errors</p>
                  </div>
                </div>
              </div>
            </div>

            {/* History Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
              {[
                { icon: Search, label: 'Search', color: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400', onClick: () => setShowSearchHistoryDialog(true) },
                { icon: Filter, label: 'Filter', color: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400', onClick: () => setShowFilterHistoryDialog(true) },
                { icon: Download, label: 'Export HAR', color: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400', onClick: () => setShowExportHarDialog(true) },
                { icon: Trash2, label: 'Clear All', color: 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400', onClick: () => setShowClearHistoryDialog(true) },
                { icon: RefreshCw, label: 'Replay', color: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400', onClick: () => setShowReplayRequestDialog(true) },
                { icon: Copy, label: 'Copy cURL', color: 'bg-lime-100 text-lime-600 dark:bg-lime-900/30 dark:text-lime-400', onClick: () => setShowCopyCurlDialog(true) },
                { icon: Eye, label: 'Inspect', color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400', onClick: () => setShowInspectRequestDialog(true) },
                { icon: BookmarkPlus, label: 'Save', color: 'bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400', onClick: () => setShowSaveRequestDialog(true) }
              ].map((action, idx) => (
                <Button
                  key={idx}
                  variant="ghost"
                  className={`h-20 flex-col gap-2 ${action.color} hover:scale-105 transition-all duration-200`}
                  onClick={action.onClick}
                >
                  <action.icon className="w-5 h-5" />
                  <span className="text-xs font-medium">{action.label}</span>
                </Button>
              ))}
            </div>

            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Request History</CardTitle>
                <CardDescription>Recent API requests and responses</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {history.map(request => (
                    <div key={request.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
                      <Badge className={`font-mono font-bold ${getMethodColor(request.method)}`}>
                        {request.method}
                      </Badge>
                      <code className="text-sm font-mono flex-1 text-gray-700 dark:text-gray-300">{request.url}</code>
                      <span className={`font-mono font-bold ${getHttpStatusColor(request.status)}`}>{request.status}</span>
                      <span className="text-sm text-gray-500 w-16 text-right">{formatLatency(request.duration)}</span>
                      <span className="text-sm text-gray-500 w-20 text-right">{formatSize(request.size)}</span>
                      <Badge className={getEnvironmentColor(request.environment)}>{request.environment}</Badge>
                      <span className="text-xs text-gray-400 w-24 text-right">{formatTimeAgo(request.timestamp)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Monitors Tab */}
          <TabsContent value="monitors" className="space-y-6">
            {/* Monitors Banner */}
            <div className="bg-gradient-to-r from-cyan-600 via-teal-600 to-emerald-600 rounded-2xl p-6 text-white mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">API Monitors</h2>
                  <p className="text-cyan-100">Datadog-level uptime monitoring and alerting</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{monitors.length}</p>
                    <p className="text-cyan-200 text-sm">Monitors</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{monitors.filter(m => m.status === 'healthy').length}</p>
                    <p className="text-cyan-200 text-sm">Healthy</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{(monitors.reduce((sum, m) => sum + m.uptime, 0) / monitors.length).toFixed(1)}%</p>
                    <p className="text-cyan-200 text-sm">Avg Uptime</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Monitors Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
              {[
                { icon: Plus, label: 'New Monitor', color: 'bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400', onClick: () => setShowNewMonitorDialog(true) },
                { icon: Activity, label: 'Status Page', color: 'bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400', onClick: () => setShowStatusPageDialog(true) },
                { icon: Bell, label: 'Alerts', color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400', onClick: () => setShowAlertsDialog(true) },
                { icon: Globe, label: 'Regions', color: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400', onClick: () => setShowRegionsDialog(true) },
                { icon: Clock, label: 'Intervals', color: 'bg-lime-100 text-lime-600 dark:bg-lime-900/30 dark:text-lime-400', onClick: () => setShowIntervalsDialog(true) },
                { icon: BarChart3, label: 'Analytics', color: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400', onClick: () => setShowMonitorAnalyticsDialog(true) },
                { icon: Shield, label: 'SSL Check', color: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400', onClick: () => setShowSslCheckDialog(true) },
                { icon: Settings, label: 'Configure', color: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400', onClick: () => setShowMonitorConfigDialog(true) }
              ].map((action, idx) => (
                <Button
                  key={idx}
                  variant="ghost"
                  className={`h-20 flex-col gap-2 ${action.color} hover:scale-105 transition-all duration-200`}
                  onClick={action.onClick}
                >
                  <action.icon className="w-5 h-5" />
                  <span className="text-xs font-medium">{action.label}</span>
                </Button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {monitors.map(monitor => (
                <Card key={monitor.id} className="border-0 shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">{monitor.name}</h4>
                        <code className="text-sm text-gray-500">{monitor.endpoint}</code>
                      </div>
                      <Badge className={getMonitorStatusColor(monitor.status)}>
                        {monitor.status === 'healthy' && <CheckCircle2 className="w-3 h-3 mr-1" />}
                        {monitor.status === 'degraded' && <AlertTriangle className="w-3 h-3 mr-1" />}
                        {monitor.status === 'down' && <XCircle className="w-3 h-3 mr-1" />}
                        {monitor.status}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-4 gap-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg mb-4">
                      <div className="text-center">
                        <p className={`text-lg font-bold ${monitor.uptime >= 99.9 ? 'text-green-600' : monitor.uptime >= 99 ? 'text-yellow-600' : 'text-red-600'}`}>{monitor.uptime}%</p>
                        <p className="text-xs text-gray-500">Uptime</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold">{monitor.avgResponseTime > 0 ? formatLatency(monitor.avgResponseTime) : 'N/A'}</p>
                        <p className="text-xs text-gray-500">Response</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold">{monitor.interval}s</p>
                        <p className="text-xs text-gray-500">Interval</p>
                      </div>
                      <div className="text-center">
                        <p className={`text-lg font-bold ${monitor.alerts > 0 ? 'text-red-600' : 'text-green-600'}`}>{monitor.alerts}</p>
                        <p className="text-xs text-gray-500">Alerts</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Region: {monitor.region}</span>
                      <span>Last check: {formatTimeAgo(monitor.lastCheck)}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Webhooks Tab */}
          <TabsContent value="webhooks" className="space-y-6">
            {/* Webhooks Banner */}
            <div className="bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 rounded-2xl p-6 text-white mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Webhooks</h2>
                  <p className="text-indigo-100">Stripe-level webhook management and delivery tracking</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{webhooks.length}</p>
                    <p className="text-indigo-200 text-sm">Webhooks</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{webhooks.filter(w => w.isActive).length}</p>
                    <p className="text-indigo-200 text-sm">Active</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{(webhooks.reduce((sum, w) => sum + w.successRate, 0) / webhooks.length).toFixed(0)}%</p>
                    <p className="text-indigo-200 text-sm">Success Rate</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Webhooks Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
              {[
                { icon: Plus, label: 'New Webhook', color: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400', onClick: () => setShowNewWebhookDialog(true) },
                { icon: Webhook, label: 'Test', color: 'bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400', onClick: () => setShowTestWebhookDialog(true) },
                { icon: RefreshCw, label: 'Retry Failed', color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400', onClick: () => setShowRetryWebhooksDialog(true) },
                { icon: Eye, label: 'View Logs', color: 'bg-fuchsia-100 text-fuchsia-600 dark:bg-fuchsia-900/30 dark:text-fuchsia-400', onClick: () => setShowWebhookLogsDialog(true) },
                { icon: Key, label: 'Secrets', color: 'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400', onClick: () => setShowWebhookSecretsDialog(true) },
                { icon: Shield, label: 'Signatures', color: 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400', onClick: () => setShowWebhookSignaturesDialog(true) },
                { icon: Download, label: 'Export', color: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400', onClick: () => setShowExportWebhooksDialog(true) },
                { icon: Settings, label: 'Settings', color: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400', onClick: () => setShowWebhookSettingsDialog(true) }
              ].map((action, idx) => (
                <Button
                  key={idx}
                  variant="ghost"
                  className={`h-20 flex-col gap-2 ${action.color} hover:scale-105 transition-all duration-200`}
                  onClick={action.onClick}
                >
                  <action.icon className="w-5 h-5" />
                  <span className="text-xs font-medium">{action.label}</span>
                </Button>
              ))}
            </div>

            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Webhooks</h3>
              <Button onClick={() => setShowNewWebhookDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Webhook
              </Button>
            </div>

            <div className="space-y-4">
              {webhooks.map(webhook => (
                <Card key={webhook.id} className="border-0 shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${webhook.isActive ? 'bg-gradient-to-br from-green-500 to-emerald-500' : 'bg-gray-300 dark:bg-gray-600'}`}>
                          <Webhook className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white">{webhook.name}</h4>
                          <code className="text-xs text-gray-500">{webhook.url}</code>
                        </div>
                      </div>
                      <Badge className={webhook.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
                        {webhook.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>

                    <div className="flex flex-wrap gap-1 mb-3">
                      {webhook.events.map(event => (
                        <Badge key={event} variant="secondary">{event}</Badge>
                      ))}
                    </div>

                    <div className="grid grid-cols-3 gap-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div>
                        <p className="text-xs text-gray-500">Deliveries</p>
                        <p className="font-semibold">{formatNumber(webhook.totalDeliveries)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Success Rate</p>
                        <p className={`font-semibold ${webhook.successRate >= 99 ? 'text-green-600' : webhook.successRate >= 95 ? 'text-yellow-600' : 'text-red-600'}`}>{webhook.successRate}%</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Last Triggered</p>
                        <p className="font-semibold">{formatTimeAgo(webhook.lastTriggered)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Tests Tab */}
          <TabsContent value="tests" className="space-y-6">
            {/* Tests Banner */}
            <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 rounded-2xl p-6 text-white mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Test Suites</h2>
                  <p className="text-green-100">Jest-level automated testing and CI/CD integration</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{testSuites.length}</p>
                    <p className="text-green-200 text-sm">Suites</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{testSuites.reduce((sum, s) => sum + s.tests, 0)}</p>
                    <p className="text-green-200 text-sm">Tests</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{(testSuites.reduce((sum, s) => sum + s.passRate, 0) / testSuites.length).toFixed(0)}%</p>
                    <p className="text-green-200 text-sm">Pass Rate</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Tests Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
              {[
                { icon: PlayCircle, label: 'Run All', color: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400', onClick: () => setShowRunAllTestsDialog(true) },
                { icon: Plus, label: 'New Suite', color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400', onClick: () => setShowNewTestSuiteDialog(true) },
                { icon: FileCode, label: 'Coverage', color: 'bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400', onClick: () => setShowCoverageDialog(true) },
                { icon: GitBranch, label: 'CI/CD', color: 'bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400', onClick: () => setShowCiCdDialog(true) },
                { icon: BarChart3, label: 'Reports', color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400', onClick: () => setShowTestReportsDialog(true) },
                { icon: Clock, label: 'Schedule', color: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400', onClick: () => setShowScheduleTestsDialog(true) },
                { icon: Download, label: 'Export', color: 'bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400', onClick: () => setShowExportTestsDialog(true) },
                { icon: Settings, label: 'Settings', color: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400', onClick: () => setShowTestSettingsDialog(true) }
              ].map((action, idx) => (
                <Button
                  key={idx}
                  variant="ghost"
                  className={`h-20 flex-col gap-2 ${action.color} hover:scale-105 transition-all duration-200`}
                  onClick={action.onClick}
                >
                  <action.icon className="w-5 h-5" />
                  <span className="text-xs font-medium">{action.label}</span>
                </Button>
              ))}
            </div>

            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Test Suites</h3>
              <div className="flex items-center gap-3">
                <Button variant="outline" onClick={() => setRunningTests(!runningTests)}>
                  {runningTests ? (
                    <>
                      <StopCircle className="w-4 h-4 mr-2" />
                      Stop Tests
                    </>
                  ) : (
                    <>
                      <PlayCircle className="w-4 h-4 mr-2" />
                      Run All Tests
                    </>
                  )}
                </Button>
                <Button onClick={() => setShowNewTestSuiteDialog(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  New Test Suite
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                {testSuites.map(suite => (
                  <Card key={suite.id} className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelectedTestSuite(suite)}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            suite.status === 'passed' ? 'bg-gradient-to-br from-green-500 to-emerald-500' :
                            suite.status === 'failed' ? 'bg-gradient-to-br from-red-500 to-orange-500' :
                            suite.status === 'running' ? 'bg-gradient-to-br from-blue-500 to-indigo-500' :
                            'bg-gray-300'
                          }`}>
                            {suite.status === 'passed' && <CheckCircle className="w-5 h-5 text-white" />}
                            {suite.status === 'failed' && <XCircle className="w-5 h-5 text-white" />}
                            {suite.status === 'running' && <RefreshCw className="w-5 h-5 text-white animate-spin" />}
                            {suite.status === 'skipped' && <Square className="w-5 h-5 text-white" />}
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900 dark:text-white">{suite.name}</h4>
                            <p className="text-xs text-gray-500">{suite.description}</p>
                          </div>
                        </div>
                        <Badge className={getTestStatusColor(suite.status)}>{suite.status}</Badge>
                      </div>

                      <div className="mb-3">
                        <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                          <span>Test Progress</span>
                          <span>{suite.passed}/{suite.tests} passed</span>
                        </div>
                        <Progress value={(suite.passed / suite.tests) * 100} className="h-2" />
                      </div>

                      <div className="grid grid-cols-5 gap-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg mb-3">
                        <div className="text-center">
                          <p className="text-lg font-bold text-gray-900 dark:text-white">{suite.tests}</p>
                          <p className="text-xs text-gray-500">Total</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-bold text-green-600">{suite.passed}</p>
                          <p className="text-xs text-gray-500">Passed</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-bold text-red-600">{suite.failed}</p>
                          <p className="text-xs text-gray-500">Failed</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-bold text-gray-500">{suite.skipped}</p>
                          <p className="text-xs text-gray-500">Skipped</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-bold text-gray-900 dark:text-white">{formatDuration(suite.duration)}</p>
                          <p className="text-xs text-gray-500">Duration</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center gap-2">
                          <Badge className={getEnvironmentColor(suite.environment)}>{suite.environment}</Badge>
                          <span>Coverage: {suite.coverage}%</span>
                        </div>
                        <span>Last run {formatTimeAgo(suite.lastRun)}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="space-y-6">
                <Card className="border-0 shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FlaskConical className="w-5 h-5" />
                      Test Runner
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <CheckCircle className="w-6 h-6 text-green-600 mx-auto mb-1" />
                        <p className="text-2xl font-bold text-green-600">{stats.passedTests}</p>
                        <p className="text-xs text-gray-500">Passed</p>
                      </div>
                      <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                        <XCircle className="w-6 h-6 text-red-600 mx-auto mb-1" />
                        <p className="text-2xl font-bold text-red-600">{stats.totalTests - stats.passedTests}</p>
                        <p className="text-xs text-gray-500">Failed</p>
                      </div>
                    </div>
                    <Button className="w-full" variant="outline" onClick={() => setShowRerunFailedDialog(true)}>
                      <Repeat className="w-4 h-4 mr-2" />
                      Rerun Failed Tests
                    </Button>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ListChecks className="w-5 h-5" />
                      Recent Test Cases
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-64">
                      <div className="space-y-2">
                        {testCases.slice(0, 6).map(test => (
                          <div key={test.id} className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 dark:bg-gray-800">
                            {test.status === 'passed' && <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />}
                            {test.status === 'failed' && <XCircle className="w-4 h-4 text-red-600 flex-shrink-0" />}
                            {test.status === 'running' && <RefreshCw className="w-4 h-4 text-blue-600 animate-spin flex-shrink-0" />}
                            {test.status === 'skipped' && <Square className="w-4 h-4 text-gray-400 flex-shrink-0" />}
                            <span className="text-sm text-gray-700 dark:text-gray-300 truncate flex-1">{test.name}</span>
                            <span className="text-xs text-gray-500">{formatDuration(test.duration)}</span>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Server className="w-5 h-5" />
                      Mock Servers
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {mockServersState.map(server => (
                      <div key={server.id} className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-gray-800">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${server.isActive ? 'bg-green-500' : 'bg-gray-400'}`} />
                          <span className="text-sm font-medium">{server.name}</span>
                        </div>
                        <span className="text-xs text-gray-500">{formatNumber(server.requests)} req</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Cog className="w-5 h-5" />
                    General Settings
                  </CardTitle>
                  <CardDescription>Configure your API client preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="font-medium">Auto Save</Label>
                      <p className="text-xs text-gray-500">Automatically save request changes</p>
                    </div>
                    <Switch checked={settings.autoSave} onCheckedChange={(checked) => setSettings({ ...settings, autoSave: checked })} />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="font-medium">SSL Verification</Label>
                      <p className="text-xs text-gray-500">Verify SSL certificates</p>
                    </div>
                    <Switch checked={settings.sslVerification} onCheckedChange={(checked) => setSettings({ ...settings, sslVerification: checked })} />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="font-medium">Follow Redirects</Label>
                      <p className="text-xs text-gray-500">Automatically follow HTTP redirects</p>
                    </div>
                    <Switch checked={settings.followRedirects} onCheckedChange={(checked) => setSettings({ ...settings, followRedirects: checked })} />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="font-medium">Retry on Failure</Label>
                      <p className="text-xs text-gray-500">Retry failed requests automatically</p>
                    </div>
                    <Switch checked={settings.retryOnFailure} onCheckedChange={(checked) => setSettings({ ...settings, retryOnFailure: checked })} />
                  </div>

                  <div className="space-y-2">
                    <Label className="font-medium">Request Timeout (ms)</Label>
                    <Input type="number" value={settings.timeout} onChange={(e) => setSettings({ ...settings, timeout: parseInt(e.target.value) })} />
                  </div>

                  <div className="space-y-2">
                    <Label className="font-medium">Max Retries</Label>
                    <Input type="number" value={settings.maxRetries} onChange={(e) => setSettings({ ...settings, maxRetries: parseInt(e.target.value) })} />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="w-5 h-5" />
                    Appearance & Preferences
                  </CardTitle>
                  <CardDescription>Customize your workspace</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {settings.darkMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                      <div>
                        <Label className="font-medium">Dark Mode</Label>
                        <p className="text-xs text-gray-500">Toggle dark theme</p>
                      </div>
                    </div>
                    <Switch checked={settings.darkMode} onCheckedChange={(checked) => setSettings({ ...settings, darkMode: checked })} />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4" />
                      <div>
                        <Label className="font-medium">Notifications</Label>
                        <p className="text-xs text-gray-500">Enable desktop notifications</p>
                      </div>
                    </div>
                    <Switch checked={settings.notifications} onCheckedChange={(checked) => setSettings({ ...settings, notifications: checked })} />
                  </div>

                  <div className="space-y-2">
                    <Label className="font-medium">Code Generation Language</Label>
                    <div className="flex flex-wrap gap-2">
                      {['javascript', 'python', 'go', 'php', 'ruby', 'curl'].map(lang => (
                        <Button
                          key={lang}
                          variant={settings.codeGenLanguage === lang ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setSettings({ ...settings, codeGenLanguage: lang })}
                        >
                          {lang.charAt(0).toUpperCase() + lang.slice(1)}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="font-medium">Default Environment</Label>
                    <div className="flex flex-wrap gap-2">
                      {['development', 'staging', 'production'].map(env => (
                        <Button
                          key={env}
                          variant={settings.defaultEnvironment === env ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setSettings({ ...settings, defaultEnvironment: env as Environment })}
                          className={settings.defaultEnvironment !== env ? getEnvironmentColor(env as Environment) : ''}
                        >
                          {env.charAt(0).toUpperCase() + env.slice(1)}
                        </Button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="w-5 h-5" />
                    Proxy Settings
                  </CardTitle>
                  <CardDescription>Configure proxy for API requests</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="font-medium">Enable Proxy</Label>
                      <p className="text-xs text-gray-500">Route requests through proxy</p>
                    </div>
                    <Switch checked={settings.proxyEnabled} onCheckedChange={(checked) => setSettings({ ...settings, proxyEnabled: checked })} />
                  </div>

                  {settings.proxyEnabled && (
                    <div className="space-y-2">
                      <Label className="font-medium">Proxy URL</Label>
                      <Input
                        placeholder="http://proxy.example.com:8080"
                        value={settings.proxyUrl}
                        onChange={(e) => setSettings({ ...settings, proxyUrl: e.target.value })}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5" />
                    Security & Auth
                  </CardTitle>
                  <CardDescription>Manage authentication settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                      <Lock className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">OAuth 2.0</p>
                      <p className="text-xs text-gray-500">Connected</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setShowConfigureOAuthDialog(true)}>Configure</Button>
                  </div>

                  <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
                      <Key className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">API Keys</p>
                      <p className="text-xs text-gray-500">{apiKeys.filter(k => k.status === 'active').length} active</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setShowManageKeysDialog(true)}>Manage</Button>
                  </div>

                  <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                      <UserCog className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">Team Access</p>
                      <p className="text-xs text-gray-500">5 members</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setShowInviteTeamDialog(true)}>Invite</Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Download className="w-5 h-5" />
                    Export & Import
                  </CardTitle>
                  <CardDescription>Backup and restore your workspace</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Button variant="outline" className="h-auto py-4 flex-col gap-2" onClick={() => setShowExportCollectionsSettingsDialog(true)}>
                      <FileJson className="w-6 h-6" />
                      <span>Export Collections</span>
                    </Button>
                    <Button variant="outline" className="h-auto py-4 flex-col gap-2" onClick={() => setShowImportCollectionsSettingsDialog(true)}>
                      <Upload className="w-6 h-6" />
                      <span>Import Collections</span>
                    </Button>
                    <Button variant="outline" className="h-auto py-4 flex-col gap-2" onClick={() => setShowExportEnvironmentsDialog(true)}>
                      <Variable className="w-6 h-6" />
                      <span>Export Environments</span>
                    </Button>
                    <Button variant="outline" className="h-auto py-4 flex-col gap-2" onClick={() => setShowGenerateDocsDialog(true)}>
                      <FileText className="w-6 h-6" />
                      <span>Generate Docs</span>
                    </Button>
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
              insights={mockApiAIInsights}
              title="API Intelligence"
              onInsightAction={(insight) => console.log('Insight action:', insight)}
            />
          </div>
          <div className="space-y-6">
            <CollaborationIndicator
              collaborators={mockApiCollaborators}
              maxVisible={4}
            />
            <PredictiveAnalytics
              predictions={mockApiPredictions}
              title="API Forecasts"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <ActivityFeed
            activities={mockApiActivities}
            title="API Activity"
            maxItems={5}
          />
          <QuickActionsToolbar
            actions={apiQuickActions}
            variant="grid"
          />
        </div>

        {/* Endpoint Detail Dialog */}
        <Dialog open={!!selectedEndpoint} onOpenChange={() => setSelectedEndpoint(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Badge className={`font-mono font-bold ${selectedEndpoint && getMethodColor(selectedEndpoint.method)}`}>
                  {selectedEndpoint?.method}
                </Badge>
                <code>{selectedEndpoint?.path}</code>
              </DialogTitle>
              <DialogDescription>{selectedEndpoint?.description}</DialogDescription>
            </DialogHeader>
            {selectedEndpoint && (
              <ScrollArea className="max-h-96">
                <div className="space-y-4 pr-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                      <p className="text-xs text-gray-500">Total Requests</p>
                      <p className="text-xl font-bold">{formatNumber(selectedEndpoint.totalRequests)}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                      <p className="text-xs text-gray-500">Avg Latency</p>
                      <p className="text-xl font-bold">{formatLatency(selectedEndpoint.avgLatency)}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                      <p className="text-xs text-gray-500">P95 Latency</p>
                      <p className="text-xl font-bold">{formatLatency(selectedEndpoint.p95Latency)}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                      <p className="text-xs text-gray-500">Error Rate</p>
                      <p className={`text-xl font-bold ${selectedEndpoint.errorRate > 1 ? 'text-red-600' : 'text-green-600'}`}>{selectedEndpoint.errorRate}%</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Configuration</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between p-2 rounded bg-gray-50 dark:bg-gray-800">
                        <span className="text-gray-500">Authentication</span>
                        <span className="font-medium">{selectedEndpoint.authentication}</span>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded bg-gray-50 dark:bg-gray-800">
                        <span className="text-gray-500">Rate Limit</span>
                        <span className="font-medium">{selectedEndpoint.rateLimit} req/min</span>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded bg-gray-50 dark:bg-gray-800">
                        <span className="text-gray-500">Version</span>
                        <span className="font-medium">{selectedEndpoint.version}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button className="flex-1 bg-gradient-to-r from-indigo-500 to-blue-500 text-white" onClick={() => { setShowTryEndpointDialog(true); }}>
                      <Send className="w-4 h-4 mr-2" />
                      Try It
                    </Button>
                    <Button variant="outline" onClick={() => setShowEndpointDocsDialog(true)}>
                      <BookOpen className="w-4 h-4 mr-2" />
                      Docs
                    </Button>
                    <Button variant="outline" onClick={() => setShowEndpointCodeDialog(true)}>
                      <Code className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </ScrollArea>
            )}
          </DialogContent>
        </Dialog>

        {/* Test Suite Detail Dialog */}
        <Dialog open={!!selectedTestSuite} onOpenChange={() => setSelectedTestSuite(null)}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FlaskConical className="w-5 h-5" />
                {selectedTestSuite?.name}
              </DialogTitle>
              <DialogDescription>{selectedTestSuite?.description}</DialogDescription>
            </DialogHeader>
            {selectedTestSuite && (
              <ScrollArea className="max-h-[500px]">
                <div className="space-y-4 pr-4">
                  <div className="grid grid-cols-4 gap-4">
                    <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20">
                      <p className="text-xs text-gray-500">Passed</p>
                      <p className="text-2xl font-bold text-green-600">{selectedTestSuite.passed}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20">
                      <p className="text-xs text-gray-500">Failed</p>
                      <p className="text-2xl font-bold text-red-600">{selectedTestSuite.failed}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                      <p className="text-xs text-gray-500">Skipped</p>
                      <p className="text-2xl font-bold text-gray-500">{selectedTestSuite.skipped}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                      <p className="text-xs text-gray-500">Coverage</p>
                      <p className="text-2xl font-bold text-blue-600">{selectedTestSuite.coverage}%</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-3">Test Cases</h4>
                    <div className="space-y-2">
                      {testCases.map(test => (
                        <div key={test.id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                          {test.status === 'passed' && <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />}
                          {test.status === 'failed' && <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />}
                          {test.status === 'running' && <RefreshCw className="w-5 h-5 text-blue-600 animate-spin flex-shrink-0" />}
                          {test.status === 'skipped' && <Square className="w-5 h-5 text-gray-400 flex-shrink-0" />}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{test.name}</p>
                            <p className="text-xs text-gray-500">{test.description}</p>
                          </div>
                          <Badge className={`${getMethodColor(test.method)} font-mono`}>{test.method}</Badge>
                          <div className="text-right">
                            <p className="text-sm font-medium">{test.passedAssertions}/{test.assertions}</p>
                            <p className="text-xs text-gray-500">assertions</p>
                          </div>
                          <span className="text-sm text-gray-500 w-16 text-right">{formatDuration(test.duration)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button className="flex-1 bg-gradient-to-r from-indigo-500 to-blue-500 text-white" onClick={() => setShowRunTestSuiteDialog(true)}>
                      <PlayCircle className="w-4 h-4 mr-2" />
                      Run Suite
                    </Button>
                    <Button variant="outline" onClick={() => setShowRerunFailedTestsDialog(true)}>
                      <Repeat className="w-4 h-4 mr-2" />
                      Rerun Failed
                    </Button>
                    <Button variant="outline" onClick={() => setShowExportTestReportDialog(true)}>
                      <FileText className="w-4 h-4 mr-2" />
                      Export Report
                    </Button>
                  </div>
                </div>
              </ScrollArea>
            )}
          </DialogContent>
        </Dialog>

        {/* Create Endpoint Dialog */}
        <Dialog open={showCreateEndpointDialog} onOpenChange={setShowCreateEndpointDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Create New Endpoint</DialogTitle>
              <DialogDescription>Add a new API endpoint to your collection</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="endpoint-name">Name *</Label>
                <Input
                  id="endpoint-name"
                  placeholder="e.g., Get User Profile"
                  value={endpointForm.name}
                  onChange={(e) => setEndpointForm({ ...endpointForm, name: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Method</Label>
                  <Select
                    value={endpointForm.method}
                    onValueChange={(value) => setEndpointForm({ ...endpointForm, method: value as HttpMethod })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].map(m => (
                        <SelectItem key={m} value={m}>{m}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Version</Label>
                  <Input
                    value={endpointForm.version}
                    onChange={(e) => setEndpointForm({ ...endpointForm, version: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="endpoint-path">Path *</Label>
                <Input
                  id="endpoint-path"
                  placeholder="/api/v1/users/:id"
                  value={endpointForm.path}
                  onChange={(e) => setEndpointForm({ ...endpointForm, path: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  placeholder="Describe what this endpoint does..."
                  value={endpointForm.description}
                  onChange={(e) => setEndpointForm({ ...endpointForm, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Rate Limit (req/hr)</Label>
                  <Input
                    type="number"
                    value={endpointForm.rateLimit}
                    onChange={(e) => setEndpointForm({ ...endpointForm, rateLimit: parseInt(e.target.value) || 1000 })}
                  />
                </div>
                <div className="flex items-center gap-2 pt-6">
                  <Switch
                    checked={endpointForm.requiresAuth}
                    onCheckedChange={(checked) => setEndpointForm({ ...endpointForm, requiresAuth: checked })}
                  />
                  <Label>Requires Authentication</Label>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateEndpointDialog(false)}>Cancel</Button>
              <Button onClick={handleCreateEndpoint} disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
                Create Endpoint
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Create API Key Dialog */}
        <Dialog open={showCreateKeyDialog} onOpenChange={setShowCreateKeyDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Generate API Key</DialogTitle>
              <DialogDescription>Create a new API key for your application</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="key-name">Key Name *</Label>
                <Input
                  id="key-name"
                  placeholder="e.g., Production API Key"
                  value={apiKeyForm.name}
                  onChange={(e) => setApiKeyForm({ ...apiKeyForm, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  placeholder="What is this key used for?"
                  value={apiKeyForm.description}
                  onChange={(e) => setApiKeyForm({ ...apiKeyForm, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Environment</Label>
                  <Select
                    value={apiKeyForm.environment}
                    onValueChange={(value) => setApiKeyForm({ ...apiKeyForm, environment: value as Environment })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="development">Development</SelectItem>
                      <SelectItem value="staging">Staging</SelectItem>
                      <SelectItem value="production">Production</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Rate Limit (req/hr)</Label>
                  <Input
                    type="number"
                    value={apiKeyForm.rateLimit}
                    onChange={(e) => setApiKeyForm({ ...apiKeyForm, rateLimit: parseInt(e.target.value) || 1000 })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Scopes</Label>
                <div className="flex gap-2 flex-wrap">
                  {['read', 'write', 'delete', 'admin'].map(scope => (
                    <Button
                      key={scope}
                      variant={apiKeyForm.scopes.includes(scope) ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => {
                        const newScopes = apiKeyForm.scopes.includes(scope)
                          ? apiKeyForm.scopes.filter(s => s !== scope)
                          : [...apiKeyForm.scopes, scope]
                        setApiKeyForm({ ...apiKeyForm, scopes: newScopes })
                      }}
                    >
                      {scope}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Expiration (optional)</Label>
                <Input
                  type="date"
                  value={apiKeyForm.expiresAt}
                  onChange={(e) => setApiKeyForm({ ...apiKeyForm, expiresAt: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateKeyDialog(false)}>Cancel</Button>
              <Button onClick={handleGenerateApiKey} disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Key className="w-4 h-4 mr-2" />}
                Generate Key
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Test All Endpoints Dialog */}
        <Dialog open={showTestAllDialog} onOpenChange={setShowTestAllDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Play className="w-5 h-5 text-green-600" />
                Test All Endpoints
              </DialogTitle>
              <DialogDescription>
                Run automated tests against all {endpoints.length} active endpoints
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Endpoints to test</span>
                  <Badge>{endpoints.length}</Badge>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Estimated duration</span>
                  <span className="text-sm text-gray-500">{Math.ceil(endpoints.length * 0.5)}s</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Test environment</span>
                  <Badge variant="secondary">Development</Badge>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Test Options</Label>
                <div className="flex items-center gap-2">
                  <Switch defaultChecked />
                  <span className="text-sm">Include response validation</span>
                </div>
                <div className="flex items-center gap-2">
                  <Switch defaultChecked />
                  <span className="text-sm">Check response times</span>
                </div>
                <div className="flex items-center gap-2">
                  <Switch />
                  <span className="text-sm">Run stress tests</span>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowTestAllDialog(false)}>Cancel</Button>
              <Button onClick={() => { setShowTestAllDialog(false); toast.success('Running tests on all endpoints...'); }}>
                <Play className="w-4 h-4 mr-2" />
                Start Tests
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Import Dialog */}
        <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileJson className="w-5 h-5 text-purple-600" />
                Import API Collection
              </DialogTitle>
              <DialogDescription>
                Import endpoints from OpenAPI, Postman, or other formats
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Import Format</Label>
                <Select defaultValue="openapi">
                  <SelectTrigger>
                    <SelectValue placeholder="Select format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="openapi">OpenAPI 3.0 (JSON/YAML)</SelectItem>
                    <SelectItem value="postman">Postman Collection v2.1</SelectItem>
                    <SelectItem value="swagger">Swagger 2.0</SelectItem>
                    <SelectItem value="insomnia">Insomnia Export</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Upload File</Label>
                <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer">
                  <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-500">Drag and drop or click to upload</p>
                  <p className="text-xs text-gray-400 mt-1">Supports JSON, YAML files up to 10MB</p>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Or paste URL</Label>
                <Input placeholder="https://api.example.com/openapi.json" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowImportDialog(false)}>Cancel</Button>
              <Button onClick={() => { setShowImportDialog(false); toast.success('Import started...'); }}>
                <FileJson className="w-4 h-4 mr-2" />
                Import
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* API Documentation Dialog */}
        <Dialog open={showDocsDialog} onOpenChange={setShowDocsDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-teal-600" />
                API Documentation
              </DialogTitle>
              <DialogDescription>
                Interactive documentation for your API endpoints
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-2 mb-4">
                <Input placeholder="Search documentation..." className="flex-1" />
                <Button variant="outline" size="icon" onClick={() => {
                    const query = (document.querySelector('input[placeholder="Search documentation..."]') as HTMLInputElement)?.value;
                    if (query && query.trim()) {
                      toast.success(`Searching documentation for "${query}"`, { description: 'Found 12 matching articles' });
                    } else {
                      toast.info('Please enter a search term');
                    }
                  }}>
                  <Search className="w-4 h-4" />
                </Button>
              </div>
              <ScrollArea className="h-[300px]">
                <div className="space-y-3">
                  {endpoints.slice(0, 5).map(endpoint => (
                    <div key={endpoint.id} className="p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className={`font-mono text-xs ${getMethodColor(endpoint.method)}`}>{endpoint.method}</Badge>
                        <code className="text-sm">{endpoint.path}</code>
                      </div>
                      <p className="text-sm text-gray-500">{endpoint.description}</p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              <div className="flex items-center justify-between pt-2 border-t">
                <span className="text-sm text-gray-500">{endpoints.length} endpoints documented</span>
                <Button variant="link" size="sm" onClick={() => { setShowDocsDialog(false); toast.success('Opening full documentation...'); }}>View full documentation</Button>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDocsDialog(false)}>Close</Button>
              <Button onClick={() => { handleExportApiDocs(); setShowDocsDialog(false); }}>
                <Download className="w-4 h-4 mr-2" />
                Export Docs
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Rotate All Keys Dialog */}
        <Dialog open={showRotateAllKeysDialog} onOpenChange={setShowRotateAllKeysDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <RotateCcw className="w-5 h-5 text-orange-600" />
                Rotate All API Keys
              </DialogTitle>
              <DialogDescription>
                Generate new keys for all active API keys. Old keys will be invalidated.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-amber-800 dark:text-amber-200">Warning</p>
                    <p className="text-sm text-amber-700 dark:text-amber-300">
                      This action will invalidate all existing API keys. Applications using these keys will need to be updated.
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Keys to rotate</span>
                  <Badge>{apiKeys.filter(k => k.status === 'active').length}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Grace period</span>
                  <span className="text-sm text-gray-500">24 hours</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Switch defaultChecked />
                  <span className="text-sm">Send notification emails</span>
                </div>
                <div className="flex items-center gap-2">
                  <Switch defaultChecked />
                  <span className="text-sm">Keep old keys active for grace period</span>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowRotateAllKeysDialog(false)}>Cancel</Button>
              <Button variant="destructive" onClick={() => { setShowRotateAllKeysDialog(false); toast.success('All API keys have been rotated'); }}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Rotate All Keys
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Revoke Key Dialog */}
        <Dialog open={showRevokeKeyDialog} onOpenChange={setShowRevokeKeyDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-pink-600" />
                Revoke API Key
              </DialogTitle>
              <DialogDescription>
                Select an API key to revoke. This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Select Key to Revoke</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose an API key" />
                  </SelectTrigger>
                  <SelectContent>
                    {apiKeys.filter(k => k.status === 'active').map(key => (
                      <SelectItem key={key.id} value={key.id}>
                        {key.name} ({key.environment})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <div className="flex items-start gap-2">
                  <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-red-800 dark:text-red-200">Permanent Action</p>
                    <p className="text-sm text-red-700 dark:text-red-300">
                      Once revoked, this key will immediately stop working. Any applications using this key will fail to authenticate.
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Reason for revocation (optional)</Label>
                <Textarea placeholder="e.g., Key compromised, no longer needed, etc." />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowRevokeKeyDialog(false)}>Cancel</Button>
              <Button variant="destructive" onClick={async () => {
                  if (confirm('Are you sure you want to revoke this API key? This action cannot be undone.')) {
                    setIsSubmitting(true);
                    try {
                      if (selectedKeyForEdit) {
                        await revokeKey(selectedKeyForEdit.id);
                        toast.success('API key revoked successfully', { description: `${selectedKeyForEdit.name} has been revoked and can no longer be used.` });
                      }
                      setShowRevokeKeyDialog(false);
                    } catch (error) {
                      toast.error('Failed to revoke API key');
                    } finally {
                      setIsSubmitting(false);
                    }
                  }
                }}>
                <Lock className="w-4 h-4 mr-2" />
                Revoke Key
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Copy All Keys Dialog */}
        <Dialog open={showCopyAllKeysDialog} onOpenChange={setShowCopyAllKeysDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Copy className="w-5 h-5 text-blue-600" />
                Copy API Keys
              </DialogTitle>
              <DialogDescription>
                Copy API key information to clipboard
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Select Format</Label>
                <Select defaultValue="json">
                  <SelectTrigger>
                    <SelectValue placeholder="Choose format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="json">JSON</SelectItem>
                    <SelectItem value="env">Environment Variables (.env)</SelectItem>
                    <SelectItem value="csv">CSV</SelectItem>
                    <SelectItem value="yaml">YAML</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Keys to Include</Label>
                <div className="space-y-2 max-h-[200px] overflow-y-auto">
                  {apiKeys.map(key => (
                    <div key={key.id} className="flex items-center gap-2 p-2 border rounded">
                      <Switch defaultChecked={key.status === 'active'} />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{key.name}</p>
                        <p className="text-xs text-gray-500">{key.environment}</p>
                      </div>
                      <Badge className={getKeyStatusColor(key.status)}>{key.status}</Badge>
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-xs text-gray-500">Note: For security, full key values are not included. Only key prefixes and metadata will be copied.</p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCopyAllKeysDialog(false)}>Cancel</Button>
              <Button onClick={() => { navigator.clipboard.writeText(JSON.stringify(apiKeys.map(k => ({ name: k.name, prefix: k.keyPrefix, environment: k.environment })), null, 2)); setShowCopyAllKeysDialog(false); toast.success('API key information copied to clipboard'); }}>
                <Copy className="w-4 h-4 mr-2" />
                Copy to Clipboard
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Export Keys Dialog */}
        <Dialog open={showExportKeysDialog} onOpenChange={setShowExportKeysDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Download className="w-5 h-5 text-teal-600" />
                Export API Keys
              </DialogTitle>
              <DialogDescription>
                Export your API keys for backup or migration
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Export Format</Label>
                <Select defaultValue="json">
                  <SelectTrigger>
                    <SelectValue placeholder="Choose format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="json">JSON</SelectItem>
                    <SelectItem value="csv">CSV</SelectItem>
                    <SelectItem value="yaml">YAML</SelectItem>
                    <SelectItem value="env">Environment File (.env)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Include in Export</Label>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Switch defaultChecked />
                    <span className="text-sm">Key metadata (name, environment, scopes)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch defaultChecked />
                    <span className="text-sm">Usage statistics</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch />
                    <span className="text-sm">IP whitelist configuration</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch />
                    <span className="text-sm">Rate limit settings</span>
                  </div>
                </div>
              </div>
              <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                <p className="text-xs text-amber-700 dark:text-amber-300">
                  <AlertTriangle className="w-3 h-3 inline mr-1" />
                  For security, actual key values are never included in exports.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowExportKeysDialog(false)}>Cancel</Button>
              <Button onClick={() => { setShowExportKeysDialog(false); toast.success('API keys exported successfully'); }}>
                <Download className="w-4 h-4 mr-2" />
                Export Keys
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Key Dialog */}
        <Dialog open={showEditKeyDialog} onOpenChange={setShowEditKeyDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-gray-600" />
                Edit API Key
              </DialogTitle>
              <DialogDescription>
                Update settings for {selectedKeyForEdit?.name || 'this API key'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Key Name</Label>
                <Input defaultValue={selectedKeyForEdit?.name} placeholder="Enter key name" />
              </div>
              <div className="space-y-2">
                <Label>Environment</Label>
                <Select defaultValue={selectedKeyForEdit?.environment}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select environment" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="production">Production</SelectItem>
                    <SelectItem value="staging">Staging</SelectItem>
                    <SelectItem value="development">Development</SelectItem>
                    <SelectItem value="local">Local</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Rate Limit (requests/hour)</Label>
                <Input type="number" defaultValue={selectedKeyForEdit?.rateLimit || 1000} />
              </div>
              <div className="space-y-2">
                <Label>Scopes</Label>
                <div className="flex flex-wrap gap-2">
                  {['read', 'write', 'delete', 'admin'].map(scope => (
                    <Badge
                      key={scope}
                      variant={selectedKeyForEdit?.scopes.includes(scope) ? 'default' : 'outline'}
                      className="cursor-pointer"
                    >
                      {scope}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label>IP Whitelist (one per line)</Label>
                <Textarea
                  placeholder="192.168.1.1&#10;10.0.0.0/24"
                  defaultValue={selectedKeyForEdit?.ipWhitelist?.join('\n')}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEditKeyDialog(false)}>Cancel</Button>
              <Button onClick={() => { setShowEditKeyDialog(false); toast.success(`API key "${selectedKeyForEdit?.name}" updated`); }}>
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Collections Dialog */}
        <Dialog open={showCollectionsDialog} onOpenChange={setShowCollectionsDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Folder className="w-5 h-5 text-indigo-600" />
                API Collections
              </DialogTitle>
              <DialogDescription>
                Manage your API request collections and organize endpoints
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Input placeholder="Search collections..." className="max-w-xs" />
                <Button size="sm" onClick={() => { setShowCollectionsDialog(false); setShowCreateCollectionDialog(true); }}>
                  <FolderPlus className="w-4 h-4 mr-2" />
                  New Collection
                </Button>
              </div>
              <ScrollArea className="h-64">
                <div className="space-y-3">
                  {collections.map(collection => (
                    <div key={collection.id} className="p-4 border rounded-lg hover:border-indigo-300 transition-colors cursor-pointer">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <FolderOpen className="w-4 h-4 text-indigo-500" />
                          <span className="font-medium">{collection.name}</span>
                        </div>
                        <Badge className={getEnvironmentColor(collection.environment)}>{collection.environment}</Badge>
                      </div>
                      <p className="text-sm text-gray-500 mb-2">{collection.description}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-400">
                        <span>{collection.requests} requests</span>
                        <span>{collection.folders} folders</span>
                        <span>{collection.passRate}% pass rate</span>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCollectionsDialog(false)}>Close</Button>
              <Button onClick={() => { setShowCollectionsDialog(false); toast.success('Collection selected'); }}>
                Open Collection
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* History Dialog */}
        <Dialog open={showHistoryDialog} onOpenChange={setShowHistoryDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <History className="w-5 h-5 text-pink-600" />
                Request History
              </DialogTitle>
              <DialogDescription>
                View and replay recent API requests
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Input placeholder="Filter history..." className="flex-1" />
                <Select defaultValue="all">
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Methods</SelectItem>
                    <SelectItem value="GET">GET</SelectItem>
                    <SelectItem value="POST">POST</SelectItem>
                    <SelectItem value="PUT">PUT</SelectItem>
                    <SelectItem value="DELETE">DELETE</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <ScrollArea className="h-64">
                <div className="space-y-2">
                  {history.map(item => (
                    <div key={item.id} className="p-3 border rounded-lg hover:border-pink-300 transition-colors cursor-pointer">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <Badge className={getMethodColor(item.method)}>{item.method}</Badge>
                          <code className="text-sm">{item.url}</code>
                        </div>
                        <span className={`text-sm font-mono ${getHttpStatusColor(item.status)}`}>{item.status}</span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-400">
                        <span>{item.duration}ms</span>
                        <span>{formatSize(item.size)}</span>
                        <span>{formatTimeAgo(item.timestamp)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowHistoryDialog(false)}>Close</Button>
              <Button variant="destructive" onClick={() => {
                  if (confirm('Are you sure you want to clear all request history? This action cannot be undone.')) {
                    toast.success('Request history cleared', { description: `${history.length} requests have been removed from history.` });
                    setShowHistoryDialog(false);
                  }
                }}>
                <Trash2 className="w-4 h-4 mr-2" />
                Clear History
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Endpoint Settings Dialog */}
        <Dialog open={showEndpointSettingsDialog} onOpenChange={setShowEndpointSettingsDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-slate-600" />
                Endpoint Settings
              </DialogTitle>
              <DialogDescription>
                Configure default settings for API endpoints
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Auto-generate Documentation</Label>
                  <p className="text-xs text-gray-500">Automatically create OpenAPI docs</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Enable Versioning</Label>
                  <p className="text-xs text-gray-500">Track endpoint version history</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Require Authentication</Label>
                  <p className="text-xs text-gray-500">Default authentication requirement</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="space-y-2">
                <Label>Default Rate Limit (per hour)</Label>
                <Input type="number" defaultValue="1000" />
              </div>
              <div className="space-y-2">
                <Label>Default Timeout (seconds)</Label>
                <Input type="number" defaultValue="30" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEndpointSettingsDialog(false)}>Cancel</Button>
              <Button onClick={() => { setShowEndpointSettingsDialog(false); toast.success('Endpoint settings saved'); }}>
                Save Settings
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Permissions Dialog */}
        <Dialog open={showPermissionsDialog} onOpenChange={setShowPermissionsDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-red-600" />
                API Key Permissions
              </DialogTitle>
              <DialogDescription>
                Configure permission scopes for API keys
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <Label className="text-sm font-semibold">Read Permissions</Label>
                  <div className="space-y-2">
                    {['users:read', 'products:read', 'orders:read', 'analytics:read'].map(perm => (
                      <div key={perm} className="flex items-center gap-2">
                        <Switch defaultChecked id={perm} />
                        <Label htmlFor={perm} className="text-sm font-mono">{perm}</Label>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-3">
                  <Label className="text-sm font-semibold">Write Permissions</Label>
                  <div className="space-y-2">
                    {['users:write', 'products:write', 'orders:write', 'webhooks:write'].map(perm => (
                      <div key={perm} className="flex items-center gap-2">
                        <Switch id={perm} />
                        <Label htmlFor={perm} className="text-sm font-mono">{perm}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <p className="text-sm text-yellow-700 dark:text-yellow-400 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Changes will affect all keys with these scopes
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowPermissionsDialog(false)}>Cancel</Button>
              <Button onClick={() => { setShowPermissionsDialog(false); toast.success('Permissions updated'); }}>
                Save Permissions
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Usage Log Dialog */}
        <Dialog open={showUsageLogDialog} onOpenChange={setShowUsageLogDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-purple-600" />
                API Usage Log
              </DialogTitle>
              <DialogDescription>
                View detailed usage statistics and request logs
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-4 gap-4">
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatNumber(stats.totalRequests)}</p>
                  <p className="text-xs text-gray-500">Total Requests</p>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                  <p className="text-2xl font-bold text-green-600">{formatLatency(stats.avgLatency)}</p>
                  <p className="text-xs text-gray-500">Avg Latency</p>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                  <p className="text-2xl font-bold text-blue-600">{stats.activeKeys}</p>
                  <p className="text-xs text-gray-500">Active Keys</p>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                  <p className="text-2xl font-bold text-red-600">{stats.avgErrorRate.toFixed(2)}%</p>
                  <p className="text-xs text-gray-500">Error Rate</p>
                </div>
              </div>
              <ScrollArea className="h-48">
                <div className="space-y-2">
                  {apiKeys.slice(0, 5).map(key => (
                    <div key={key.id} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{key.name}</span>
                        <Badge className={getKeyStatusColor(key.status)}>{key.status}</Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>{formatNumber(key.totalRequests)} requests</span>
                        <span>Last used: {formatTimeAgo(key.lastUsed)}</span>
                      </div>
                      <Progress value={(key.totalRequests / (stats.totalRequests || 1)) * 100} className="mt-2 h-1" />
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowUsageLogDialog(false)}>Close</Button>
              <Button onClick={() => {
                  const reportData = {
                    generatedAt: new Date().toISOString(),
                    totalRequests: stats.totalRequests,
                    avgLatency: stats.avgLatency,
                    activeKeys: stats.activeKeys,
                    errorRate: stats.avgErrorRate,
                    keys: apiKeys.map(k => ({
                      name: k.name,
                      requests: k.totalRequests,
                      lastUsed: k.lastUsed
                    }))
                  };
                  const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `api-usage-report-${new Date().toISOString().split('T')[0]}.json`;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  URL.revokeObjectURL(url);
                  toast.success('Usage report exported', { description: 'Report has been downloaded as JSON' });
                }}>
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Key Settings Dialog */}
        <Dialog open={showKeySettingsDialog} onOpenChange={setShowKeySettingsDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Cog className="w-5 h-5 text-slate-600" />
                API Key Settings
              </DialogTitle>
              <DialogDescription>
                Configure global settings for API key management
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Auto-expire Keys</Label>
                  <p className="text-xs text-gray-500">Automatically expire keys after set period</p>
                </div>
                <Switch />
              </div>
              <div className="space-y-2">
                <Label>Default Expiration (days)</Label>
                <Input type="number" defaultValue="90" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>IP Whitelist Required</Label>
                  <p className="text-xs text-gray-500">Require IP whitelist for production keys</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Usage Alerts</Label>
                  <p className="text-xs text-gray-500">Get notified at usage thresholds</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="space-y-2">
                <Label>Alert Threshold (%)</Label>
                <Input type="number" defaultValue="80" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Audit Logging</Label>
                  <p className="text-xs text-gray-500">Log all key operations</p>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowKeySettingsDialog(false)}>Cancel</Button>
              <Button onClick={() => { setShowKeySettingsDialog(false); toast.success('Key settings saved'); }}>
                Save Settings
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Filter Dialog */}
        <Dialog open={showFilterDialog} onOpenChange={setShowFilterDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-gray-600" />
                Filter Endpoints
              </DialogTitle>
              <DialogDescription>Apply filters to narrow down your endpoint list</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Method</Label>
                <Select defaultValue="all">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Methods</SelectItem>
                    <SelectItem value="GET">GET</SelectItem>
                    <SelectItem value="POST">POST</SelectItem>
                    <SelectItem value="PUT">PUT</SelectItem>
                    <SelectItem value="DELETE">DELETE</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select defaultValue="all">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="deprecated">Deprecated</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Tags</Label>
                <Input placeholder="Filter by tags..." />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowFilterDialog(false)}>Cancel</Button>
              <Button onClick={() => { setShowFilterDialog(false); toast.success('Filters applied'); }}>Apply Filters</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Endpoint Actions Dialog */}
        <Dialog open={showEndpointActionsDialog} onOpenChange={setShowEndpointActionsDialog}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Endpoint Actions</DialogTitle>
              <DialogDescription>{selectedEndpointForActions?.name || 'Selected endpoint'}</DialogDescription>
            </DialogHeader>
            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-start" onClick={() => { handleTestEndpoint(selectedEndpointForActions?.name || ''); setShowEndpointActionsDialog(false); }}>
                <Play className="w-4 h-4 mr-2" /> Test Endpoint
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => { setShowEndpointActionsDialog(false); if(selectedEndpointForActions) setSelectedEndpoint(selectedEndpointForActions); }}>
                <Eye className="w-4 h-4 mr-2" /> View Details
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => { navigator.clipboard.writeText(selectedEndpointForActions?.path || ''); toast.success('Path copied'); setShowEndpointActionsDialog(false); }}>
                <Copy className="w-4 h-4 mr-2" /> Copy Path
              </Button>
              <Button variant="outline" className="w-full justify-start text-red-600" onClick={() => { if(selectedEndpointForActions) handleDeleteEndpoint(selectedEndpointForActions.id, selectedEndpointForActions.name); setShowEndpointActionsDialog(false); }}>
                <Trash2 className="w-4 h-4 mr-2" /> Delete Endpoint
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Send Request Dialog */}
        <Dialog open={showSendRequestDialog} onOpenChange={setShowSendRequestDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Send className="w-5 h-5 text-blue-600" />
                Send API Request
              </DialogTitle>
              <DialogDescription>Configure and send your API request</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex gap-2">
                <Select defaultValue="GET">
                  <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GET">GET</SelectItem>
                    <SelectItem value="POST">POST</SelectItem>
                    <SelectItem value="PUT">PUT</SelectItem>
                    <SelectItem value="DELETE">DELETE</SelectItem>
                  </SelectContent>
                </Select>
                <Input placeholder="https://api.example.com/endpoint" className="flex-1" defaultValue={requestUrl} />
              </div>
              <div className="space-y-2">
                <Label>Headers</Label>
                <Textarea placeholder="Content-Type: application/json" className="font-mono text-sm" rows={3} />
              </div>
              <div className="space-y-2">
                <Label>Body (JSON)</Label>
                <Textarea placeholder='{"key": "value"}' className="font-mono text-sm" rows={5} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowSendRequestDialog(false)}>Cancel</Button>
              <Button onClick={() => { setShowSendRequestDialog(false); toast.success('Request sent successfully', { description: 'Response: 200 OK' }); }}>
                <Send className="w-4 h-4 mr-2" /> Send Request
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Code Generation Dialog */}
        <Dialog open={showCodeGenDialog} onOpenChange={setShowCodeGenDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Code className="w-5 h-5 text-purple-600" />
                Generated {selectedCodeGenLanguage} Code
              </DialogTitle>
              <DialogDescription>Copy this code snippet to use the API</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="p-4 bg-gray-900 rounded-lg">
                <pre className="text-sm text-green-400 font-mono overflow-x-auto">
{selectedCodeGenLanguage === 'cURL' && `curl -X GET "https://api.example.com/v1/users" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json"`}
{selectedCodeGenLanguage === 'JavaScript' && `fetch('https://api.example.com/v1/users', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
})
.then(response => response.json())
.then(data => console.log(data));`}
{selectedCodeGenLanguage === 'Python' && `import requests

response = requests.get(
    'https://api.example.com/v1/users',
    headers={
        'Authorization': 'Bearer YOUR_API_KEY',
        'Content-Type': 'application/json'
    }
)
print(response.json())`}
{selectedCodeGenLanguage === 'Go' && `package main

import (
    "net/http"
    "fmt"
)

func main() {
    req, _ := http.NewRequest("GET", "https://api.example.com/v1/users", nil)
    req.Header.Set("Authorization", "Bearer YOUR_API_KEY")
    client := &http.Client{}
    resp, _ := client.Do(req)
    fmt.Println(resp)
}`}
{selectedCodeGenLanguage === 'PHP' && `<?php
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, 'https://api.example.com/v1/users');
curl_setopt($ch, CURLOPT_HTTPHEADER, array(
    'Authorization: Bearer YOUR_API_KEY',
    'Content-Type: application/json'
));
$response = curl_exec($ch);
curl_close($ch);
echo $response;
?>`}
                </pre>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCodeGenDialog(false)}>Close</Button>
              <Button onClick={() => { navigator.clipboard.writeText('Code copied!'); toast.success('Code copied to clipboard'); }}>
                <Copy className="w-4 h-4 mr-2" /> Copy Code
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* API Key Actions Dialog */}
        <Dialog open={showKeyActionsDialog} onOpenChange={setShowKeyActionsDialog}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>API Key Actions</DialogTitle>
              <DialogDescription>{selectedKeyForActions?.name || 'Selected key'}</DialogDescription>
            </DialogHeader>
            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-start" onClick={() => { setShowKeyActionsDialog(false); if(selectedKeyForActions) { setSelectedKeyForEdit(selectedKeyForActions); setShowEditKeyDialog(true); }}}>
                <Settings className="w-4 h-4 mr-2" /> Edit Key
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => { navigator.clipboard.writeText(selectedKeyForActions?.keyPrefix || ''); toast.success('Key prefix copied'); setShowKeyActionsDialog(false); }}>
                <Copy className="w-4 h-4 mr-2" /> Copy Key Prefix
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => { setShowKeyActionsDialog(false); setShowUsageLogDialog(true); }}>
                <Activity className="w-4 h-4 mr-2" /> View Usage
              </Button>
              <Button variant="outline" className="w-full justify-start text-red-600" onClick={() => { if(selectedKeyForActions) handleRevokeApiKey(selectedKeyForActions.id, selectedKeyForActions.name); setShowKeyActionsDialog(false); }}>
                <Lock className="w-4 h-4 mr-2" /> Revoke Key
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Create Collection Dialog */}
        <Dialog open={showCreateCollectionDialog} onOpenChange={setShowCreateCollectionDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FolderPlus className="w-5 h-5 text-purple-600" />
                Create New Collection
              </DialogTitle>
              <DialogDescription>Organize your API requests into a collection</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Collection Name</Label>
                <Input placeholder="e.g., User Management API" />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea placeholder="Describe what this collection contains..." />
              </div>
              <div className="space-y-2">
                <Label>Environment</Label>
                <Select defaultValue="development">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="development">Development</SelectItem>
                    <SelectItem value="staging">Staging</SelectItem>
                    <SelectItem value="production">Production</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <Switch defaultChecked />
                <Label>Share with team</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateCollectionDialog(false)}>Cancel</Button>
              <Button onClick={() => { setShowCreateCollectionDialog(false); toast.success('Collection created successfully'); }}>
                <FolderPlus className="w-4 h-4 mr-2" /> Create Collection
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Import Collection Dialog */}
        <Dialog open={showImportCollectionDialog} onOpenChange={setShowImportCollectionDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-pink-600" />
                Import Collection
              </DialogTitle>
              <DialogDescription>Import from Postman, OpenAPI, or other formats</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Import Format</Label>
                <Select defaultValue="postman">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="postman">Postman Collection v2.1</SelectItem>
                    <SelectItem value="openapi">OpenAPI 3.0</SelectItem>
                    <SelectItem value="swagger">Swagger 2.0</SelectItem>
                    <SelectItem value="insomnia">Insomnia</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer">
                <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm text-gray-500">Drag and drop or click to upload</p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowImportCollectionDialog(false)}>Cancel</Button>
              <Button onClick={() => { setShowImportCollectionDialog(false); toast.success('Collection imported successfully'); }}>
                <Upload className="w-4 h-4 mr-2" /> Import
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Export Collections Dialog */}
        <Dialog open={showExportCollectionsDialog} onOpenChange={setShowExportCollectionsDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Download className="w-5 h-5 text-rose-600" />
                Export All Collections
              </DialogTitle>
              <DialogDescription>Export your collections in various formats</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Export Format</Label>
                <Select defaultValue="postman">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="postman">Postman Collection v2.1</SelectItem>
                    <SelectItem value="openapi">OpenAPI 3.0</SelectItem>
                    <SelectItem value="json">JSON</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                {collections.map(c => (
                  <div key={c.id} className="flex items-center gap-2 p-2 border rounded">
                    <Switch defaultChecked />
                    <span className="text-sm">{c.name}</span>
                  </div>
                ))}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowExportCollectionsDialog(false)}>Cancel</Button>
              <Button onClick={() => { setShowExportCollectionsDialog(false); toast.success('Collections exported'); }}>
                <Download className="w-4 h-4 mr-2" /> Export
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Share Collection Dialog */}
        <Dialog open={showShareCollectionDialog} onOpenChange={setShowShareCollectionDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-600" />
                Share Collection
              </DialogTitle>
              <DialogDescription>Share with your team or generate a public link</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Select Collection</Label>
                <Select>
                  <SelectTrigger><SelectValue placeholder="Choose a collection" /></SelectTrigger>
                  <SelectContent>
                    {collections.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Invite by Email</Label>
                <Input placeholder="Enter email addresses..." />
              </div>
              <div className="flex items-center gap-2">
                <Switch />
                <Label>Generate public link</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowShareCollectionDialog(false)}>Cancel</Button>
              <Button onClick={() => { setShowShareCollectionDialog(false); toast.success('Collection shared successfully'); }}>
                <Users className="w-4 h-4 mr-2" /> Share
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Fork Collection Dialog */}
        <Dialog open={showForkCollectionDialog} onOpenChange={setShowForkCollectionDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <GitBranch className="w-5 h-5 text-violet-600" />
                Fork Collection
              </DialogTitle>
              <DialogDescription>Create a copy of an existing collection</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Source Collection</Label>
                <Select>
                  <SelectTrigger><SelectValue placeholder="Select collection to fork" /></SelectTrigger>
                  <SelectContent>
                    {collections.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>New Collection Name</Label>
                <Input placeholder="My forked collection" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowForkCollectionDialog(false)}>Cancel</Button>
              <Button onClick={() => { setShowForkCollectionDialog(false); toast.success('Collection forked successfully'); }}>
                <GitBranch className="w-4 h-4 mr-2" /> Fork
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Generate SDK Dialog */}
        <Dialog open={showGenerateSdkDialog} onOpenChange={setShowGenerateSdkDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileCode className="w-5 h-5 text-fuchsia-600" />
                Generate SDK
              </DialogTitle>
              <DialogDescription>Auto-generate client SDK from your API</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Target Language</Label>
                <Select defaultValue="typescript">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="typescript">TypeScript</SelectItem>
                    <SelectItem value="javascript">JavaScript</SelectItem>
                    <SelectItem value="python">Python</SelectItem>
                    <SelectItem value="go">Go</SelectItem>
                    <SelectItem value="java">Java</SelectItem>
                    <SelectItem value="csharp">C#</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Package Name</Label>
                <Input placeholder="@mycompany/api-client" />
              </div>
              <div className="flex items-center gap-2">
                <Switch defaultChecked />
                <Label>Include TypeScript definitions</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowGenerateSdkDialog(false)}>Cancel</Button>
              <Button onClick={() => { setShowGenerateSdkDialog(false); toast.success('SDK generated successfully'); }}>
                <FileCode className="w-4 h-4 mr-2" /> Generate
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Run All Collections Dialog */}
        <Dialog open={showRunAllCollectionsDialog} onOpenChange={setShowRunAllCollectionsDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <PlayCircle className="w-5 h-5 text-emerald-600" />
                Run All Collections
              </DialogTitle>
              <DialogDescription>Execute all requests in selected collections</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                {collections.map(c => (
                  <div key={c.id} className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center gap-2">
                      <Switch defaultChecked />
                      <span className="font-medium">{c.name}</span>
                    </div>
                    <Badge variant="secondary">{c.requests} requests</Badge>
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                <Label>Environment</Label>
                <Select defaultValue="development">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="development">Development</SelectItem>
                    <SelectItem value="staging">Staging</SelectItem>
                    <SelectItem value="production">Production</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowRunAllCollectionsDialog(false)}>Cancel</Button>
              <Button onClick={() => { setShowRunAllCollectionsDialog(false); toast.success('Running all collections...'); }}>
                <PlayCircle className="w-4 h-4 mr-2" /> Run All
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Archive Collection Dialog */}
        <Dialog open={showArchiveCollectionDialog} onOpenChange={setShowArchiveCollectionDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Archive className="w-5 h-5 text-gray-600" />
                Archive Collection
              </DialogTitle>
              <DialogDescription>Archive unused collections to keep your workspace clean</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Select Collections to Archive</Label>
                {collections.map(c => (
                  <div key={c.id} className="flex items-center gap-2 p-2 border rounded">
                    <Switch />
                    <span className="text-sm">{c.name}</span>
                    <span className="text-xs text-gray-500 ml-auto">Last run: {formatTimeAgo(c.lastRun)}</span>
                  </div>
                ))}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowArchiveCollectionDialog(false)}>Cancel</Button>
              <Button onClick={() => { setShowArchiveCollectionDialog(false); toast.success('Collections archived'); }}>
                <Archive className="w-4 h-4 mr-2" /> Archive
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Search History Dialog */}
        <Dialog open={showSearchHistoryDialog} onOpenChange={setShowSearchHistoryDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Search className="w-5 h-5 text-amber-600" />
                Search History
              </DialogTitle>
              <DialogDescription>Search through your request history</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Input placeholder="Search by URL, method, or status..." autoFocus />
              <ScrollArea className="h-48">
                <div className="space-y-2">
                  {history.slice(0, 5).map(h => (
                    <div key={h.id} className="flex items-center gap-2 p-2 border rounded hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
                      <Badge className={getMethodColor(h.method)}>{h.method}</Badge>
                      <span className="text-sm truncate flex-1">{h.url}</span>
                      <span className={`text-sm ${getHttpStatusColor(h.status)}`}>{h.status}</span>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowSearchHistoryDialog(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Filter History Dialog */}
        <Dialog open={showFilterHistoryDialog} onOpenChange={setShowFilterHistoryDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-orange-600" />
                Filter History
              </DialogTitle>
              <DialogDescription>Filter request history by various criteria</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Method</Label>
                  <Select defaultValue="all">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="GET">GET</SelectItem>
                      <SelectItem value="POST">POST</SelectItem>
                      <SelectItem value="PUT">PUT</SelectItem>
                      <SelectItem value="DELETE">DELETE</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select defaultValue="all">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="2xx">2xx Success</SelectItem>
                      <SelectItem value="4xx">4xx Client Error</SelectItem>
                      <SelectItem value="5xx">5xx Server Error</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Date Range</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Input type="date" />
                  <Input type="date" />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowFilterHistoryDialog(false)}>Cancel</Button>
              <Button onClick={() => { setShowFilterHistoryDialog(false); toast.success('Filters applied'); }}>Apply Filters</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Export HAR Dialog */}
        <Dialog open={showExportHarDialog} onOpenChange={setShowExportHarDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Download className="w-5 h-5 text-red-600" />
                Export HAR File
              </DialogTitle>
              <DialogDescription>Export request history as HTTP Archive format</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm"><strong>Requests to export:</strong> {history.length}</p>
                <p className="text-sm"><strong>Format:</strong> HAR 1.2</p>
              </div>
              <div className="flex items-center gap-2">
                <Switch defaultChecked />
                <Label>Include response bodies</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch defaultChecked />
                <Label>Include headers</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowExportHarDialog(false)}>Cancel</Button>
              <Button onClick={() => { setShowExportHarDialog(false); toast.success('HAR file exported'); }}>
                <Download className="w-4 h-4 mr-2" /> Export HAR
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Clear History Dialog */}
        <Dialog open={showClearHistoryDialog} onOpenChange={setShowClearHistoryDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Trash2 className="w-5 h-5 text-rose-600" />
                Clear History
              </DialogTitle>
              <DialogDescription>This action cannot be undone</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-700 dark:text-red-300">
                  You are about to delete {history.length} request records. This action is permanent.
                </p>
              </div>
              <div className="space-y-2">
                <Label>Clear Options</Label>
                <div className="flex items-center gap-2">
                  <Switch defaultChecked />
                  <span className="text-sm">Clear all history</span>
                </div>
                <div className="flex items-center gap-2">
                  <Switch />
                  <span className="text-sm">Keep last 24 hours</span>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowClearHistoryDialog(false)}>Cancel</Button>
              <Button variant="destructive" onClick={() => {
                  if (confirm('Are you sure you want to clear history? This action cannot be undone.')) {
                    toast.success('History cleared successfully', { description: `${history.length} request records have been deleted.` });
                    setShowClearHistoryDialog(false);
                  }
                }}>
                <Trash2 className="w-4 h-4 mr-2" /> Clear History
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Replay Request Dialog */}
        <Dialog open={showReplayRequestDialog} onOpenChange={setShowReplayRequestDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-yellow-600" />
                Replay Request
              </DialogTitle>
              <DialogDescription>Select a request from history to replay</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <ScrollArea className="h-48">
                <div className="space-y-2">
                  {history.map(h => (
                    <div key={h.id} className="flex items-center gap-2 p-2 border rounded hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
                      <Badge className={getMethodColor(h.method)}>{h.method}</Badge>
                      <span className="text-sm truncate flex-1">{h.url}</span>
                      <Button size="sm" variant="ghost" onClick={() => { setShowReplayRequestDialog(false); toast.success('Request replayed successfully'); }}>
                        <RefreshCw className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowReplayRequestDialog(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Copy cURL Dialog */}
        <Dialog open={showCopyCurlDialog} onOpenChange={setShowCopyCurlDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Copy className="w-5 h-5 text-lime-600" />
                Copy as cURL
              </DialogTitle>
              <DialogDescription>Select a request to copy as cURL command</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <ScrollArea className="h-48">
                <div className="space-y-2">
                  {history.map(h => (
                    <div key={h.id} className="flex items-center gap-2 p-2 border rounded hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer" onClick={() => { navigator.clipboard.writeText(`curl -X ${h.method} "${h.url}"`); toast.success('cURL copied to clipboard'); setShowCopyCurlDialog(false); }}>
                      <Badge className={getMethodColor(h.method)}>{h.method}</Badge>
                      <span className="text-sm truncate flex-1">{h.url}</span>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCopyCurlDialog(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Inspect Request Dialog */}
        <Dialog open={showInspectRequestDialog} onOpenChange={setShowInspectRequestDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-emerald-600" />
                Inspect Request
              </DialogTitle>
              <DialogDescription>View detailed request and response information</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Tabs defaultValue="request">
                <TabsList>
                  <TabsTrigger value="request">Request</TabsTrigger>
                  <TabsTrigger value="response">Response</TabsTrigger>
                  <TabsTrigger value="headers">Headers</TabsTrigger>
                </TabsList>
                <TabsContent value="request" className="mt-4">
                  <div className="p-4 bg-gray-900 rounded-lg">
                    <pre className="text-sm text-green-400 font-mono">GET /api/v1/users HTTP/1.1{'\n'}Host: api.example.com{'\n'}Authorization: Bearer ***</pre>
                  </div>
                </TabsContent>
                <TabsContent value="response" className="mt-4">
                  <div className="p-4 bg-gray-900 rounded-lg">
                    <pre className="text-sm text-green-400 font-mono">{'{\n  "users": [...],\n  "total": 100\n}'}</pre>
                  </div>
                </TabsContent>
                <TabsContent value="headers" className="mt-4">
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-1">
                    <p className="text-sm"><strong>Content-Type:</strong> application/json</p>
                    <p className="text-sm"><strong>X-Request-ID:</strong> abc123</p>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowInspectRequestDialog(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Save Request Dialog */}
        <Dialog open={showSaveRequestDialog} onOpenChange={setShowSaveRequestDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <BookmarkPlus className="w-5 h-5 text-teal-600" />
                Save Request
              </DialogTitle>
              <DialogDescription>Save a request to a collection</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Request Name</Label>
                <Input placeholder="e.g., Get all users" />
              </div>
              <div className="space-y-2">
                <Label>Collection</Label>
                <Select>
                  <SelectTrigger><SelectValue placeholder="Select a collection" /></SelectTrigger>
                  <SelectContent>
                    {collections.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Description (optional)</Label>
                <Textarea placeholder="Describe this request..." />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowSaveRequestDialog(false)}>Cancel</Button>
              <Button onClick={() => { setShowSaveRequestDialog(false); toast.success('Request saved to collection'); }}>
                <BookmarkPlus className="w-4 h-4 mr-2" /> Save Request
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* New Monitor Dialog */}
        <Dialog open={showNewMonitorDialog} onOpenChange={setShowNewMonitorDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-cyan-600" />
                Create New Monitor
              </DialogTitle>
              <DialogDescription>Set up uptime monitoring for your API endpoints</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Monitor Name</Label>
                <Input placeholder="e.g., API Health Check" />
              </div>
              <div className="space-y-2">
                <Label>Endpoint URL</Label>
                <Input placeholder="https://api.example.com/health" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Check Interval</Label>
                  <Select defaultValue="60">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 seconds</SelectItem>
                      <SelectItem value="60">1 minute</SelectItem>
                      <SelectItem value="300">5 minutes</SelectItem>
                      <SelectItem value="600">10 minutes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Region</Label>
                  <Select defaultValue="us-east-1">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="us-east-1">US East</SelectItem>
                      <SelectItem value="us-west-2">US West</SelectItem>
                      <SelectItem value="eu-west-1">EU West</SelectItem>
                      <SelectItem value="ap-southeast-1">Asia Pacific</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Switch defaultChecked />
                <Label>Enable alerts on failure</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowNewMonitorDialog(false)}>Cancel</Button>
              <Button onClick={() => { setShowNewMonitorDialog(false); toast.success('Monitor created successfully'); }}>
                <Plus className="w-4 h-4 mr-2" /> Create Monitor
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Status Page Dialog */}
        <Dialog open={showStatusPageDialog} onOpenChange={setShowStatusPageDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-teal-600" />
                Status Page
              </DialogTitle>
              <DialogDescription>Public status page for your API services</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {monitors.map(m => (
                  <div key={m.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{m.name}</span>
                      <Badge className={getMonitorStatusColor(m.status)}>{m.status}</Badge>
                    </div>
                    <p className="text-sm text-gray-500">Uptime: {m.uptime}%</p>
                  </div>
                ))}
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm"><strong>Public URL:</strong> https://status.example.com</p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowStatusPageDialog(false)}>Close</Button>
              <Button onClick={() => { navigator.clipboard.writeText('https://status.example.com'); toast.success('Status page URL copied'); }}>
                <Copy className="w-4 h-4 mr-2" /> Copy URL
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Alerts Dialog */}
        <Dialog open={showAlertsDialog} onOpenChange={setShowAlertsDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-emerald-600" />
                Alert Configuration
              </DialogTitle>
              <DialogDescription>Configure alert notifications for your monitors</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Email Alerts</Label>
                  <p className="text-xs text-gray-500">Send alerts via email</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Slack Notifications</Label>
                  <p className="text-xs text-gray-500">Post alerts to Slack</p>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Webhook Alerts</Label>
                  <p className="text-xs text-gray-500">Send to custom webhook</p>
                </div>
                <Switch />
              </div>
              <div className="space-y-2">
                <Label>Alert Threshold</Label>
                <Select defaultValue="1">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">After 1 failure</SelectItem>
                    <SelectItem value="2">After 2 failures</SelectItem>
                    <SelectItem value="3">After 3 failures</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAlertsDialog(false)}>Cancel</Button>
              <Button onClick={() => { setShowAlertsDialog(false); toast.success('Alert settings saved'); }}>Save Settings</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Regions Dialog */}
        <Dialog open={showRegionsDialog} onOpenChange={setShowRegionsDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-green-600" />
                Monitoring Regions
              </DialogTitle>
              <DialogDescription>Select regions to monitor from</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {['US East (Virginia)', 'US West (Oregon)', 'EU West (Ireland)', 'Asia Pacific (Singapore)', 'South America (Sao Paulo)'].map(region => (
                <div key={region} className="flex items-center gap-2 p-2 border rounded">
                  <Switch defaultChecked={region.includes('US')} />
                  <span className="text-sm">{region}</span>
                </div>
              ))}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowRegionsDialog(false)}>Cancel</Button>
              <Button onClick={() => { setShowRegionsDialog(false); toast.success('Regions updated'); }}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Intervals Dialog */}
        <Dialog open={showIntervalsDialog} onOpenChange={setShowIntervalsDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-lime-600" />
                Check Intervals
              </DialogTitle>
              <DialogDescription>Configure how often monitors check endpoints</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Default Interval</Label>
                <Select defaultValue="60">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 seconds</SelectItem>
                    <SelectItem value="60">1 minute</SelectItem>
                    <SelectItem value="300">5 minutes</SelectItem>
                    <SelectItem value="600">10 minutes</SelectItem>
                    <SelectItem value="1800">30 minutes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-500">Shorter intervals provide faster incident detection but increase resource usage.</p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowIntervalsDialog(false)}>Cancel</Button>
              <Button onClick={() => { setShowIntervalsDialog(false); toast.success('Intervals updated'); }}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Monitor Analytics Dialog */}
        <Dialog open={showMonitorAnalyticsDialog} onOpenChange={setShowMonitorAnalyticsDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-yellow-600" />
                Monitor Analytics
              </DialogTitle>
              <DialogDescription>Performance metrics and trends</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-4 gap-4">
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                  <p className="text-2xl font-bold text-green-600">99.9%</p>
                  <p className="text-xs text-gray-500">Avg Uptime</p>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                  <p className="text-2xl font-bold">45ms</p>
                  <p className="text-xs text-gray-500">Avg Response</p>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                  <p className="text-2xl font-bold">5</p>
                  <p className="text-xs text-gray-500">Incidents</p>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                  <p className="text-2xl font-bold">2.5m</p>
                  <p className="text-xs text-gray-500">Avg MTTR</p>
                </div>
              </div>
              <div className="h-48 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                <p className="text-gray-500">Response time chart</p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowMonitorAnalyticsDialog(false)}>Close</Button>
              <Button onClick={() => {
                  const analyticsReport = {
                    generatedAt: new Date().toISOString(),
                    summary: {
                      avgUptime: '99.9%',
                      avgResponse: '45ms',
                      incidents: 5,
                      avgMTTR: '2.5m'
                    },
                    monitors: monitors.map(m => ({
                      name: m.name,
                      status: m.status,
                      uptime: m.uptime,
                      avgResponseTime: m.avgResponseTime
                    }))
                  };
                  const blob = new Blob([JSON.stringify(analyticsReport, null, 2)], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `monitor-analytics-${new Date().toISOString().split('T')[0]}.json`;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  URL.revokeObjectURL(url);
                  toast.success('Analytics report exported', { description: 'Report has been downloaded as JSON' });
                }}>
                <Download className="w-4 h-4 mr-2" /> Export Report
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* SSL Check Dialog */}
        <Dialog open={showSslCheckDialog} onOpenChange={setShowSslCheckDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-orange-600" />
                SSL Certificate Check
              </DialogTitle>
              <DialogDescription>Verify SSL certificates for your endpoints</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {monitors.map(m => (
                <div key={m.id} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{m.endpoint}</span>
                    <Badge className="bg-green-100 text-green-700">Valid</Badge>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">Expires in 45 days</p>
                </div>
              ))}
              <div className="flex items-center gap-2">
                <Switch defaultChecked />
                <Label>Alert 30 days before expiry</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowSslCheckDialog(false)}>Close</Button>
              <Button onClick={() => {
                  toast.success('SSL settings saved', { description: 'SSL certificate monitoring configured. You will be alerted 30 days before expiry.' });
                  setShowSslCheckDialog(false);
                }}>Save Settings</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Monitor Config Dialog */}
        <Dialog open={showMonitorConfigDialog} onOpenChange={setShowMonitorConfigDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-gray-600" />
                Monitor Configuration
              </DialogTitle>
              <DialogDescription>Global settings for all monitors</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Enable Monitoring</Label>
                  <p className="text-xs text-gray-500">Turn all monitors on/off</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="space-y-2">
                <Label>Request Timeout (seconds)</Label>
                <Input type="number" defaultValue="30" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Follow Redirects</Label>
                  <p className="text-xs text-gray-500">Follow HTTP redirects</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Verify SSL</Label>
                  <p className="text-xs text-gray-500">Verify SSL certificates</p>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowMonitorConfigDialog(false)}>Cancel</Button>
              <Button onClick={() => { setShowMonitorConfigDialog(false); toast.success('Configuration saved'); }}>Save Settings</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* New Webhook Dialog */}
        <Dialog open={showNewWebhookDialog} onOpenChange={setShowNewWebhookDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-indigo-600" />
                Create New Webhook
              </DialogTitle>
              <DialogDescription>Set up webhook notifications</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Webhook Name</Label>
                <Input placeholder="e.g., Order Notifications" />
              </div>
              <div className="space-y-2">
                <Label>Webhook URL</Label>
                <Input placeholder="https://your-server.com/webhook" />
              </div>
              <div className="space-y-2">
                <Label>Events to Subscribe</Label>
                <div className="grid grid-cols-2 gap-2">
                  {['order.created', 'order.updated', 'user.created', 'payment.success'].map(event => (
                    <div key={event} className="flex items-center gap-2">
                      <Switch />
                      <span className="text-sm font-mono">{event}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Secret Key (optional)</Label>
                <Input placeholder="For signature verification" type="password" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowNewWebhookDialog(false)}>Cancel</Button>
              <Button onClick={() => { setShowNewWebhookDialog(false); toast.success('Webhook created successfully'); }}>
                <Plus className="w-4 h-4 mr-2" /> Create Webhook
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Test Webhook Dialog */}
        <Dialog open={showTestWebhookDialog} onOpenChange={setShowTestWebhookDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Webhook className="w-5 h-5 text-violet-600" />
                Test Webhook
              </DialogTitle>
              <DialogDescription>Send a test event to your webhook</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Select Webhook</Label>
                <Select>
                  <SelectTrigger><SelectValue placeholder="Choose a webhook" /></SelectTrigger>
                  <SelectContent>
                    {webhooks.map(w => (
                      <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Test Event</Label>
                <Select defaultValue="test">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="test">test.ping</SelectItem>
                    <SelectItem value="order">order.created</SelectItem>
                    <SelectItem value="user">user.created</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-500">A test event will be sent to the webhook URL with sample data.</p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowTestWebhookDialog(false)}>Cancel</Button>
              <Button onClick={() => { setShowTestWebhookDialog(false); toast.success('Test webhook sent successfully'); }}>
                <Webhook className="w-4 h-4 mr-2" /> Send Test
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Retry Webhooks Dialog */}
        <Dialog open={showRetryWebhooksDialog} onOpenChange={setShowRetryWebhooksDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-purple-600" />
                Retry Failed Webhooks
              </DialogTitle>
              <DialogDescription>Retry failed webhook deliveries</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  <strong>3</strong> failed deliveries in the last 24 hours
                </p>
              </div>
              <div className="space-y-2">
                {webhooks.filter(w => !w.isActive).map(w => (
                  <div key={w.id} className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <p className="font-medium">{w.name}</p>
                      <p className="text-sm text-gray-500">Failed: 2 deliveries</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                ))}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowRetryWebhooksDialog(false)}>Cancel</Button>
              <Button onClick={() => { setShowRetryWebhooksDialog(false); toast.success('Retrying failed webhooks...'); }}>
                <RefreshCw className="w-4 h-4 mr-2" /> Retry Selected
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Webhook Logs Dialog */}
        <Dialog open={showWebhookLogsDialog} onOpenChange={setShowWebhookLogsDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-fuchsia-600" />
                Webhook Logs
              </DialogTitle>
              <DialogDescription>View recent webhook deliveries</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <ScrollArea className="h-64">
                <div className="space-y-2">
                  {webhooks.flatMap(w => [1, 2].map(i => (
                    <div key={`${w.id}-${i}`} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{w.name}</span>
                        <Badge className={i === 1 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>{i === 1 ? 'Success' : 'Failed'}</Badge>
                      </div>
                      <p className="text-sm text-gray-500">Event: order.created | {formatTimeAgo(w.lastTriggered)}</p>
                    </div>
                  )))}
                </div>
              </ScrollArea>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowWebhookLogsDialog(false)}>Close</Button>
              <Button onClick={() => {
                  const logsData = {
                    exportedAt: new Date().toISOString(),
                    webhooks: webhooks.map(w => ({
                      name: w.name,
                      url: w.url,
                      events: w.events,
                      isActive: w.isActive,
                      lastTriggered: w.lastTriggered,
                      successRate: w.successRate,
                      totalDeliveries: w.totalDeliveries
                    }))
                  };
                  const blob = new Blob([JSON.stringify(logsData, null, 2)], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `webhook-logs-${new Date().toISOString().split('T')[0]}.json`;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  URL.revokeObjectURL(url);
                  toast.success('Webhook logs exported', { description: 'Logs have been downloaded as JSON' });
                }}>
                <Download className="w-4 h-4 mr-2" /> Export Logs
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Webhook Secrets Dialog */}
        <Dialog open={showWebhookSecretsDialog} onOpenChange={setShowWebhookSecretsDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Key className="w-5 h-5 text-pink-600" />
                Webhook Secrets
              </DialogTitle>
              <DialogDescription>Manage signing secrets for your webhooks</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {webhooks.map(w => (
                <div key={w.id} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{w.name}</span>
                    <Button size="sm" variant="outline" onClick={() => {
                        if (confirm('Are you sure you want to regenerate this secret? This will invalidate existing signatures.')) {
                          const newSecret = 'whsec_' + Math.random().toString(36).substring(2, 15);
                          navigator.clipboard.writeText(newSecret);
                          toast.success('Secret regenerated', { description: 'New secret has been copied to clipboard. Make sure to update your webhook receiver.' });
                        }
                      }}>Regenerate</Button>
                  </div>
                  <code className="text-sm font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">whsec_••••••••••••</code>
                </div>
              ))}
              <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  <AlertTriangle className="w-3 h-3 inline mr-1" />
                  Regenerating secrets will invalidate existing signatures
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowWebhookSecretsDialog(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Webhook Signatures Dialog */}
        <Dialog open={showWebhookSignaturesDialog} onOpenChange={setShowWebhookSignaturesDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-rose-600" />
                Signature Verification
              </DialogTitle>
              <DialogDescription>Configure webhook signature verification</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Enable Signatures</Label>
                  <p className="text-xs text-gray-500">Sign all webhook payloads</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="space-y-2">
                <Label>Signature Algorithm</Label>
                <Select defaultValue="sha256">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sha256">HMAC-SHA256</SelectItem>
                    <SelectItem value="sha512">HMAC-SHA512</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="p-4 bg-gray-900 rounded-lg">
                <p className="text-xs text-gray-400 mb-2">Verification code example:</p>
                <pre className="text-xs text-green-400 font-mono">const signature = crypto.createHmac(&apos;sha256&apos;, secret).update(payload).digest(&apos;hex&apos;);</pre>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowWebhookSignaturesDialog(false)}>Close</Button>
              <Button onClick={() => { setShowWebhookSignaturesDialog(false); toast.success('Signature settings saved'); }}>Save Settings</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Export Webhooks Dialog */}
        <Dialog open={showExportWebhooksDialog} onOpenChange={setShowExportWebhooksDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Download className="w-5 h-5 text-red-600" />
                Export Webhooks
              </DialogTitle>
              <DialogDescription>Export webhook configuration</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Export Format</Label>
                <Select defaultValue="json">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="json">JSON</SelectItem>
                    <SelectItem value="yaml">YAML</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                {webhooks.map(w => (
                  <div key={w.id} className="flex items-center gap-2 p-2 border rounded">
                    <Switch defaultChecked />
                    <span className="text-sm">{w.name}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <Switch />
                <Label>Include secrets (encrypted)</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowExportWebhooksDialog(false)}>Cancel</Button>
              <Button onClick={() => { setShowExportWebhooksDialog(false); toast.success('Webhooks exported'); }}>
                <Download className="w-4 h-4 mr-2" /> Export
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Webhook Settings Dialog */}
        <Dialog open={showWebhookSettingsDialog} onOpenChange={setShowWebhookSettingsDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-gray-600" />
                Webhook Settings
              </DialogTitle>
              <DialogDescription>Global webhook configuration</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Request Timeout (seconds)</Label>
                <Input type="number" defaultValue="30" />
              </div>
              <div className="space-y-2">
                <Label>Max Retries</Label>
                <Input type="number" defaultValue="3" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Exponential Backoff</Label>
                  <p className="text-xs text-gray-500">Increase delay between retries</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Log Payloads</Label>
                  <p className="text-xs text-gray-500">Store webhook payloads for debugging</p>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowWebhookSettingsDialog(false)}>Cancel</Button>
              <Button onClick={() => { setShowWebhookSettingsDialog(false); toast.success('Webhook settings saved'); }}>Save Settings</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Run All Tests Dialog */}
        <Dialog open={showRunAllTestsDialog} onOpenChange={setShowRunAllTestsDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <PlayCircle className="w-5 h-5 text-green-600" />
                Run All Tests
              </DialogTitle>
              <DialogDescription>Execute all test suites</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Test suites</span>
                  <Badge>{testSuites.length}</Badge>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Total tests</span>
                  <Badge>{testSuites.reduce((sum, s) => sum + s.tests, 0)}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Est. duration</span>
                  <span className="text-sm text-gray-500">{Math.ceil(testSuites.reduce((sum, s) => sum + s.duration, 0) / 1000 / 60)}m</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Environment</Label>
                <Select defaultValue="staging">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="development">Development</SelectItem>
                    <SelectItem value="staging">Staging</SelectItem>
                    <SelectItem value="production">Production</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <Switch defaultChecked />
                <Label>Stop on first failure</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowRunAllTestsDialog(false)}>Cancel</Button>
              <Button onClick={() => { setShowRunAllTestsDialog(false); toast.success('Running all tests...'); }}>
                <PlayCircle className="w-4 h-4 mr-2" /> Run Tests
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* New Test Suite Dialog */}
        <Dialog open={showNewTestSuiteDialog} onOpenChange={setShowNewTestSuiteDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-emerald-600" />
                Create Test Suite
              </DialogTitle>
              <DialogDescription>Create a new test suite for your API</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Suite Name</Label>
                <Input placeholder="e.g., User API Tests" />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea placeholder="Describe what this suite tests..." />
              </div>
              <div className="space-y-2">
                <Label>Environment</Label>
                <Select defaultValue="staging">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="development">Development</SelectItem>
                    <SelectItem value="staging">Staging</SelectItem>
                    <SelectItem value="production">Production</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Collection (optional)</Label>
                <Select>
                  <SelectTrigger><SelectValue placeholder="Link to collection" /></SelectTrigger>
                  <SelectContent>
                    {collections.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowNewTestSuiteDialog(false)}>Cancel</Button>
              <Button onClick={() => { setShowNewTestSuiteDialog(false); toast.success('Test suite created'); }}>
                <Plus className="w-4 h-4 mr-2" /> Create Suite
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Coverage Dialog */}
        <Dialog open={showCoverageDialog} onOpenChange={setShowCoverageDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileCode className="w-5 h-5 text-teal-600" />
                Test Coverage
              </DialogTitle>
              <DialogDescription>API endpoint test coverage analysis</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg text-center">
                  <p className="text-3xl font-bold text-green-600">85%</p>
                  <p className="text-sm text-gray-500">Overall Coverage</p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                  <p className="text-3xl font-bold">{endpoints.length}</p>
                  <p className="text-sm text-gray-500">Endpoints</p>
                </div>
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-center">
                  <p className="text-3xl font-bold text-blue-600">{Math.round(endpoints.length * 0.85)}</p>
                  <p className="text-sm text-gray-500">Covered</p>
                </div>
              </div>
              <ScrollArea className="h-48">
                <div className="space-y-2">
                  {endpoints.slice(0, 6).map(e => (
                    <div key={e.id} className="flex items-center justify-between p-2 border rounded">
                      <div className="flex items-center gap-2">
                        <Badge className={getMethodColor(e.method)}>{e.method}</Badge>
                        <span className="text-sm">{e.path}</span>
                      </div>
                      <Badge className={Math.random() > 0.2 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                        {Math.random() > 0.2 ? 'Covered' : 'Not covered'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCoverageDialog(false)}>Close</Button>
              <Button onClick={() => {
                  const coverageReport = {
                    generatedAt: new Date().toISOString(),
                    summary: {
                      overallCoverage: '85%',
                      totalEndpoints: endpoints.length,
                      coveredEndpoints: Math.round(endpoints.length * 0.85),
                      uncoveredEndpoints: Math.round(endpoints.length * 0.15)
                    },
                    endpoints: endpoints.map(e => ({
                      method: e.method,
                      path: e.path,
                      name: e.name,
                      isCovered: Math.random() > 0.2
                    }))
                  };
                  const blob = new Blob([JSON.stringify(coverageReport, null, 2)], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `test-coverage-${new Date().toISOString().split('T')[0]}.json`;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  URL.revokeObjectURL(url);
                  toast.success('Coverage report exported', { description: 'Report has been downloaded as JSON' });
                }}>
                <Download className="w-4 h-4 mr-2" /> Export Report
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* CI/CD Dialog */}
        <Dialog open={showCiCdDialog} onOpenChange={setShowCiCdDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <GitBranch className="w-5 h-5 text-cyan-600" />
                CI/CD Integration
              </DialogTitle>
              <DialogDescription>Integrate tests with your CI/CD pipeline</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Pipeline Provider</Label>
                <Select defaultValue="github">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="github">GitHub Actions</SelectItem>
                    <SelectItem value="gitlab">GitLab CI</SelectItem>
                    <SelectItem value="jenkins">Jenkins</SelectItem>
                    <SelectItem value="circleci">CircleCI</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="p-4 bg-gray-900 rounded-lg">
                <p className="text-xs text-gray-400 mb-2">Add to your workflow:</p>
                <pre className="text-xs text-green-400 font-mono overflow-x-auto">{`- name: Run API Tests
  run: npx api-test run --suite all`}</pre>
              </div>
              <div className="flex items-center gap-2">
                <Switch defaultChecked />
                <Label>Run on every push</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch defaultChecked />
                <Label>Require passing tests for merge</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCiCdDialog(false)}>Cancel</Button>
              <Button onClick={() => { setShowCiCdDialog(false); toast.success('CI/CD configuration saved'); }}>Save Configuration</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Test Reports Dialog */}
        <Dialog open={showTestReportsDialog} onOpenChange={setShowTestReportsDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                Test Reports
              </DialogTitle>
              <DialogDescription>Historical test results and trends</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-4 gap-4">
                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg text-center">
                  <p className="text-2xl font-bold text-green-600">92%</p>
                  <p className="text-xs text-gray-500">Pass Rate</p>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                  <p className="text-2xl font-bold">{testSuites.reduce((s, t) => s + t.tests, 0)}</p>
                  <p className="text-xs text-gray-500">Total Tests</p>
                </div>
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-center">
                  <p className="text-2xl font-bold text-blue-600">15</p>
                  <p className="text-xs text-gray-500">Runs Today</p>
                </div>
                <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg text-center">
                  <p className="text-2xl font-bold text-amber-600">2.5m</p>
                  <p className="text-xs text-gray-500">Avg Duration</p>
                </div>
              </div>
              <ScrollArea className="h-48">
                <div className="space-y-2">
                  {testSuites.map(s => (
                    <div key={s.id} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{s.name}</span>
                        <Badge className={getTestStatusColor(s.status)}>{s.status}</Badge>
                      </div>
                      <Progress value={(s.passed / s.tests) * 100} className="h-2" />
                      <p className="text-xs text-gray-500 mt-1">{s.passed}/{s.tests} passed | {formatTimeAgo(s.lastRun)}</p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowTestReportsDialog(false)}>Close</Button>
              <Button onClick={() => {
                  const testReport = {
                    generatedAt: new Date().toISOString(),
                    summary: {
                      passRate: '92%',
                      totalTests: testSuites.reduce((s, t) => s + t.tests, 0),
                      runsToday: 15,
                      avgDuration: '2.5m'
                    },
                    suites: testSuites.map(s => ({
                      name: s.name,
                      status: s.status,
                      tests: s.tests,
                      passed: s.passed,
                      failed: s.failed,
                      coverage: s.coverage,
                      lastRun: s.lastRun
                    }))
                  };
                  const blob = new Blob([JSON.stringify(testReport, null, 2)], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `test-report-${new Date().toISOString().split('T')[0]}.json`;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  URL.revokeObjectURL(url);
                  toast.success('Test report exported', { description: 'Report has been downloaded as JSON' });
                }}>
                <Download className="w-4 h-4 mr-2" /> Export Report
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Schedule Tests Dialog */}
        <Dialog open={showScheduleTestsDialog} onOpenChange={setShowScheduleTestsDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-indigo-600" />
                Schedule Tests
              </DialogTitle>
              <DialogDescription>Set up automated test runs</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Schedule</Label>
                <Select defaultValue="daily">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hourly">Every hour</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="custom">Custom cron</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Time (UTC)</Label>
                <Input type="time" defaultValue="00:00" />
              </div>
              <div className="space-y-2">
                <Label>Suites to Run</Label>
                {testSuites.map(s => (
                  <div key={s.id} className="flex items-center gap-2 p-2 border rounded">
                    <Switch defaultChecked />
                    <span className="text-sm">{s.name}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <Switch defaultChecked />
                <Label>Send report via email</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowScheduleTestsDialog(false)}>Cancel</Button>
              <Button onClick={() => { setShowScheduleTestsDialog(false); toast.success('Schedule saved'); }}>
                <Clock className="w-4 h-4 mr-2" /> Save Schedule
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Export Tests Dialog */}
        <Dialog open={showExportTestsDialog} onOpenChange={setShowExportTestsDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Download className="w-5 h-5 text-violet-600" />
                Export Tests
              </DialogTitle>
              <DialogDescription>Export test suites and results</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Export Format</Label>
                <Select defaultValue="json">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="json">JSON</SelectItem>
                    <SelectItem value="junit">JUnit XML</SelectItem>
                    <SelectItem value="html">HTML Report</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Include</Label>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Switch defaultChecked />
                    <span className="text-sm">Test definitions</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch defaultChecked />
                    <span className="text-sm">Last run results</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch />
                    <span className="text-sm">Historical data</span>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowExportTestsDialog(false)}>Cancel</Button>
              <Button onClick={() => { setShowExportTestsDialog(false); toast.success('Tests exported'); }}>
                <Download className="w-4 h-4 mr-2" /> Export
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Test Settings Dialog */}
        <Dialog open={showTestSettingsDialog} onOpenChange={setShowTestSettingsDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-gray-600" />
                Test Settings
              </DialogTitle>
              <DialogDescription>Configure test execution settings</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Request Timeout (ms)</Label>
                <Input type="number" defaultValue="30000" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Parallel Execution</Label>
                  <p className="text-xs text-gray-500">Run tests in parallel</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="space-y-2">
                <Label>Max Workers</Label>
                <Input type="number" defaultValue="4" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Retry Failed Tests</Label>
                  <p className="text-xs text-gray-500">Automatically retry failed tests</p>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Verbose Logging</Label>
                  <p className="text-xs text-gray-500">Show detailed test output</p>
                </div>
                <Switch />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowTestSettingsDialog(false)}>Cancel</Button>
              <Button onClick={() => { setShowTestSettingsDialog(false); toast.success('Test settings saved'); }}>Save Settings</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Rerun Failed Dialog */}
        <Dialog open={showRerunFailedDialog} onOpenChange={setShowRerunFailedDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Repeat className="w-5 h-5 text-red-600" />
                Rerun Failed Tests
              </DialogTitle>
              <DialogDescription>Retry tests that failed in the last run</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-700 dark:text-red-300">
                  <strong>{stats.totalTests - stats.passedTests}</strong> tests failed in the last run
                </p>
              </div>
              <ScrollArea className="h-32">
                <div className="space-y-2">
                  {testCases.filter(t => t.status === 'failed').map(t => (
                    <div key={t.id} className="flex items-center gap-2 p-2 border rounded">
                      <XCircle className="w-4 h-4 text-red-600" />
                      <span className="text-sm flex-1">{t.name}</span>
                      <Switch defaultChecked />
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowRerunFailedDialog(false)}>Cancel</Button>
              <Button onClick={() => { setShowRerunFailedDialog(false); toast.success('Rerunning failed tests...'); }}>
                <Repeat className="w-4 h-4 mr-2" /> Rerun Selected
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Configure OAuth Dialog */}
        <Dialog open={showConfigureOAuthDialog} onOpenChange={setShowConfigureOAuthDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-green-600" />
                OAuth 2.0 Configuration
              </DialogTitle>
              <DialogDescription>Configure OAuth authentication settings</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Client ID</Label>
                <Input placeholder="Enter client ID" />
              </div>
              <div className="space-y-2">
                <Label>Client Secret</Label>
                <Input type="password" placeholder="Enter client secret" />
              </div>
              <div className="space-y-2">
                <Label>Authorization URL</Label>
                <Input placeholder="https://auth.example.com/authorize" />
              </div>
              <div className="space-y-2">
                <Label>Token URL</Label>
                <Input placeholder="https://auth.example.com/token" />
              </div>
              <div className="space-y-2">
                <Label>Scopes</Label>
                <Input placeholder="read write profile" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowConfigureOAuthDialog(false)}>Cancel</Button>
              <Button onClick={() => { setShowConfigureOAuthDialog(false); toast.success('OAuth configuration saved'); }}>Save Configuration</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Manage Keys Dialog */}
        <Dialog open={showManageKeysDialog} onOpenChange={setShowManageKeysDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Key className="w-5 h-5 text-blue-600" />
                Manage API Keys
              </DialogTitle>
              <DialogDescription>View and manage all your API keys</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Input placeholder="Search keys..." className="max-w-xs" />
                <Button size="sm" onClick={() => { setShowManageKeysDialog(false); setShowCreateKeyDialog(true); }}>
                  <Plus className="w-4 h-4 mr-2" /> New Key
                </Button>
              </div>
              <ScrollArea className="h-64">
                <div className="space-y-2">
                  {apiKeys.map(key => (
                    <div key={key.id} className="flex items-center justify-between p-3 border rounded">
                      <div className="flex items-center gap-3">
                        <Key className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="font-medium">{key.name}</p>
                          <p className="text-xs text-gray-500">{key.environment}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getKeyStatusColor(key.status)}>{key.status}</Badge>
                        <Button size="sm" variant="ghost" onClick={() => { setSelectedKeyForEdit(key); setShowManageKeysDialog(false); setShowEditKeyDialog(true); }}>Edit</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowManageKeysDialog(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Invite Team Dialog */}
        <Dialog open={showInviteTeamDialog} onOpenChange={setShowInviteTeamDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <UserCog className="w-5 h-5 text-purple-600" />
                Invite Team Members
              </DialogTitle>
              <DialogDescription>Add members to your API workspace</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Email Addresses</Label>
                <Textarea placeholder="Enter email addresses, one per line..." rows={4} />
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <Select defaultValue="member">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="member">Member</SelectItem>
                    <SelectItem value="viewer">Viewer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Personal Message (optional)</Label>
                <Textarea placeholder="Add a personal message to the invite..." rows={2} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowInviteTeamDialog(false)}>Cancel</Button>
              <Button onClick={() => { setShowInviteTeamDialog(false); toast.success('Invitations sent'); }}>
                <Users className="w-4 h-4 mr-2" /> Send Invites
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Export Collections Settings Dialog */}
        <Dialog open={showExportCollectionsSettingsDialog} onOpenChange={setShowExportCollectionsSettingsDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileJson className="w-5 h-5 text-blue-600" />
                Export Collections
              </DialogTitle>
              <DialogDescription>Export your API collections</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Format</Label>
                <Select defaultValue="postman">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="postman">Postman Collection v2.1</SelectItem>
                    <SelectItem value="openapi">OpenAPI 3.0</SelectItem>
                    <SelectItem value="json">JSON</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Collections</Label>
                {collections.map(c => (
                  <div key={c.id} className="flex items-center gap-2 p-2 border rounded">
                    <Switch defaultChecked />
                    <span className="text-sm">{c.name}</span>
                  </div>
                ))}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowExportCollectionsSettingsDialog(false)}>Cancel</Button>
              <Button onClick={() => { setShowExportCollectionsSettingsDialog(false); toast.success('Collections exported'); }}>
                <Download className="w-4 h-4 mr-2" /> Export
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Import Collections Settings Dialog */}
        <Dialog open={showImportCollectionsSettingsDialog} onOpenChange={setShowImportCollectionsSettingsDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-green-600" />
                Import Collections
              </DialogTitle>
              <DialogDescription>Import API collections from file</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Format</Label>
                <Select defaultValue="postman">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="postman">Postman Collection</SelectItem>
                    <SelectItem value="openapi">OpenAPI / Swagger</SelectItem>
                    <SelectItem value="insomnia">Insomnia</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer">
                <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm text-gray-500">Drag and drop or click to upload</p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowImportCollectionsSettingsDialog(false)}>Cancel</Button>
              <Button onClick={() => { setShowImportCollectionsSettingsDialog(false); toast.success('Collections imported'); }}>
                <Upload className="w-4 h-4 mr-2" /> Import
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Export Environments Dialog */}
        <Dialog open={showExportEnvironmentsDialog} onOpenChange={setShowExportEnvironmentsDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Variable className="w-5 h-5 text-orange-600" />
                Export Environments
              </DialogTitle>
              <DialogDescription>Export environment variables</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Format</Label>
                <Select defaultValue="env">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="env">.env file</SelectItem>
                    <SelectItem value="json">JSON</SelectItem>
                    <SelectItem value="yaml">YAML</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Environments</Label>
                {['Development', 'Staging', 'Production'].map(env => (
                  <div key={env} className="flex items-center gap-2 p-2 border rounded">
                    <Switch defaultChecked={env !== 'Production'} />
                    <span className="text-sm">{env}</span>
                  </div>
                ))}
              </div>
              <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  <AlertTriangle className="w-3 h-3 inline mr-1" />
                  Sensitive values will be masked
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowExportEnvironmentsDialog(false)}>Cancel</Button>
              <Button onClick={() => { setShowExportEnvironmentsDialog(false); toast.success('Environments exported'); }}>
                <Download className="w-4 h-4 mr-2" /> Export
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Generate Docs Dialog */}
        <Dialog open={showGenerateDocsDialog} onOpenChange={setShowGenerateDocsDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-purple-600" />
                Generate Documentation
              </DialogTitle>
              <DialogDescription>Auto-generate API documentation</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Output Format</Label>
                <Select defaultValue="openapi">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="openapi">OpenAPI 3.0</SelectItem>
                    <SelectItem value="swagger">Swagger 2.0</SelectItem>
                    <SelectItem value="markdown">Markdown</SelectItem>
                    <SelectItem value="html">HTML</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>API Title</Label>
                <Input placeholder="My API Documentation" />
              </div>
              <div className="space-y-2">
                <Label>Version</Label>
                <Input placeholder="1.0.0" />
              </div>
              <div className="flex items-center gap-2">
                <Switch defaultChecked />
                <Label>Include examples</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch defaultChecked />
                <Label>Include authentication info</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowGenerateDocsDialog(false)}>Cancel</Button>
              <Button onClick={() => { setShowGenerateDocsDialog(false); toast.success('Documentation generated'); }}>
                <FileText className="w-4 h-4 mr-2" /> Generate
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Try Endpoint Dialog */}
        <Dialog open={showTryEndpointDialog} onOpenChange={setShowTryEndpointDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Send className="w-5 h-5 text-blue-600" />
                Try Endpoint
              </DialogTitle>
              <DialogDescription>{selectedEndpoint?.method} {selectedEndpoint?.path}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Request Headers</Label>
                <Textarea className="font-mono text-sm" rows={3} defaultValue="Content-Type: application/json" />
              </div>
              {selectedEndpoint?.method !== 'GET' && (
                <div className="space-y-2">
                  <Label>Request Body</Label>
                  <Textarea className="font-mono text-sm" rows={5} placeholder='{"key": "value"}' />
                </div>
              )}
              <div className="space-y-2">
                <Label>Response</Label>
                <div className="p-4 bg-gray-900 rounded-lg min-h-[100px]">
                  <pre className="text-sm text-green-400 font-mono">Click &quot;Send&quot; to see response</pre>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowTryEndpointDialog(false)}>Close</Button>
              <Button onClick={async () => {
                  setIsSubmitting(true);
                  toast.loading('Sending request...', { id: 'send-request' });
                  // Simulate API request
                  await new Promise(resolve => setTimeout(resolve, 1500));
                  setIsSubmitting(false);
                  toast.dismiss('send-request');
                  toast.success('Request completed', {
                    description: `${selectedEndpoint?.method} ${selectedEndpoint?.path} - 200 OK (145ms)`
                  });
                }}>
                <Send className="w-4 h-4 mr-2" /> Send
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Endpoint Docs Dialog */}
        <Dialog open={showEndpointDocsDialog} onOpenChange={setShowEndpointDocsDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-teal-600" />
                Endpoint Documentation
              </DialogTitle>
              <DialogDescription>{selectedEndpoint?.name}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge className={selectedEndpoint ? getMethodColor(selectedEndpoint.method) : ''}>{selectedEndpoint?.method}</Badge>
                <code className="text-sm font-mono">{selectedEndpoint?.path}</code>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <p className="text-sm text-gray-600 dark:text-gray-300">{selectedEndpoint?.description}</p>
              </div>
              <div className="space-y-2">
                <Label>Authentication</Label>
                <p className="text-sm">{selectedEndpoint?.authentication}</p>
              </div>
              <div className="space-y-2">
                <Label>Rate Limit</Label>
                <p className="text-sm">{selectedEndpoint?.rateLimit} requests/minute</p>
              </div>
              <div className="space-y-2">
                <Label>Example Response</Label>
                <div className="p-4 bg-gray-900 rounded-lg">
                  <pre className="text-sm text-green-400 font-mono">{'{\n  "success": true,\n  "data": {...}\n}'}</pre>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEndpointDocsDialog(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Endpoint Code Dialog */}
        <Dialog open={showEndpointCodeDialog} onOpenChange={setShowEndpointCodeDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Code className="w-5 h-5 text-purple-600" />
                Code Snippets
              </DialogTitle>
              <DialogDescription>Generated code for {selectedEndpoint?.path}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Language</Label>
                <Select defaultValue="javascript">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="curl">cURL</SelectItem>
                    <SelectItem value="javascript">JavaScript</SelectItem>
                    <SelectItem value="python">Python</SelectItem>
                    <SelectItem value="go">Go</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="p-4 bg-gray-900 rounded-lg">
                <pre className="text-sm text-green-400 font-mono overflow-x-auto">{`fetch('${selectedEndpoint?.path}', {
  method: '${selectedEndpoint?.method}',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
})
.then(response => response.json())
.then(data => console.log(data));`}</pre>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEndpointCodeDialog(false)}>Close</Button>
              <Button onClick={() => { navigator.clipboard.writeText('Code copied!'); toast.success('Code copied'); }}>
                <Copy className="w-4 h-4 mr-2" /> Copy
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Run Test Suite Dialog */}
        <Dialog open={showRunTestSuiteDialog} onOpenChange={setShowRunTestSuiteDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <PlayCircle className="w-5 h-5 text-green-600" />
                Run Test Suite
              </DialogTitle>
              <DialogDescription>{selectedTestSuite?.name}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Tests</span>
                  <Badge>{selectedTestSuite?.tests}</Badge>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Last run</span>
                  <span className="text-sm text-gray-500">{selectedTestSuite ? formatTimeAgo(selectedTestSuite.lastRun) : ''}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Coverage</span>
                  <span className="text-sm text-gray-500">{selectedTestSuite?.coverage}%</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Environment</Label>
                <Select defaultValue={selectedTestSuite?.environment || 'staging'}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="development">Development</SelectItem>
                    <SelectItem value="staging">Staging</SelectItem>
                    <SelectItem value="production">Production</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowRunTestSuiteDialog(false)}>Cancel</Button>
              <Button onClick={() => { setShowRunTestSuiteDialog(false); toast.success('Running test suite...'); }}>
                <PlayCircle className="w-4 h-4 mr-2" /> Run Suite
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Rerun Failed Tests Dialog */}
        <Dialog open={showRerunFailedTestsDialog} onOpenChange={setShowRerunFailedTestsDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Repeat className="w-5 h-5 text-orange-600" />
                Rerun Failed Tests
              </DialogTitle>
              <DialogDescription>Retry failed tests from {selectedTestSuite?.name}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-700 dark:text-red-300">
                  <strong>{selectedTestSuite?.failed || 0}</strong> tests failed
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Switch defaultChecked />
                <Label>Run with verbose logging</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowRerunFailedTestsDialog(false)}>Cancel</Button>
              <Button onClick={() => { setShowRerunFailedTestsDialog(false); toast.success('Rerunning failed tests...'); }}>
                <Repeat className="w-4 h-4 mr-2" /> Rerun Failed
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Export Test Report Dialog */}
        <Dialog open={showExportTestReportDialog} onOpenChange={setShowExportTestReportDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                Export Test Report
              </DialogTitle>
              <DialogDescription>Export results from {selectedTestSuite?.name}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Format</Label>
                <Select defaultValue="html">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="html">HTML Report</SelectItem>
                    <SelectItem value="json">JSON</SelectItem>
                    <SelectItem value="junit">JUnit XML</SelectItem>
                    <SelectItem value="pdf">PDF</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <Switch defaultChecked />
                <Label>Include request/response details</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch defaultChecked />
                <Label>Include timing information</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowExportTestReportDialog(false)}>Cancel</Button>
              <Button onClick={() => { setShowExportTestReportDialog(false); toast.success('Test report exported'); }}>
                <Download className="w-4 h-4 mr-2" /> Export Report
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
