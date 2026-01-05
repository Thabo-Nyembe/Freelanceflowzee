'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'

// ============================================================================
// TYPES
// ============================================================================

export type DeploymentStatus = 'pending' | 'in_progress' | 'success' | 'failed' | 'cancelled' | 'rolled_back'
export type EnvironmentType = 'development' | 'staging' | 'production'

export interface Deployment {
  id: string
  name: string
  version: string
  releaseId?: string
  environment: EnvironmentType
  status: DeploymentStatus
  strategy: 'rolling' | 'blue_green' | 'canary' | 'recreate'
  branch: string
  commitHash: string
  commitMessage?: string
  triggeredBy: string
  triggeredByName: string
  triggerType: 'manual' | 'automatic' | 'scheduled' | 'webhook'
  startedAt?: string
  completedAt?: string
  duration?: number // seconds
  logs: DeploymentLog[]
  steps: DeploymentStep[]
  artifacts: DeploymentArtifact[]
  healthChecks: HealthCheck[]
  rollbackInfo?: RollbackInfo
  config: DeploymentConfig
  metrics: DeploymentMetrics
  createdAt: string
  updatedAt: string
}

export interface DeploymentLog {
  id: string
  timestamp: string
  level: 'info' | 'warn' | 'error' | 'debug'
  message: string
  step?: string
}

export interface DeploymentStep {
  id: string
  name: string
  status: 'pending' | 'running' | 'success' | 'failed' | 'skipped'
  startedAt?: string
  completedAt?: string
  duration?: number
  output?: string
  error?: string
}

export interface DeploymentArtifact {
  id: string
  name: string
  type: string
  url: string
  size: number
  checksum?: string
}

export interface HealthCheck {
  id: string
  name: string
  type: 'http' | 'tcp' | 'command'
  endpoint?: string
  status: 'pending' | 'healthy' | 'unhealthy' | 'degraded'
  responseTime?: number
  lastCheckedAt?: string
  message?: string
}

export interface RollbackInfo {
  fromVersion: string
  toVersion: string
  reason: string
  rolledBackAt: string
  rolledBackBy: string
}

export interface DeploymentConfig {
  replicas: number
  cpu: string
  memory: string
  timeout: number // seconds
  healthCheckInterval: number // seconds
  autoRollback: boolean
  notifyOnSuccess: boolean
  notifyOnFailure: boolean
  environmentVariables: Record<string, string>
}

export interface DeploymentMetrics {
  requestCount?: number
  errorRate?: number
  avgResponseTime?: number
  cpuUsage?: number
  memoryUsage?: number
}

export interface Environment {
  id: string
  name: string
  type: EnvironmentType
  url: string
  currentVersion: string
  lastDeployedAt?: string
  status: 'healthy' | 'degraded' | 'down' | 'maintenance'
  health: number // percentage
  services: EnvironmentService[]
}

export interface EnvironmentService {
  name: string
  version: string
  status: 'running' | 'stopped' | 'error'
  replicas: number
  healthyReplicas: number
}

export interface DeploymentStats {
  totalDeployments: number
  successfulDeployments: number
  failedDeployments: number
  avgDeployTime: number
  deploymentsToday: number
  successRate: number
  deploymentsByEnv: Record<EnvironmentType, number>
  deploymentTrend: { date: string; count: number; success: number }[]
}

// ============================================================================
// MOCK DATA
// ============================================================================

const mockDeployments: Deployment[] = [
  {
    id: 'dep-1',
    name: 'Production Deployment',
    version: '2.1.1',
    releaseId: 'rel-2',
    environment: 'production',
    status: 'success',
    strategy: 'rolling',
    branch: 'main',
    commitHash: 'a1b2c3d4',
    commitMessage: 'Release v2.1.1 - Security fixes',
    triggeredBy: 'user-1',
    triggeredByName: 'Alex Chen',
    triggerType: 'manual',
    startedAt: '2024-03-15T14:00:00Z',
    completedAt: '2024-03-15T14:05:00Z',
    duration: 300,
    logs: [
      { id: 'log-1', timestamp: '2024-03-15T14:00:00Z', level: 'info', message: 'Starting deployment...', step: 'init' },
      { id: 'log-2', timestamp: '2024-03-15T14:02:00Z', level: 'info', message: 'Building application...', step: 'build' },
      { id: 'log-3', timestamp: '2024-03-15T14:04:00Z', level: 'info', message: 'Deploying to servers...', step: 'deploy' },
      { id: 'log-4', timestamp: '2024-03-15T14:05:00Z', level: 'info', message: 'Deployment successful!', step: 'complete' }
    ],
    steps: [
      { id: 'step-1', name: 'Checkout', status: 'success', startedAt: '2024-03-15T14:00:00Z', completedAt: '2024-03-15T14:00:30Z', duration: 30 },
      { id: 'step-2', name: 'Build', status: 'success', startedAt: '2024-03-15T14:00:30Z', completedAt: '2024-03-15T14:02:30Z', duration: 120 },
      { id: 'step-3', name: 'Test', status: 'success', startedAt: '2024-03-15T14:02:30Z', completedAt: '2024-03-15T14:03:30Z', duration: 60 },
      { id: 'step-4', name: 'Deploy', status: 'success', startedAt: '2024-03-15T14:03:30Z', completedAt: '2024-03-15T14:05:00Z', duration: 90 }
    ],
    artifacts: [],
    healthChecks: [
      { id: 'hc-1', name: 'API Health', type: 'http', endpoint: '/health', status: 'healthy', responseTime: 45, lastCheckedAt: '2024-03-15T14:05:00Z' }
    ],
    config: { replicas: 3, cpu: '500m', memory: '512Mi', timeout: 600, healthCheckInterval: 30, autoRollback: true, notifyOnSuccess: true, notifyOnFailure: true, environmentVariables: {} },
    metrics: { requestCount: 15000, errorRate: 0.02, avgResponseTime: 120, cpuUsage: 45, memoryUsage: 62 },
    createdAt: '2024-03-15T14:00:00Z',
    updatedAt: '2024-03-15T14:05:00Z'
  },
  {
    id: 'dep-2',
    name: 'Staging Deployment',
    version: '2.2.0-beta.1',
    environment: 'staging',
    status: 'in_progress',
    strategy: 'blue_green',
    branch: 'develop',
    commitHash: 'e5f6g7h8',
    commitMessage: 'Feature: New dashboard widgets',
    triggeredBy: 'user-1',
    triggeredByName: 'Alex Chen',
    triggerType: 'automatic',
    startedAt: '2024-03-20T10:00:00Z',
    logs: [
      { id: 'log-5', timestamp: '2024-03-20T10:00:00Z', level: 'info', message: 'Starting deployment...' },
      { id: 'log-6', timestamp: '2024-03-20T10:02:00Z', level: 'info', message: 'Building application...' }
    ],
    steps: [
      { id: 'step-5', name: 'Checkout', status: 'success', duration: 25 },
      { id: 'step-6', name: 'Build', status: 'running', startedAt: '2024-03-20T10:00:25Z' },
      { id: 'step-7', name: 'Test', status: 'pending' },
      { id: 'step-8', name: 'Deploy', status: 'pending' }
    ],
    artifacts: [],
    healthChecks: [],
    config: { replicas: 2, cpu: '250m', memory: '256Mi', timeout: 600, healthCheckInterval: 30, autoRollback: true, notifyOnSuccess: false, notifyOnFailure: true, environmentVariables: {} },
    metrics: {},
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:02:00Z'
  }
]

const mockEnvironments: Environment[] = [
  { id: 'env-1', name: 'Production', type: 'production', url: 'https://app.freeflow.com', currentVersion: '2.1.1', lastDeployedAt: '2024-03-15T14:05:00Z', status: 'healthy', health: 99.9, services: [{ name: 'API', version: '2.1.1', status: 'running', replicas: 3, healthyReplicas: 3 }, { name: 'Web', version: '2.1.1', status: 'running', replicas: 2, healthyReplicas: 2 }] },
  { id: 'env-2', name: 'Staging', type: 'staging', url: 'https://staging.freeflow.com', currentVersion: '2.1.1', lastDeployedAt: '2024-03-18T11:00:00Z', status: 'healthy', health: 100, services: [{ name: 'API', version: '2.1.1', status: 'running', replicas: 2, healthyReplicas: 2 }] },
  { id: 'env-3', name: 'Development', type: 'development', url: 'https://dev.freeflow.com', currentVersion: '2.2.0-dev', lastDeployedAt: '2024-03-20T09:00:00Z', status: 'healthy', health: 100, services: [{ name: 'API', version: '2.2.0-dev', status: 'running', replicas: 1, healthyReplicas: 1 }] }
]

const mockStats: DeploymentStats = {
  totalDeployments: 245,
  successfulDeployments: 232,
  failedDeployments: 13,
  avgDeployTime: 280,
  deploymentsToday: 5,
  successRate: 94.7,
  deploymentsByEnv: { development: 120, staging: 85, production: 40 },
  deploymentTrend: [
    { date: '2024-03-14', count: 8, success: 8 },
    { date: '2024-03-15', count: 6, success: 5 },
    { date: '2024-03-16', count: 4, success: 4 },
    { date: '2024-03-17', count: 5, success: 5 },
    { date: '2024-03-18', count: 7, success: 6 },
    { date: '2024-03-19', count: 6, success: 6 },
    { date: '2024-03-20', count: 5, success: 4 }
  ]
}

// ============================================================================
// HOOK
// ============================================================================

interface UseDeploymentsOptions {
  
}

export function useDeployments(options: UseDeploymentsOptions = {}) {
  const {  } = options

  const [deployments, setDeployments] = useState<Deployment[]>([])
  const [environments, setEnvironments] = useState<Environment[]>([])
  const [currentDeployment, setCurrentDeployment] = useState<Deployment | null>(null)
  const [stats, setStats] = useState<DeploymentStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDeploying, setIsDeploying] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const fetchDeployments = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/deployments')
      const result = await response.json()
      if (result.success) {
        setDeployments(Array.isArray(result.deployments) ? result.deployments : [])
        setEnvironments(Array.isArray(result.environments) ? result.environments : [])
        setStats(result.stats || null)
        return result.deployments
      }
      setDeployments([])
      return []
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch deployments'))
      setDeployments([])
      return []
    } finally {
      setIsLoading(false)
    }
  }, [])

  const startDeployment = useCallback(async (deploymentId: string) => {
    setDeployments(prev => prev.map(d => d.id === deploymentId ? {
      ...d,
      status: 'in_progress' as const,
      startedAt: new Date().toISOString(),
      logs: [...d.logs, { id: `log-${Date.now()}`, timestamp: new Date().toISOString(), level: 'info' as const, message: 'Starting deployment...' }]
    } : d))
    return { success: true }
  }, [])

  const cancelDeployment = useCallback(async (deploymentId: string) => {
    setDeployments(prev => prev.map(d => d.id === deploymentId && d.status === 'in_progress' ? {
      ...d,
      status: 'cancelled' as const,
      completedAt: new Date().toISOString(),
      logs: [...d.logs, { id: `log-${Date.now()}`, timestamp: new Date().toISOString(), level: 'warn' as const, message: 'Deployment cancelled by user' }]
    } : d))
    return { success: true }
  }, [])

  const rollbackDeployment = useCallback(async (deploymentId: string, toVersion: string, reason: string) => {
    const deployment = deployments.find(d => d.id === deploymentId)
    if (!deployment) return { success: false, error: 'Deployment not found' }

    const rollbackInfo: RollbackInfo = {
      fromVersion: deployment.version,
      toVersion,
      reason,
      rolledBackAt: new Date().toISOString(),
      rolledBackBy: 'user-1'
    }

    setDeployments(prev => prev.map(d => d.id === deploymentId ? {
      ...d,
      status: 'rolled_back' as const,
      rollbackInfo,
      logs: [...d.logs, { id: `log-${Date.now()}`, timestamp: new Date().toISOString(), level: 'warn' as const, message: `Rolling back from ${deployment.version} to ${toVersion}: ${reason}` }]
    } : d))

    // Update environment version
    setEnvironments(prev => prev.map(e => e.type === deployment.environment ? {
      ...e,
      currentVersion: toVersion
    } : e))

    return { success: true }
  }, [deployments])

  const retryDeployment = useCallback(async (deploymentId: string) => {
    const original = deployments.find(d => d.id === deploymentId)
    if (!original) return { success: false, error: 'Deployment not found' }

    return createDeployment({
      ...original,
      id: undefined,
      status: undefined,
      logs: undefined,
      startedAt: undefined,
      completedAt: undefined
    })
  }, [deployments, createDeployment])

  const updateDeploymentConfig = useCallback(async (deploymentId: string, config: Partial<DeploymentConfig>) => {
    setDeployments(prev => prev.map(d => d.id === deploymentId ? {
      ...d,
      config: { ...d.config, ...config }
    } : d))
    return { success: true }
  }, [])

  const addLog = useCallback((deploymentId: string, log: Omit<DeploymentLog, 'id'>) => {
    const newLog: DeploymentLog = { id: `log-${Date.now()}`, ...log }
    setDeployments(prev => prev.map(d => d.id === deploymentId ? {
      ...d,
      logs: [...d.logs, newLog]
    } : d))
  }, [])

  const updateStepStatus = useCallback(async (deploymentId: string, stepId: string, status: DeploymentStep['status'], output?: string) => {
    setDeployments(prev => prev.map(d => d.id === deploymentId ? {
      ...d,
      steps: d.steps.map(s => s.id === stepId ? {
        ...s,
        status,
        output,
        startedAt: status === 'running' ? new Date().toISOString() : s.startedAt,
        completedAt: ['success', 'failed', 'skipped'].includes(status) ? new Date().toISOString() : s.completedAt
      } : s)
    } : d))
    return { success: true }
  }, [])

  const runHealthCheck = useCallback(async (deploymentId: string, healthCheckId: string) => {
    setDeployments(prev => prev.map(d => d.id === deploymentId ? {
      ...d,
      healthChecks: d.healthChecks.map(hc => hc.id === healthCheckId ? {
        ...hc,
        status: 'healthy' as const,
        responseTime: Math.floor(Math.random() * 100) + 20,
        lastCheckedAt: new Date().toISOString()
      } : hc)
    } : d))
    return { success: true }
  }, [])

  const setEnvironmentMaintenance = useCallback(async (envId: string, maintenance: boolean) => {
    setEnvironments(prev => prev.map(e => e.id === envId ? {
      ...e,
      status: maintenance ? 'maintenance' : 'healthy'
    } : e))
    return { success: true }
  }, [])

  const getDeploymentsByEnvironment = useCallback((environment: EnvironmentType) => {
    return deployments.filter(d => d.environment === environment)
  }, [deployments])

  const getStatusColor = useCallback((status: DeploymentStatus): string => {
    switch (status) {
      case 'pending': return '#6b7280'
      case 'in_progress': return '#f59e0b'
      case 'success': return '#22c55e'
      case 'failed': return '#ef4444'
      case 'cancelled': return '#9ca3af'
      case 'rolled_back': return '#f97316'
    }
  }, [])

  const refresh = useCallback(async () => {
    setIsLoading(true)
    await fetchDeployments()
  }, [fetchDeployments])

  useEffect(() => { refresh() }, [refresh])

  // Computed values
  const recentDeployments = useMemo(() => deployments.slice(0, 10), [deployments])
  const activeDeployments = useMemo(() => deployments.filter(d => d.status === 'in_progress'), [deployments])
  const failedDeployments = useMemo(() => deployments.filter(d => d.status === 'failed'), [deployments])
  const productionDeployments = useMemo(() => deployments.filter(d => d.environment === 'production'), [deployments])
  const productionEnv = useMemo(() => environments.find(e => e.type === 'production'), [environments])
  const stagingEnv = useMemo(() => environments.find(e => e.type === 'staging'), [environments])

  return {
    deployments, environments, currentDeployment, stats,
    recentDeployments, activeDeployments, failedDeployments, productionDeployments,
    productionEnv, stagingEnv,
    isLoading, isDeploying, error,
    refresh, createDeployment, startDeployment, cancelDeployment,
    rollbackDeployment, retryDeployment, updateDeploymentConfig,
    addLog, updateStepStatus, runHealthCheck, setEnvironmentMaintenance,
    getDeploymentsByEnvironment, getStatusColor, setCurrentDeployment
  }
}

export default useDeployments
