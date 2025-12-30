'use client'

import { useState, useMemo } from 'react'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  HardDrive,
  Database,
  Server,
  Cloud,
  CloudUpload,
  Download,
  Upload,
  Archive,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Clock,
  Calendar,
  CheckCircle2,
  XCircle,
  AlertCircle,
  AlertTriangle,
  Play,
  Pause,
  RotateCw,
  RefreshCw,
  Settings,
  Search,
  Filter,
  Plus,
  MoreHorizontal,
  Trash2,
  Eye,
  FileArchive,
  FolderSync,
  Activity,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Zap,
  Lock,
  Unlock,
  Copy,
  ExternalLink,
  History,
  Layers,
  Box,
  Cpu,
  Wifi,
  Globe,
  Timer,
  Target,
  CheckCheck,
  FileCheck,
  Scale,
  Gavel,
  Building2,
  Map,
  MapPin,
  ClipboardCheck,
  Fingerprint,
  Key,
  Users,
  UserCheck,
  Bell,
  BellRing,
  Send,
  MailCheck,
  FileWarning,
  FileClock,
  FolderLock,
  Package,
  Boxes,
  Network,
  GitBranch,
  Info,
  HelpCircle,
  Sliders,
  Terminal,
  Webhook
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

import {
  backupsAIInsights,
  backupsCollaborators,
  backupsPredictions,
  backupsActivities,
  backupsQuickActions,
} from '@/lib/mock-data/adapters'

import { CardDescription } from '@/components/ui/card'

// Types
type BackupStatus = 'completed' | 'running' | 'failed' | 'scheduled' | 'cancelled' | 'warning' | 'pending'
type BackupType = 'full' | 'incremental' | 'differential' | 'snapshot' | 'synthetic' | 'archive' | 'continuous'
type StorageType = 'local' | 'aws-s3' | 'azure-blob' | 'google-cloud' | 'wasabi' | 'nfs' | 'glacier'
type JobFrequency = 'hourly' | 'daily' | 'weekly' | 'monthly' | 'continuous' | 'custom'
type VaultStatus = 'active' | 'locked' | 'pending-deletion' | 'archived'
type ComplianceStatus = 'compliant' | 'non-compliant' | 'in-progress' | 'not-evaluated'

interface BackupJob {
  id: string
  name: string
  description: string
  type: BackupType
  status: BackupStatus
  source: string
  destination: string
  storageType: StorageType
  frequency: JobFrequency
  lastRun: string
  nextRun: string
  duration: number
  sizeBytes: number
  filesCount: number
  progress: number
  retentionDays: number
  encrypted: boolean
  compressed: boolean
  verified: boolean
  successRate: number
  restorePoints: number
  rpo: number
  rto: number
  vaultId: string
  crossRegionEnabled: boolean
  legalHold: boolean
}

interface StorageRepository {
  id: string
  name: string
  type: StorageType
  capacity: number
  used: number
  free: number
  status: 'online' | 'offline' | 'degraded' | 'syncing'
  backupCount: number
  lastBackup: string
  region?: string
  tier: 'hot' | 'cool' | 'archive'
  encryptionKeyId?: string
  replicationEnabled: boolean
}

interface RecoveryPoint {
  id: string
  jobId: string
  jobName: string
  timestamp: string
  type: BackupType
  size: number
  status: 'available' | 'expired' | 'locked' | 'partial' | 'corrupted'
  verified: boolean
  retentionUntil: string
  vaultId: string
  legalHold: boolean
  recoveryTested: boolean
  lastTestedDate?: string
}

interface BackupPolicy {
  id: string
  name: string
  description: string
  frequency: JobFrequency
  retentionDays: number
  fullBackupDay: string
  incrementalEnabled: boolean
  encryption: boolean
  compression: boolean
  verification: boolean
  jobCount: number
  isDefault: boolean
  coldStorageAfter: number
  deleteAfter: number
  crossAccountEnabled: boolean
  crossRegionEnabled: boolean
}

interface BackupVault {
  id: string
  name: string
  description: string
  status: VaultStatus
  region: string
  recoveryPointCount: number
  totalSizeBytes: number
  encryptionKey: string
  locked: boolean
  lockDate?: string
  minRetentionDays: number
  maxRetentionDays: number
  accessPolicy: string
  createdBy: string
  createdAt: string
  lastAccessedAt: string
  legalHoldCount: number
}

interface ComplianceReport {
  id: string
  name: string
  frameworkName: string
  status: ComplianceStatus
  lastEvaluated: string
  controlsPassed: number
  controlsFailed: number
  controlsTotal: number
  score: number
  resources: string[]
  findings: ComplianceFinding[]
}

interface ComplianceFinding {
  id: string
  severity: 'critical' | 'high' | 'medium' | 'low'
  title: string
  description: string
  resource: string
  recommendation: string
  status: 'open' | 'resolved' | 'suppressed'
}

interface AuditEvent {
  id: string
  timestamp: string
  eventType: string
  userName: string
  ipAddress: string
  resourceType: string
  resourceId: string
  action: string
  result: 'success' | 'failure'
  region: string
}

interface RecoveryTest {
  id: string
  name: string
  jobId: string
  jobName: string
  status: 'passed' | 'failed' | 'running' | 'scheduled'
  lastRun: string
  nextRun: string
  duration: number
  dataVerified: boolean
  applicationVerified: boolean
  notes: string
}

// Mock data
const mockJobs: BackupJob[] = [
  {
    id: '1',
    name: 'Production Database Backup',
    description: 'Full backup of PostgreSQL production database',
    type: 'full',
    status: 'completed',
    source: 'prod-db-cluster',
    destination: 'aws-s3-backup-vault',
    storageType: 'aws-s3',
    frequency: 'daily',
    lastRun: '2024-01-15T03:00:00Z',
    nextRun: '2024-01-16T03:00:00Z',
    duration: 1845,
    sizeBytes: 52428800000,
    filesCount: 1,
    progress: 100,
    retentionDays: 30,
    encrypted: true,
    compressed: true,
    verified: true,
    successRate: 99.8,
    restorePoints: 28,
    rpo: 24,
    rto: 30,
    vaultId: '1',
    crossRegionEnabled: true,
    legalHold: false
  },
  {
    id: '2',
    name: 'Application Servers Backup',
    description: 'Incremental backup of all application servers',
    type: 'incremental',
    status: 'running',
    source: 'app-servers-group',
    destination: 'azure-backup-vault',
    storageType: 'azure-blob',
    frequency: 'hourly',
    lastRun: '2024-01-15T14:00:00Z',
    nextRun: '2024-01-15T15:00:00Z',
    duration: 0,
    sizeBytes: 8589934592,
    filesCount: 45678,
    progress: 67,
    retentionDays: 7,
    encrypted: true,
    compressed: true,
    verified: false,
    successRate: 98.5,
    restorePoints: 168,
    rpo: 1,
    rto: 15,
    vaultId: '2',
    crossRegionEnabled: false,
    legalHold: false
  },
  {
    id: '3',
    name: 'User Data Snapshot',
    description: 'Snapshot backup of user uploads and documents',
    type: 'snapshot',
    status: 'scheduled',
    source: 'user-data-volume',
    destination: 'gcs-backup-bucket',
    storageType: 'google-cloud',
    frequency: 'weekly',
    lastRun: '2024-01-08T06:00:00Z',
    nextRun: '2024-01-15T06:00:00Z',
    duration: 3600,
    sizeBytes: 107374182400,
    filesCount: 1250000,
    progress: 0,
    retentionDays: 90,
    encrypted: true,
    compressed: false,
    verified: true,
    successRate: 100,
    restorePoints: 12,
    rpo: 168,
    rto: 60,
    vaultId: '1',
    crossRegionEnabled: true,
    legalHold: true
  },
  {
    id: '4',
    name: 'Configuration Backup',
    description: 'Backup of all system configurations and secrets',
    type: 'differential',
    status: 'failed',
    source: 'config-server',
    destination: 'local-nas-backup',
    storageType: 'local',
    frequency: 'daily',
    lastRun: '2024-01-15T02:00:00Z',
    nextRun: '2024-01-16T02:00:00Z',
    duration: 120,
    sizeBytes: 1073741824,
    filesCount: 5678,
    progress: 45,
    retentionDays: 14,
    encrypted: true,
    compressed: true,
    verified: false,
    successRate: 92.3,
    restorePoints: 10,
    rpo: 24,
    rto: 10,
    vaultId: '3',
    crossRegionEnabled: false,
    legalHold: false
  },
  {
    id: '5',
    name: 'Email Server Backup',
    description: 'Full backup of Exchange email server',
    type: 'full',
    status: 'warning',
    source: 'exchange-server',
    destination: 'wasabi-backup-bucket',
    storageType: 'wasabi',
    frequency: 'daily',
    lastRun: '2024-01-15T04:00:00Z',
    nextRun: '2024-01-16T04:00:00Z',
    duration: 7200,
    sizeBytes: 214748364800,
    filesCount: 1,
    progress: 100,
    retentionDays: 60,
    encrypted: true,
    compressed: true,
    verified: true,
    successRate: 97.5,
    restorePoints: 55,
    rpo: 24,
    rto: 120,
    vaultId: '2',
    crossRegionEnabled: true,
    legalHold: false
  },
  {
    id: '6',
    name: 'Continuous Database Replication',
    description: 'Continuous backup with point-in-time recovery',
    type: 'continuous',
    status: 'running',
    source: 'primary-mysql',
    destination: 'glacier-vault',
    storageType: 'glacier',
    frequency: 'continuous',
    lastRun: '2024-01-15T14:55:00Z',
    nextRun: 'Continuous',
    duration: 0,
    sizeBytes: 32212254720,
    filesCount: 1,
    progress: 100,
    retentionDays: 365,
    encrypted: true,
    compressed: true,
    verified: true,
    successRate: 99.99,
    restorePoints: 8760,
    rpo: 0.0167,
    rto: 5,
    vaultId: '1',
    crossRegionEnabled: true,
    legalHold: true
  }
]

const mockRepositories: StorageRepository[] = [
  { id: '1', name: 'AWS S3 Backup Vault', type: 'aws-s3', capacity: 1099511627776, used: 549755813888, free: 549755813888, status: 'online', backupCount: 156, lastBackup: '5 min ago', region: 'us-east-1', tier: 'hot', encryptionKeyId: 'aws/backup', replicationEnabled: true },
  { id: '2', name: 'Azure Blob Storage', type: 'azure-blob', capacity: 549755813888, used: 274877906944, free: 274877906944, status: 'online', backupCount: 89, lastBackup: '2 min ago', region: 'eastus', tier: 'hot', encryptionKeyId: 'azure-key-vault', replicationEnabled: true },
  { id: '3', name: 'Google Cloud Storage', type: 'google-cloud', capacity: 274877906944, used: 137438953472, free: 137438953472, status: 'syncing', backupCount: 45, lastBackup: '1 hour ago', region: 'us-central1', tier: 'cool', replicationEnabled: false },
  { id: '4', name: 'Local NAS Storage', type: 'local', capacity: 8796093022208, used: 4398046511104, free: 4398046511104, status: 'online', backupCount: 234, lastBackup: '30 min ago', tier: 'hot', replicationEnabled: false },
  { id: '5', name: 'AWS Glacier Deep Archive', type: 'glacier', capacity: 10995116277760, used: 5497558138880, free: 5497558138880, status: 'online', backupCount: 450, lastBackup: '1 day ago', region: 'us-east-1', tier: 'archive', encryptionKeyId: 'aws/backup', replicationEnabled: true },
  { id: '6', name: 'Wasabi Cold Storage', type: 'wasabi', capacity: 2199023255552, used: 1649267441664, free: 549755813888, status: 'online', backupCount: 78, lastBackup: '2 hours ago', region: 'us-east-1', tier: 'archive', replicationEnabled: false }
]

const mockRecoveryPoints: RecoveryPoint[] = [
  { id: '1', jobId: '1', jobName: 'Production Database Backup', timestamp: '2024-01-15T03:00:00Z', type: 'full', size: 52428800000, status: 'available', verified: true, retentionUntil: '2024-02-14', vaultId: '1', legalHold: false, recoveryTested: true, lastTestedDate: '2024-01-10' },
  { id: '2', jobId: '2', jobName: 'Application Servers Backup', timestamp: '2024-01-15T14:00:00Z', type: 'incremental', size: 2147483648, status: 'available', verified: true, retentionUntil: '2024-01-22', vaultId: '2', legalHold: false, recoveryTested: false },
  { id: '3', jobId: '1', jobName: 'Production Database Backup', timestamp: '2024-01-14T03:00:00Z', type: 'full', size: 51539607552, status: 'available', verified: true, retentionUntil: '2024-02-13', vaultId: '1', legalHold: false, recoveryTested: true, lastTestedDate: '2024-01-12' },
  { id: '4', jobId: '3', jobName: 'User Data Snapshot', timestamp: '2024-01-08T06:00:00Z', type: 'snapshot', size: 107374182400, status: 'locked', verified: true, retentionUntil: '2024-04-08', vaultId: '1', legalHold: true, recoveryTested: true, lastTestedDate: '2024-01-08' },
  { id: '5', jobId: '5', jobName: 'Email Server Backup', timestamp: '2024-01-15T04:00:00Z', type: 'full', size: 214748364800, status: 'available', verified: false, retentionUntil: '2024-03-15', vaultId: '2', legalHold: false, recoveryTested: false },
  { id: '6', jobId: '6', jobName: 'Continuous Database Replication', timestamp: '2024-01-15T14:50:00Z', type: 'continuous', size: 1073741824, status: 'available', verified: true, retentionUntil: '2025-01-15', vaultId: '1', legalHold: true, recoveryTested: true, lastTestedDate: '2024-01-14' }
]

const mockPolicies: BackupPolicy[] = [
  { id: '1', name: 'Enterprise Standard', description: 'Daily full backup with 30-day retention', frequency: 'daily', retentionDays: 30, fullBackupDay: 'Sunday', incrementalEnabled: true, encryption: true, compression: true, verification: true, jobCount: 12, isDefault: true, coldStorageAfter: 14, deleteAfter: 30, crossAccountEnabled: true, crossRegionEnabled: true },
  { id: '2', name: 'High Frequency', description: 'Hourly incremental for critical systems', frequency: 'hourly', retentionDays: 7, fullBackupDay: 'Saturday', incrementalEnabled: true, encryption: true, compression: true, verification: false, jobCount: 5, isDefault: false, coldStorageAfter: 3, deleteAfter: 7, crossAccountEnabled: false, crossRegionEnabled: false },
  { id: '3', name: 'Long-Term Archive', description: 'Weekly full backup with 1-year retention', frequency: 'weekly', retentionDays: 365, fullBackupDay: 'Sunday', incrementalEnabled: false, encryption: true, compression: true, verification: true, jobCount: 8, isDefault: false, coldStorageAfter: 30, deleteAfter: 365, crossAccountEnabled: true, crossRegionEnabled: true },
  { id: '4', name: 'Compliance Retention', description: '7-year retention for regulatory compliance', frequency: 'monthly', retentionDays: 2555, fullBackupDay: 'First Sunday', incrementalEnabled: false, encryption: true, compression: true, verification: true, jobCount: 3, isDefault: false, coldStorageAfter: 90, deleteAfter: 2555, crossAccountEnabled: true, crossRegionEnabled: true }
]

const mockVaults: BackupVault[] = [
  { id: '1', name: 'Primary Production Vault', description: 'Main backup vault for production workloads', status: 'active', region: 'us-east-1', recoveryPointCount: 450, totalSizeBytes: 549755813888, encryptionKey: 'aws/backup', locked: false, minRetentionDays: 7, maxRetentionDays: 365, accessPolicy: 'backup-admin-policy', createdBy: 'admin@company.com', createdAt: '2023-01-15', lastAccessedAt: '2 min ago', legalHoldCount: 2 },
  { id: '2', name: 'DR Vault - West Region', description: 'Disaster recovery vault in us-west-2', status: 'active', region: 'us-west-2', recoveryPointCount: 320, totalSizeBytes: 274877906944, encryptionKey: 'aws/backup', locked: false, minRetentionDays: 7, maxRetentionDays: 365, accessPolicy: 'dr-admin-policy', createdBy: 'admin@company.com', createdAt: '2023-03-01', lastAccessedAt: '1 hour ago', legalHoldCount: 0 },
  { id: '3', name: 'Compliance Archive Vault', description: 'Locked vault for regulatory compliance', status: 'locked', region: 'us-east-1', recoveryPointCount: 156, totalSizeBytes: 1099511627776, encryptionKey: 'compliance-key', locked: true, lockDate: '2023-06-01', minRetentionDays: 2555, maxRetentionDays: 2555, accessPolicy: 'compliance-readonly', createdBy: 'compliance@company.com', createdAt: '2023-06-01', lastAccessedAt: '1 day ago', legalHoldCount: 8 },
  { id: '4', name: 'Development Vault', description: 'Non-production development backups', status: 'active', region: 'us-east-1', recoveryPointCount: 89, totalSizeBytes: 68719476736, encryptionKey: 'dev-key', locked: false, minRetentionDays: 1, maxRetentionDays: 30, accessPolicy: 'dev-team-policy', createdBy: 'devops@company.com', createdAt: '2023-09-01', lastAccessedAt: '30 min ago', legalHoldCount: 0 }
]

const mockComplianceReports: ComplianceReport[] = [
  { id: '1', name: 'SOC 2 Type II Compliance', frameworkName: 'SOC 2', status: 'compliant', lastEvaluated: '2024-01-15T08:00:00Z', controlsPassed: 47, controlsFailed: 0, controlsTotal: 47, score: 100, resources: ['Production Database', 'Email Server', 'User Data'], findings: [] },
  { id: '2', name: 'HIPAA Backup Requirements', frameworkName: 'HIPAA', status: 'compliant', lastEvaluated: '2024-01-14T10:00:00Z', controlsPassed: 23, controlsFailed: 0, controlsTotal: 23, score: 100, resources: ['Patient Records DB', 'Medical Images'], findings: [] },
  { id: '3', name: 'PCI DSS Data Retention', frameworkName: 'PCI DSS', status: 'non-compliant', lastEvaluated: '2024-01-15T06:00:00Z', controlsPassed: 18, controlsFailed: 2, controlsTotal: 20, score: 90, resources: ['Payment Gateway', 'Transaction Logs'], findings: [{ id: 'f1', severity: 'high', title: 'Insufficient encryption key rotation', description: 'Encryption keys have not been rotated in 180 days', resource: 'Payment Gateway', recommendation: 'Rotate encryption keys every 90 days', status: 'open' }, { id: 'f2', severity: 'medium', title: 'Missing backup verification', description: 'Quarterly backup verification not performed', resource: 'Transaction Logs', recommendation: 'Enable automatic backup verification', status: 'open' }] },
  { id: '4', name: 'GDPR Data Protection', frameworkName: 'GDPR', status: 'in-progress', lastEvaluated: '2024-01-13T12:00:00Z', controlsPassed: 31, controlsFailed: 1, controlsTotal: 35, score: 88, resources: ['Customer Data', 'Marketing DB'], findings: [{ id: 'f3', severity: 'medium', title: 'Cross-border data transfer review needed', description: 'Data replication to non-EU regions needs assessment', resource: 'Customer Data', recommendation: 'Complete data transfer impact assessment', status: 'open' }] }
]

const mockAuditEvents: AuditEvent[] = [
  { id: '1', timestamp: '2024-01-15T14:55:00Z', eventType: 'BackupJobStarted', userName: 'backup-service', ipAddress: '10.0.1.50', resourceType: 'BackupJob', resourceId: 'job-001', action: 'StartBackupJob', result: 'success', region: 'us-east-1' },
  { id: '2', timestamp: '2024-01-15T14:50:00Z', eventType: 'RecoveryPointCreated', userName: 'backup-service', ipAddress: '10.0.1.50', resourceType: 'RecoveryPoint', resourceId: 'rp-456', action: 'CreateRecoveryPoint', result: 'success', region: 'us-east-1' },
  { id: '3', timestamp: '2024-01-15T14:30:00Z', eventType: 'VaultAccessPolicyUpdated', userName: 'admin@company.com', ipAddress: '203.0.113.50', resourceType: 'BackupVault', resourceId: 'vault-001', action: 'UpdateAccessPolicy', result: 'success', region: 'us-east-1' },
  { id: '4', timestamp: '2024-01-15T14:00:00Z', eventType: 'RestoreInitiated', userName: 'devops@company.com', ipAddress: '198.51.100.25', resourceType: 'RecoveryPoint', resourceId: 'rp-123', action: 'StartRestore', result: 'success', region: 'us-west-2' },
  { id: '5', timestamp: '2024-01-15T13:45:00Z', eventType: 'LegalHoldApplied', userName: 'legal@company.com', ipAddress: '192.0.2.100', resourceType: 'RecoveryPoint', resourceId: 'rp-789', action: 'ApplyLegalHold', result: 'success', region: 'us-east-1' },
  { id: '6', timestamp: '2024-01-15T12:00:00Z', eventType: 'BackupJobFailed', userName: 'backup-service', ipAddress: '10.0.1.50', resourceType: 'BackupJob', resourceId: 'job-004', action: 'FailBackupJob', result: 'failure', region: 'us-east-1' }
]

const mockRecoveryTests: RecoveryTest[] = [
  { id: '1', name: 'Q1 DR Test - Production DB', jobId: '1', jobName: 'Production Database Backup', status: 'passed', lastRun: '2024-01-10T10:00:00Z', nextRun: '2024-04-10T10:00:00Z', duration: 1800, dataVerified: true, applicationVerified: true, notes: 'Full recovery completed in 30 minutes. All data validated.' },
  { id: '2', name: 'Monthly Restore Test - Email', jobId: '5', jobName: 'Email Server Backup', status: 'passed', lastRun: '2024-01-05T08:00:00Z', nextRun: '2024-02-05T08:00:00Z', duration: 3600, dataVerified: true, applicationVerified: true, notes: 'Email server restored and validated. All mailboxes intact.' },
  { id: '3', name: 'Weekly App Server Test', jobId: '2', jobName: 'Application Servers Backup', status: 'scheduled', lastRun: '2024-01-08T06:00:00Z', nextRun: '2024-01-15T18:00:00Z', duration: 0, dataVerified: false, applicationVerified: false, notes: 'Scheduled for maintenance window.' },
  { id: '4', name: 'Annual Compliance DR Drill', jobId: '6', jobName: 'Continuous Database Replication', status: 'passed', lastRun: '2024-01-01T00:00:00Z', nextRun: '2025-01-01T00:00:00Z', duration: 7200, dataVerified: true, applicationVerified: true, notes: 'Annual disaster recovery drill completed successfully. Documented for compliance audit.' }
]

// Competitive Upgrade Mock Data - Veeam/Commvault-level Backup Intelligence
const mockBackupsAIInsights = [
  { id: '1', type: 'success' as const, title: 'Recovery Ready', description: 'All critical systems have verified restore points!', priority: 'low' as const, timestamp: new Date().toISOString(), category: 'Recovery' },
  { id: '2', type: 'warning' as const, title: 'Storage Alert', description: 'Backup vault at 85% capacity - consider archival policy.', priority: 'high' as const, timestamp: new Date().toISOString(), category: 'Storage' },
  { id: '3', type: 'info' as const, title: 'AI Optimization', description: 'Deduplication can save 40% storage on incremental backups.', priority: 'medium' as const, timestamp: new Date().toISOString(), category: 'AI Insights' },
]

const mockBackupsCollaborators = [
  { id: '1', name: 'Backup Admin', avatar: '/avatars/backup.jpg', status: 'online' as const, role: 'Admin' },
  { id: '2', name: 'DR Specialist', avatar: '/avatars/dr.jpg', status: 'online' as const, role: 'Specialist' },
  { id: '3', name: 'Storage Engineer', avatar: '/avatars/storage.jpg', status: 'away' as const, role: 'Engineer' },
]

const mockBackupsPredictions = [
  { id: '1', title: 'Storage Forecast', prediction: 'Current growth rate will require additional storage in 45 days', confidence: 89, trend: 'up' as const, impact: 'high' as const },
  { id: '2', title: 'RTO Achievement', prediction: 'Recovery time objective will improve by 30% with new policy', confidence: 84, trend: 'up' as const, impact: 'medium' as const },
]

const mockBackupsActivities = [
  { id: '1', user: 'Backup Admin', action: 'Completed', target: 'full database backup', timestamp: new Date().toISOString(), type: 'success' as const },
  { id: '2', user: 'DR Specialist', action: 'Tested', target: 'disaster recovery failover', timestamp: new Date(Date.now() - 3600000).toISOString(), type: 'info' as const },
  { id: '3', user: 'Storage Engineer', action: 'Archived', target: '30-day retention backups', timestamp: new Date(Date.now() - 7200000).toISOString(), type: 'success' as const },
]

const mockBackupsQuickActions = [
  { id: '1', label: 'New Backup', icon: 'plus', action: () => console.log('New backup'), variant: 'default' as const },
  { id: '2', label: 'Restore', icon: 'refresh-cw', action: () => console.log('Restore'), variant: 'default' as const },
  { id: '3', label: 'Verify', icon: 'check', action: () => console.log('Verify'), variant: 'outline' as const },
]

export default function BackupsClient() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<BackupStatus | 'all'>('all')
  const [selectedJob, setSelectedJob] = useState<BackupJob | null>(null)
  const [selectedVault, setSelectedVault] = useState<BackupVault | null>(null)
  const [selectedCompliance, setSelectedCompliance] = useState<ComplianceReport | null>(null)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showLegalHoldDialog, setShowLegalHoldDialog] = useState(false)
  const [settingsTab, setSettingsTab] = useState('general')

  // Filter jobs
  const filteredJobs = useMemo(() => {
    return mockJobs.filter(job => {
      const matchesSearch = job.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           job.description.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = selectedStatus === 'all' || job.status === selectedStatus
      return matchesSearch && matchesStatus
    })
  }, [searchQuery, selectedStatus])

  // Compute stats
  const stats = useMemo(() => {
    const total = mockJobs.length
    const completed = mockJobs.filter(j => j.status === 'completed').length
    const running = mockJobs.filter(j => j.status === 'running').length
    const failed = mockJobs.filter(j => j.status === 'failed').length
    const totalSize = mockJobs.reduce((sum, j) => sum + j.sizeBytes, 0)
    const avgSuccess = mockJobs.reduce((sum, j) => sum + j.successRate, 0) / total
    const totalRestorePoints = mockJobs.reduce((sum, j) => sum + j.restorePoints, 0)
    const vaultCount = mockVaults.length
    const legalHoldCount = mockRecoveryPoints.filter(rp => rp.legalHold).length
    return { total, completed, running, failed, totalSize, avgSuccess, totalRestorePoints, vaultCount, legalHoldCount }
  }, [])

  const statsCards = [
    { label: 'Total Jobs', value: stats.total.toString(), change: '+3', icon: Database, color: 'from-blue-500 to-blue-600' },
    { label: 'Completed', value: stats.completed.toString(), change: '+2', icon: CheckCircle2, color: 'from-green-500 to-green-600' },
    { label: 'Running', value: stats.running.toString(), change: '', icon: Activity, color: 'from-amber-500 to-amber-600' },
    { label: 'Failed', value: stats.failed.toString(), change: '-1', icon: XCircle, color: 'from-red-500 to-red-600' },
    { label: 'Total Storage', value: formatSize(stats.totalSize), change: '+15%', icon: HardDrive, color: 'from-purple-500 to-purple-600' },
    { label: 'Restore Points', value: stats.totalRestorePoints.toString(), change: '+28', icon: History, color: 'from-indigo-500 to-indigo-600' },
    { label: 'Backup Vaults', value: stats.vaultCount.toString(), change: '+1', icon: FolderLock, color: 'from-cyan-500 to-cyan-600' },
    { label: 'Legal Holds', value: stats.legalHoldCount.toString(), change: '', icon: Gavel, color: 'from-rose-500 to-rose-600' }
  ]

  function formatSize(bytes: number): string {
    if (bytes >= 1099511627776) return `${(bytes / 1099511627776).toFixed(1)} TB`
    if (bytes >= 1073741824) return `${(bytes / 1073741824).toFixed(1)} GB`
    if (bytes >= 1048576) return `${(bytes / 1048576).toFixed(1)} MB`
    return `${(bytes / 1024).toFixed(1)} KB`
  }

  function formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    if (hours > 0) return `${hours}h ${minutes}m`
    return `${minutes}m ${seconds % 60}s`
  }

  function formatTime(dateString: string): string {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    if (diffMins < 60) return `${diffMins}m ago`
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours}h ago`
    return `${Math.floor(diffHours / 24)}d ago`
  }

  const getStatusColor = (status: BackupStatus): string => {
    const colors: Record<BackupStatus, string> = {
      'completed': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      'running': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      'failed': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      'scheduled': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
      'cancelled': 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
      'warning': 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300',
      'pending': 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300'
    }
    return colors[status]
  }

  const getTypeColor = (type: BackupType): string => {
    const colors: Record<BackupType, string> = {
      'full': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      'incremental': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      'differential': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
      'snapshot': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
      'synthetic': 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300',
      'archive': 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
      'continuous': 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300'
    }
    return colors[type]
  }

  const getComplianceColor = (status: ComplianceStatus): string => {
    const colors: Record<ComplianceStatus, string> = {
      'compliant': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      'non-compliant': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      'in-progress': 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300',
      'not-evaluated': 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
    }
    return colors[status]
  }

  const getSeverityColor = (severity: string): string => {
    const colors: Record<string, string> = {
      'critical': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      'high': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
      'medium': 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300',
      'low': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
    }
    return colors[severity] || 'bg-gray-100 text-gray-800'
  }

  const getStorageIcon = (type: StorageType) => {
    const icons: Record<StorageType, any> = {
      'local': HardDrive,
      'aws-s3': Cloud,
      'azure-blob': Cloud,
      'google-cloud': Cloud,
      'wasabi': Archive,
      'nfs': Server,
      'glacier': Archive
    }
    return icons[type] || Database
  }

  const handleCreateBackup = () => {
    toast.info('Creating Backup', { description: 'Backup process started...' })
  }
  const handleRestoreBackup = (backupName: string) => {
    toast.info('Restoring', { description: `Restoring from "${backupName}"...` })
  }
  const handleDeleteBackup = (backupName: string) => {
    toast.info('Backup Deleted', { description: `"${backupName}" has been removed` })
  }
  const handleDownloadBackup = (backupName: string) => {
    toast.success('Downloading', { description: `Downloading "${backupName}"...` })
  }
  const handleScheduleBackup = () => {
    toast.success('Backup Scheduled', { description: 'Automatic backup configured' })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:bg-none dark:bg-gray-900 p-6">
      <div className="max-w-[1600px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
              <Database className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">AWS Backup Manager</h1>
              <p className="text-gray-500 dark:text-gray-400">Enterprise data protection and disaster recovery</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search backups..."
                className="w-72 pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
            <Button
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              onClick={() => setShowCreateDialog(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              New Backup Job
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          {statsCards.map((stat, i) => (
            <Card key={i} className="border-gray-200 dark:border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                    <stat.icon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</p>
                  </div>
                </div>
                {stat.change && (
                  <p className={`text-xs mt-2 ${stat.change.startsWith('+') ? 'text-green-600' : stat.change.startsWith('-') ? 'text-red-600' : 'text-gray-500'}`}>
                    {stat.change} this week
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-1">
            <TabsTrigger value="dashboard" className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700">
              <BarChart3 className="h-4 w-4 mr-2" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="jobs" className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700">
              <Database className="h-4 w-4 mr-2" />
              Backup Jobs
            </TabsTrigger>
            <TabsTrigger value="recovery" className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700">
              <History className="h-4 w-4 mr-2" />
              Recovery Points
            </TabsTrigger>
            <TabsTrigger value="vaults" className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700">
              <FolderLock className="h-4 w-4 mr-2" />
              Vaults
            </TabsTrigger>
            <TabsTrigger value="compliance" className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700">
              <ShieldCheck className="h-4 w-4 mr-2" />
              Compliance
            </TabsTrigger>
            <TabsTrigger value="storage" className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700">
              <HardDrive className="h-4 w-4 mr-2" />
              Storage
            </TabsTrigger>
            <TabsTrigger value="policies" className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700">
              <Shield className="h-4 w-4 mr-2" />
              Policies
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="mt-6">
            {/* Dashboard Overview Banner */}
            <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl p-6 text-white mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Backup Dashboard</h2>
                  <p className="text-blue-100">AWS Backup-level enterprise backup management</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{stats.completed}</p>
                    <p className="text-blue-200 text-sm">Successful</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{stats.running}</p>
                    <p className="text-blue-200 text-sm">Running</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{Math.round(stats.successRate)}%</p>
                    <p className="text-blue-200 text-sm">Success Rate</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Dashboard Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
              {[
                { icon: Plus, label: 'New Job', color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' },
                { icon: Play, label: 'Run Now', color: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' },
                { icon: RotateCw, label: 'Restore', color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400' },
                { icon: Archive, label: 'Vaults', color: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' },
                { icon: Shield, label: 'Compliance', color: 'bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400' },
                { icon: HardDrive, label: 'Storage', color: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400' },
                { icon: BarChart3, label: 'Reports', color: 'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400' },
                { icon: Settings, label: 'Settings', color: 'bg-slate-100 text-slate-600 dark:bg-slate-900/30 dark:text-slate-400' },
              ].map((action, idx) => (
                <Button
                  key={idx}
                  variant="ghost"
                  className={`h-20 flex-col gap-2 ${action.color} hover:scale-105 transition-all duration-200`}
                >
                  <action.icon className="w-5 h-5" />
                  <span className="text-xs font-medium">{action.label}</span>
                </Button>
              ))}
            </div>

            <div className="grid grid-cols-12 gap-6">
              {/* Recent Jobs */}
              <Card className="col-span-8 border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Recent Backup Jobs</CardTitle>
                    <Button variant="outline" size="sm" onClick={() => setActiveTab('jobs')}>View All</Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockJobs.slice(0, 4).map(job => (
                      <div
                        key={job.id}
                        className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => setSelectedJob(job)}
                      >
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          job.status === 'completed' ? 'bg-green-100 dark:bg-green-900' :
                          job.status === 'running' ? 'bg-blue-100 dark:bg-blue-900' :
                          job.status === 'failed' ? 'bg-red-100 dark:bg-red-900' :
                          'bg-gray-100 dark:bg-gray-800'
                        }`}>
                          {job.status === 'running' ? (
                            <RotateCw className="h-5 w-5 text-blue-600 animate-spin" />
                          ) : job.status === 'completed' ? (
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                          ) : job.status === 'failed' ? (
                            <XCircle className="h-5 w-5 text-red-600" />
                          ) : (
                            <Clock className="h-5 w-5 text-gray-600" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 dark:text-white">{job.name}</h4>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <span>{job.source}</span>
                            <span>→</span>
                            <span>{job.destination}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(job.status)}>{job.status}</Badge>
                          <Badge className={getTypeColor(job.type)}>{job.type}</Badge>
                          {job.legalHold && <Badge className="bg-rose-100 text-rose-700"><Gavel className="h-3 w-3 mr-1" />Hold</Badge>}
                          {job.crossRegionEnabled && <Badge variant="outline"><Globe className="h-3 w-3 mr-1" />Cross-Region</Badge>}
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{formatSize(job.sizeBytes)}</p>
                          <p className="text-xs text-gray-500">{formatTime(job.lastRun)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Compliance Overview */}
              <Card className="col-span-4 border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle>Compliance Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {mockComplianceReports.slice(0, 4).map(report => (
                    <div key={report.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700" onClick={() => setSelectedCompliance(report)}>
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        report.status === 'compliant' ? 'bg-green-100' : report.status === 'non-compliant' ? 'bg-red-100' : 'bg-amber-100'
                      }`}>
                        {report.status === 'compliant' ? (
                          <ShieldCheck className="h-5 w-5 text-green-600" />
                        ) : report.status === 'non-compliant' ? (
                          <ShieldAlert className="h-5 w-5 text-red-600" />
                        ) : (
                          <Shield className="h-5 w-5 text-amber-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{report.frameworkName}</p>
                        <p className="text-xs text-gray-500">{report.controlsPassed}/{report.controlsTotal} controls passed</p>
                      </div>
                      <Badge className={getComplianceColor(report.status)}>{report.score}%</Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* RPO/RTO Overview */}
              <Card className="col-span-6 border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle>Recovery Objectives</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Target className="h-5 w-5 text-blue-600" />
                        <h4 className="font-medium">RPO Status</h4>
                      </div>
                      <p className="text-3xl font-bold text-blue-700 mb-1">98.5%</p>
                      <p className="text-sm text-gray-500">Jobs meeting RPO targets</p>
                    </div>
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Timer className="h-5 w-5 text-green-600" />
                        <h4 className="font-medium">RTO Status</h4>
                      </div>
                      <p className="text-3xl font-bold text-green-700 mb-1">99.2%</p>
                      <p className="text-sm text-gray-500">Jobs meeting RTO targets</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="col-span-6 border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-4 gap-4">
                    <Button variant="outline" className="h-20 flex-col" onClick={handleCreateBackup}>
                      <Play className="h-6 w-6 mb-2 text-green-600" />
                      Run Backup
                    </Button>
                    <Button variant="outline" className="h-20 flex-col" onClick={() => handleRestoreBackup('Latest Backup')}>
                      <Download className="h-6 w-6 mb-2 text-blue-600" />
                      Restore Data
                    </Button>
                    <Button variant="outline" className="h-20 flex-col" onClick={() => toast.info('Verifying Backups', { description: 'Backup verification started...' })}>
                      <ShieldCheck className="h-6 w-6 mb-2 text-purple-600" />
                      Verify Backups
                    </Button>
                    <Button variant="outline" className="h-20 flex-col" onClick={() => setShowLegalHoldDialog(true)}>
                      <Gavel className="h-6 w-6 mb-2 text-rose-600" />
                      Legal Hold
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Recovery Tests */}
              <Card className="col-span-12 border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Recovery Testing Schedule</CardTitle>
                    <Button size="sm" onClick={handleScheduleBackup}><Plus className="h-4 w-4 mr-2" />Schedule Test</Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-4 gap-4">
                    {mockRecoveryTests.map(test => (
                      <div key={test.id} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-sm">{test.name}</h4>
                          <Badge className={test.status === 'passed' ? 'bg-green-100 text-green-700' : test.status === 'failed' ? 'bg-red-100 text-red-700' : test.status === 'running' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}>
                            {test.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-500 mb-3">{test.jobName}</p>
                        <div className="flex items-center gap-2 text-xs">
                          {test.dataVerified && <Badge variant="outline" className="text-xs"><FileCheck className="h-3 w-3 mr-1" />Data</Badge>}
                          {test.applicationVerified && <Badge variant="outline" className="text-xs"><CheckCheck className="h-3 w-3 mr-1" />App</Badge>}
                        </div>
                        <p className="text-xs text-gray-400 mt-2">Next: {new Date(test.nextRun).toLocaleDateString()}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Backup Jobs Tab */}
          <TabsContent value="jobs" className="mt-6">
            {/* Jobs Overview Banner */}
            <div className="bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 rounded-2xl p-6 text-white mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Backup Jobs</h2>
                  <p className="text-green-100">Manage and monitor all backup jobs</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-center"><p className="text-3xl font-bold">{filteredJobs.length}</p><p className="text-green-200 text-sm">Jobs</p></div>
                  <div className="text-center"><p className="text-3xl font-bold">{filteredJobs.filter(j => j.status === 'running').length}</p><p className="text-green-200 text-sm">Running</p></div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 mb-4">
              <Button variant={selectedStatus === 'all' ? 'default' : 'outline'} size="sm" onClick={() => setSelectedStatus('all')}>All</Button>
              <Button variant={selectedStatus === 'completed' ? 'default' : 'outline'} size="sm" onClick={() => setSelectedStatus('completed')} className={selectedStatus === 'completed' ? 'bg-green-600' : ''}>Completed</Button>
              <Button variant={selectedStatus === 'running' ? 'default' : 'outline'} size="sm" onClick={() => setSelectedStatus('running')} className={selectedStatus === 'running' ? 'bg-blue-600' : ''}>Running</Button>
              <Button variant={selectedStatus === 'failed' ? 'default' : 'outline'} size="sm" onClick={() => setSelectedStatus('failed')} className={selectedStatus === 'failed' ? 'bg-red-600' : ''}>Failed</Button>
              <Button variant={selectedStatus === 'scheduled' ? 'default' : 'outline'} size="sm" onClick={() => setSelectedStatus('scheduled')}>Scheduled</Button>
            </div>

            <Card className="border-gray-200 dark:border-gray-700">
              <CardContent className="p-0">
                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                  {filteredJobs.map(job => (
                    <div key={job.id} className="flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer" onClick={() => setSelectedJob(job)}>
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                        job.status === 'completed' ? 'bg-green-100' : job.status === 'running' ? 'bg-blue-100' : job.status === 'failed' ? 'bg-red-100' : 'bg-gray-100'
                      }`}>
                        <Database className={`h-6 w-6 ${
                          job.status === 'completed' ? 'text-green-600' : job.status === 'running' ? 'text-blue-600' : job.status === 'failed' ? 'text-red-600' : 'text-gray-600'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 dark:text-white">{job.name}</h4>
                        <p className="text-sm text-gray-500">{job.description}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(job.status)}>{job.status}</Badge>
                        <Badge className={getTypeColor(job.type)}>{job.type}</Badge>
                        {job.legalHold && <Badge className="bg-rose-100 text-rose-700"><Gavel className="h-3 w-3" /></Badge>}
                      </div>
                      {job.status === 'running' && (
                        <div className="w-32">
                          <Progress value={job.progress} className="h-2" />
                          <p className="text-xs text-gray-500 text-center mt-1">{job.progress}%</p>
                        </div>
                      )}
                      <div className="text-right">
                        <p className="font-medium">{formatSize(job.sizeBytes)}</p>
                        <p className="text-xs text-gray-500">{job.filesCount.toLocaleString()} files</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {job.encrypted && <Lock className="h-4 w-4 text-green-600" />}
                        {job.verified && <ShieldCheck className="h-4 w-4 text-blue-600" />}
                        {job.crossRegionEnabled && <Globe className="h-4 w-4 text-purple-600" />}
                      </div>
                      <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); toast.info('Job Options', { description: `Options for "${job.name}"` }) }}><MoreHorizontal className="h-4 w-4" /></Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Recovery Points Tab */}
          <TabsContent value="recovery" className="mt-6">
            {/* Recovery Overview Banner */}
            <div className="bg-gradient-to-r from-purple-500 via-violet-500 to-indigo-500 rounded-2xl p-6 text-white mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Point-in-Time Recovery</h2>
                  <p className="text-purple-100">Restore any backup to any point in time</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-center"><p className="text-3xl font-bold">{mockRecoveryPoints.length}</p><p className="text-purple-200 text-sm">Points</p></div>
                </div>
              </div>
            </div>
            <Card className="border-gray-200 dark:border-gray-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Available Recovery Points</CardTitle>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={() => setShowLegalHoldDialog(true)}>
                      <Gavel className="h-4 w-4 mr-2" />
                      Apply Legal Hold
                    </Button>
                    <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => handleRestoreBackup('Selected Recovery Point')}>
                      <Download className="h-4 w-4 mr-2" />
                      Start Recovery
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                  {mockRecoveryPoints.map(point => (
                    <div key={point.id} className="flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-800">
                      <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                        <History className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 dark:text-white">{point.jobName}</h4>
                        <p className="text-sm text-gray-500">{new Date(point.timestamp).toLocaleString()}</p>
                      </div>
                      <Badge className={getTypeColor(point.type)}>{point.type}</Badge>
                      <Badge className={point.status === 'available' ? 'bg-green-100 text-green-700' : point.status === 'locked' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}>
                        {point.status}
                      </Badge>
                      {point.legalHold && <Badge className="bg-rose-100 text-rose-700"><Gavel className="h-3 w-3 mr-1" />Legal Hold</Badge>}
                      <div className="text-right">
                        <p className="font-medium">{formatSize(point.size)}</p>
                        <p className="text-xs text-gray-500">Until {point.retentionUntil}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {point.verified && <ShieldCheck className="h-5 w-5 text-green-600" />}
                        {point.recoveryTested && <CheckCheck className="h-5 w-5 text-blue-600" title={`Last tested: ${point.lastTestedDate}`} />}
                      </div>
                      <Button size="sm" variant="outline" onClick={() => handleRestoreBackup(point.jobName)}>Restore</Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Vaults Tab */}
          <TabsContent value="vaults" className="mt-6">
            {/* Vaults Overview Banner */}
            <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 rounded-2xl p-6 text-white mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Backup Vaults</h2>
                  <p className="text-amber-100">AWS Backup Vault-level security and compliance</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{mockVaults.length}</p>
                    <p className="text-amber-200 text-sm">Vaults</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{mockVaults.filter(v => v.locked).length}</p>
                    <p className="text-amber-200 text-sm">Locked</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Vaults Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
              {[
                { icon: Plus, label: 'New Vault', color: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400', action: () => toast.info('Creating Vault', { description: 'New vault creation started...' }) },
                { icon: Lock, label: 'Lock Vault', color: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400', action: () => toast.info('Locking Vault', { description: 'Vault lock initiated...' }) },
                { icon: Shield, label: 'Compliance', color: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400', action: () => setActiveTab('compliance') },
                { icon: Key, label: 'Access', color: 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400', action: () => toast.info('Access Control', { description: 'Managing vault access...' }) },
                { icon: Copy, label: 'Replicate', color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400', action: () => toast.info('Replicating', { description: 'Vault replication started...' }) },
                { icon: Archive, label: 'Archive', color: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400', action: () => toast.info('Archiving', { description: 'Moving to archive storage...' }) },
                { icon: Eye, label: 'Audit', color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400', action: () => toast.info('Audit Log', { description: 'Viewing audit trail...' }) },
                { icon: Settings, label: 'Settings', color: 'bg-slate-100 text-slate-600 dark:bg-slate-900/30 dark:text-slate-400', action: () => setActiveTab('settings') },
              ].map((action, idx) => (
                <Button
                  key={idx}
                  variant="ghost"
                  className={`h-20 flex-col gap-2 ${action.color} hover:scale-105 transition-all duration-200`}
                  onClick={action.action}
                >
                  <action.icon className="w-5 h-5" />
                  <span className="text-xs font-medium">{action.label}</span>
                </Button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-6">
              {mockVaults.map(vault => (
                <Card key={vault.id} className="border-gray-200 dark:border-gray-700 cursor-pointer hover:border-blue-300" onClick={() => setSelectedVault(vault)}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-lg ${vault.locked ? 'bg-amber-100 dark:bg-amber-900' : 'bg-blue-100 dark:bg-blue-900'} flex items-center justify-center`}>
                          {vault.locked ? <Lock className="h-6 w-6 text-amber-600" /> : <FolderLock className="h-6 w-6 text-blue-600" />}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">{vault.name}</h3>
                          <p className="text-sm text-gray-500">{vault.region}</p>
                        </div>
                      </div>
                      <Badge className={vault.status === 'active' ? 'bg-green-100 text-green-700' : vault.status === 'locked' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-700'}>
                        {vault.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-500 mb-4">{vault.description}</p>
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <p className="text-lg font-bold">{vault.recoveryPointCount}</p>
                        <p className="text-xs text-gray-500">Recovery Points</p>
                      </div>
                      <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <p className="text-lg font-bold">{formatSize(vault.totalSizeBytes)}</p>
                        <p className="text-xs text-gray-500">Total Size</p>
                      </div>
                      <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <p className="text-lg font-bold">{vault.legalHoldCount}</p>
                        <p className="text-xs text-gray-500">Legal Holds</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-4">
                        <span className="text-gray-500">Retention: {vault.minRetentionDays}-{vault.maxRetentionDays} days</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {vault.locked && <Badge variant="outline"><Lock className="h-3 w-3 mr-1" />Vault Lock</Badge>}
                        <Badge variant="outline"><Key className="h-3 w-3 mr-1" />{vault.encryptionKey}</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Compliance Tab */}
          <TabsContent value="compliance" className="mt-6">
            <div className="grid grid-cols-12 gap-6">
              {/* Compliance Reports */}
              <Card className="col-span-8 border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Compliance Reports</CardTitle>
                    <Button size="sm"><RefreshCw className="h-4 w-4 mr-2" />Run Evaluation</Button>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-gray-100 dark:divide-gray-800">
                    {mockComplianceReports.map(report => (
                      <div key={report.id} className="flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer" onClick={() => setSelectedCompliance(report)}>
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                          report.status === 'compliant' ? 'bg-green-100' : report.status === 'non-compliant' ? 'bg-red-100' : 'bg-amber-100'
                        }`}>
                          <Scale className={`h-6 w-6 ${
                            report.status === 'compliant' ? 'text-green-600' : report.status === 'non-compliant' ? 'text-red-600' : 'text-amber-600'
                          }`} />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 dark:text-white">{report.name}</h4>
                          <p className="text-sm text-gray-500">{report.resources.length} resources evaluated</p>
                        </div>
                        <Badge className={getComplianceColor(report.status)}>{report.status}</Badge>
                        <div className="text-center">
                          <p className="text-2xl font-bold">{report.score}%</p>
                          <p className="text-xs text-gray-500">Score</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm"><span className="text-green-600 font-medium">{report.controlsPassed}</span> / {report.controlsTotal}</p>
                          <p className="text-xs text-gray-500">Controls Passed</p>
                        </div>
                        <Button variant="ghost" size="icon"><Eye className="h-4 w-4" /></Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Audit Trail */}
              <Card className="col-span-4 border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle>Audit Trail</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-3">
                      {mockAuditEvents.map(event => (
                        <div key={event.id} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-medium">{event.eventType}</span>
                            <Badge className={event.result === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'} variant="outline">
                              {event.result}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-900 dark:text-white">{event.action}</p>
                          <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                            <span>{event.userName}</span>
                            <span>{new Date(event.timestamp).toLocaleTimeString()}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Storage Tab */}
          <TabsContent value="storage" className="mt-6">
            <div className="grid grid-cols-2 gap-6">
              {mockRepositories.map(repo => {
                const usedPercent = (repo.used / repo.capacity) * 100
                const StorageIcon = getStorageIcon(repo.type)
                return (
                  <Card key={repo.id} className="border-gray-200 dark:border-gray-700">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900 dark:to-indigo-900 flex items-center justify-center">
                            <StorageIcon className="h-6 w-6 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white">{repo.name}</h3>
                            <p className="text-sm text-gray-500">{repo.region || 'Local'} • {repo.tier}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {repo.replicationEnabled && <Badge variant="outline"><Globe className="h-3 w-3 mr-1" />Replication</Badge>}
                          <Badge className={repo.status === 'online' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}>
                            {repo.status}
                          </Badge>
                        </div>
                      </div>
                      <Progress value={usedPercent} className="h-3 mb-2" />
                      <div className="flex justify-between text-sm mb-4">
                        <span className="text-gray-500">{formatSize(repo.used)} of {formatSize(repo.capacity)}</span>
                        <span className={usedPercent > 80 ? 'text-red-600 font-medium' : 'text-green-600'}>{usedPercent.toFixed(1)}% used</span>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div><span className="text-gray-500">Backups:</span> <span className="font-medium">{repo.backupCount}</span></div>
                        <div><span className="text-gray-500">Last Backup:</span> <span className="font-medium">{repo.lastBackup}</span></div>
                        {repo.encryptionKeyId && <div><span className="text-gray-500">Key:</span> <span className="font-medium">{repo.encryptionKeyId}</span></div>}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>

          {/* Policies Tab */}
          <TabsContent value="policies" className="mt-6">
            <div className="grid grid-cols-2 gap-6">
              {mockPolicies.map(policy => (
                <Card key={policy.id} className="border-gray-200 dark:border-gray-700">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-gray-900 dark:text-white">{policy.name}</h3>
                      <div className="flex items-center gap-2">
                        {policy.isDefault && <Badge className="bg-blue-100 text-blue-700">Default</Badge>}
                        <Badge variant="outline">{policy.jobCount} jobs</Badge>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 mb-4">{policy.description}</p>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <p className="text-xs text-gray-500">Frequency</p>
                        <p className="font-medium capitalize">{policy.frequency}</p>
                      </div>
                      <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <p className="text-xs text-gray-500">Retention</p>
                        <p className="font-medium">{policy.retentionDays} days</p>
                      </div>
                      <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <p className="text-xs text-gray-500">Cold Storage After</p>
                        <p className="font-medium">{policy.coldStorageAfter} days</p>
                      </div>
                      <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <p className="text-xs text-gray-500">Delete After</p>
                        <p className="font-medium">{policy.deleteAfter} days</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {policy.encryption && <Badge variant="outline"><Lock className="h-3 w-3 mr-1" />Encrypted</Badge>}
                      {policy.compression && <Badge variant="outline"><FileArchive className="h-3 w-3 mr-1" />Compressed</Badge>}
                      {policy.verification && <Badge variant="outline"><ShieldCheck className="h-3 w-3 mr-1" />Verified</Badge>}
                      {policy.crossRegionEnabled && <Badge variant="outline"><Globe className="h-3 w-3 mr-1" />Cross-Region</Badge>}
                      {policy.crossAccountEnabled && <Badge variant="outline"><Building2 className="h-3 w-3 mr-1" />Cross-Account</Badge>}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Settings Tab */}
          {/* Settings Tab - AWS Backup Level Configuration */}
          <TabsContent value="settings" className="mt-6">
            {/* Settings Overview Banner */}
            <div className="bg-gradient-to-r from-slate-600 via-gray-600 to-zinc-600 rounded-2xl p-6 text-white mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Backup Settings</h2>
                  <p className="text-slate-200">AWS Backup-level configuration and preferences</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">6</p>
                    <p className="text-slate-200 text-sm">Setting Groups</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">32+</p>
                    <p className="text-slate-200 text-sm">Options</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Settings Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
              {[
                { icon: Settings, label: 'General', color: 'bg-slate-100 text-slate-600 dark:bg-slate-900/30 dark:text-slate-400' },
                { icon: HardDrive, label: 'Storage', color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' },
                { icon: Bell, label: 'Alerts', color: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' },
                { icon: Webhook, label: 'Integrations', color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400' },
                { icon: Shield, label: 'Security', color: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' },
                { icon: Sliders, label: 'Advanced', color: 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400' },
                { icon: Download, label: 'Export', color: 'bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400' },
                { icon: RefreshCw, label: 'Reset', color: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' },
              ].map((action, idx) => (
                <Button
                  key={idx}
                  variant="ghost"
                  className={`h-20 flex-col gap-2 ${action.color} hover:scale-105 transition-all duration-200`}
                >
                  <action.icon className="w-5 h-5" />
                  <span className="text-xs font-medium">{action.label}</span>
                </Button>
              ))}
            </div>

            <div className="grid grid-cols-12 gap-6">
              {/* Settings Sidebar */}
              <div className="col-span-12 md:col-span-3">
                <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur sticky top-4">
                  <CardContent className="p-4">
                    <nav className="space-y-2">
                      {[
                        { id: 'general', label: 'General', icon: Settings },
                        { id: 'storage', label: 'Storage', icon: HardDrive },
                        { id: 'notifications', label: 'Notifications', icon: Bell },
                        { id: 'integrations', label: 'Integrations', icon: Network },
                        { id: 'security', label: 'Security', icon: Shield },
                        { id: 'advanced', label: 'Advanced', icon: Sliders }
                      ].map((item) => (
                        <button
                          key={item.id}
                          onClick={() => setSettingsTab(item.id)}
                          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all ${
                            settingsTab === item.id
                              ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg'
                              : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                          }`}
                        >
                          <item.icon className="h-5 w-5" />
                          <span className="font-medium">{item.label}</span>
                        </button>
                      ))}
                    </nav>
                  </CardContent>
                </Card>
              </div>

              {/* Settings Content */}
              <div className="col-span-12 md:col-span-9 space-y-6">
                {settingsTab === 'general' && (
                  <>
                    <Card className="dark:bg-gray-800/50">
                      <CardHeader>
                        <CardTitle>Backup Preferences</CardTitle>
                        <CardDescription>Configure default backup behavior</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="flex items-center justify-between">
                          <div><Label className="text-base">Automatic Verification</Label><p className="text-sm text-gray-500">Verify backups after completion</p></div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div><Label className="text-base">Compression</Label><p className="text-sm text-gray-500">Compress backups to save storage</p></div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div><Label className="text-base">Deduplication</Label><p className="text-sm text-gray-500">Enable block-level deduplication</p></div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div><Label className="text-base">Parallel Backups</Label><p className="text-sm text-gray-500">Max concurrent jobs</p></div>
                          <Input type="number" defaultValue="5" className="w-24" />
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="dark:bg-gray-800/50">
                      <CardHeader>
                        <CardTitle>Scheduling</CardTitle>
                        <CardDescription>Set default scheduling preferences</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="flex items-center justify-between">
                          <div><Label className="text-base">Default Schedule</Label><p className="text-sm text-gray-500">New job default</p></div>
                          <Input defaultValue="Daily at 2:00 AM" className="w-48" />
                        </div>
                        <div className="flex items-center justify-between">
                          <div><Label className="text-base">Timezone</Label><p className="text-sm text-gray-500">Schedule timezone</p></div>
                          <Input defaultValue="UTC" className="w-32" />
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {settingsTab === 'storage' && (
                  <>
                    <Card className="dark:bg-gray-800/50">
                      <CardHeader>
                        <CardTitle>Storage Configuration</CardTitle>
                        <CardDescription>Configure storage and replication settings</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="flex items-center justify-between">
                          <div><Label className="text-base">Cross-Region Backup</Label><p className="text-sm text-gray-500">Replicate to secondary region</p></div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div><Label className="text-base">Encryption at Rest</Label><p className="text-sm text-gray-500">AWS KMS encryption</p></div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div><Label className="text-base">Storage Class</Label><p className="text-sm text-gray-500">Default tier</p></div>
                          <Input defaultValue="Standard" className="w-32" />
                        </div>
                        <div className="flex items-center justify-between">
                          <div><Label className="text-base">Lifecycle Rules</Label><p className="text-sm text-gray-500">Auto-transition to cold</p></div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {settingsTab === 'notifications' && (
                  <>
                    <Card className="dark:bg-gray-800/50">
                      <CardHeader>
                        <CardTitle>Alert Configuration</CardTitle>
                        <CardDescription>Control backup notifications</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="flex items-center justify-between">
                          <div><Label className="text-base">Failure Alerts</Label><p className="text-sm text-gray-500">Notify on backup failures</p></div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div><Label className="text-base">Daily Summary</Label><p className="text-sm text-gray-500">Send daily report</p></div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div><Label className="text-base">Storage Warnings</Label><p className="text-sm text-gray-500">Alert at 80% capacity</p></div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div><Label className="text-base">Compliance Alerts</Label><p className="text-sm text-gray-500">Notify on violations</p></div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div><Label className="text-base">SNS Topic ARN</Label><p className="text-sm text-gray-500">Notification target</p></div>
                          <Input defaultValue="arn:aws:sns:..." className="w-64" />
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {settingsTab === 'integrations' && (
                  <>
                    <Card className="dark:bg-gray-800/50">
                      <CardHeader>
                        <CardTitle>Connected Services</CardTitle>
                        <CardDescription>Manage backup integrations</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {[
                          { name: 'AWS S3', connected: true, icon: '☁️' },
                          { name: 'Azure Blob Storage', connected: true, icon: '🔷' },
                          { name: 'Google Cloud Storage', connected: false, icon: '🔵' },
                          { name: 'Slack Notifications', connected: true, icon: '💬' },
                          { name: 'PagerDuty', connected: true, icon: '📟' },
                        ].map((integration, idx) => (
                          <div key={idx} className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700">
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">{integration.icon}</span>
                              <div>
                                <p className="font-medium">{integration.name}</p>
                                <p className="text-sm text-gray-500">{integration.connected ? 'Connected' : 'Not connected'}</p>
                              </div>
                            </div>
                            <Button variant={integration.connected ? 'outline' : 'default'} size="sm">
                              {integration.connected ? 'Disconnect' : 'Connect'}
                            </Button>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  </>
                )}

                {settingsTab === 'security' && (
                  <>
                    <Card className="dark:bg-gray-800/50">
                      <CardHeader>
                        <CardTitle>Security Settings</CardTitle>
                        <CardDescription>Protect your backup infrastructure</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="flex items-center justify-between">
                          <div><Label className="text-base">Vault Lock</Label><p className="text-sm text-gray-500">Enable WORM compliance</p></div>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between">
                          <div><Label className="text-base">MFA Delete</Label><p className="text-sm text-gray-500">Require MFA for deletion</p></div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div><Label className="text-base">Access Logging</Label><p className="text-sm text-gray-500">Log to CloudTrail</p></div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div><Label className="text-base">IAM Policies</Label><p className="text-sm text-gray-500">Enforce least privilege</p></div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {settingsTab === 'advanced' && (
                  <>
                    <Card className="dark:bg-gray-800/50">
                      <CardHeader>
                        <CardTitle>Recovery Options</CardTitle>
                        <CardDescription>Configure recovery settings</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="flex items-center justify-between">
                          <div><Label className="text-base">Auto Recovery Testing</Label><p className="text-sm text-gray-500">Quarterly DR tests</p></div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div><Label className="text-base">Point-in-Time Recovery</Label><p className="text-sm text-gray-500">Continuous backups</p></div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div><Label className="text-base">Fast Restore</Label><p className="text-sm text-gray-500">Keep in hot tier</p></div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="dark:bg-gray-800/50">
                      <CardHeader>
                        <CardTitle>System Settings</CardTitle>
                        <CardDescription>Advanced configuration options</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700">
                          <div><p className="font-medium">Backup Agent Version</p><p className="text-sm text-gray-500">v2.5.1</p></div>
                          <Button variant="outline" size="sm">Update</Button>
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700">
                          <div><p className="font-medium">Cache Size</p><p className="text-sm text-gray-500">2.1 GB used</p></div>
                          <Button variant="outline" size="sm">Clear</Button>
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700">
                          <div><p className="font-medium">Debug Logging</p><p className="text-sm text-gray-500">Disabled</p></div>
                          <Button variant="outline" size="sm">Enable</Button>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Enhanced Competitive Upgrade Components */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          <div className="lg:col-span-2">
            <AIInsightsPanel
              insights={mockBackupsAIInsights}
              title="Backup Intelligence"
              onInsightAction={(insight) => console.log('Insight action:', insight)}
            />
          </div>
          <div className="space-y-6">
            <CollaborationIndicator
              collaborators={mockBackupsCollaborators}
              maxVisible={4}
              showStatus={true}
            />
            <PredictiveAnalytics
              predictions={mockBackupsPredictions}
              title="Storage Forecasts"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <ActivityFeed
            activities={mockBackupsActivities}
            title="Backup Activity"
            maxItems={5}
          />
          <QuickActionsToolbar
            actions={mockBackupsQuickActions}
            variant="grid"
          />
        </div>

        {/* Job Detail Dialog */}
        <Dialog open={!!selectedJob} onOpenChange={() => setSelectedJob(null)}>
          <DialogContent className="max-w-3xl">
            <ScrollArea className="max-h-[80vh]">
              {selectedJob && (
                <div className="space-y-6">
                  <DialogHeader>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                        <Database className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <DialogTitle>{selectedJob.name}</DialogTitle>
                        <p className="text-gray-500">{selectedJob.description}</p>
                      </div>
                    </div>
                  </DialogHeader>
                  <div className="grid grid-cols-4 gap-4">
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                      <p className="text-2xl font-bold">{formatSize(selectedJob.sizeBytes)}</p>
                      <p className="text-sm text-gray-500">Backup Size</p>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                      <p className="text-2xl font-bold">{selectedJob.restorePoints}</p>
                      <p className="text-sm text-gray-500">Restore Points</p>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                      <p className="text-2xl font-bold">{selectedJob.successRate}%</p>
                      <p className="text-sm text-gray-500">Success Rate</p>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                      <p className="text-2xl font-bold">{selectedJob.rpo}h / {selectedJob.rto}m</p>
                      <p className="text-sm text-gray-500">RPO / RTO</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedJob.encrypted && <Badge variant="outline"><Lock className="h-3 w-3 mr-1" />Encrypted</Badge>}
                    {selectedJob.compressed && <Badge variant="outline"><FileArchive className="h-3 w-3 mr-1" />Compressed</Badge>}
                    {selectedJob.verified && <Badge variant="outline"><ShieldCheck className="h-3 w-3 mr-1" />Verified</Badge>}
                    {selectedJob.crossRegionEnabled && <Badge variant="outline"><Globe className="h-3 w-3 mr-1" />Cross-Region</Badge>}
                    {selectedJob.legalHold && <Badge className="bg-rose-100 text-rose-700"><Gavel className="h-3 w-3 mr-1" />Legal Hold</Badge>}
                  </div>
                  <div className="flex gap-3">
                    <Button className="bg-green-600 hover:bg-green-700"><Play className="h-4 w-4 mr-2" />Run Now</Button>
                    <Button variant="outline"><Download className="h-4 w-4 mr-2" />Restore</Button>
                    <Button variant="outline"><ShieldCheck className="h-4 w-4 mr-2" />Verify</Button>
                    <Button variant="outline"><Gavel className="h-4 w-4 mr-2" />Legal Hold</Button>
                  </div>
                </div>
              )}
            </ScrollArea>
          </DialogContent>
        </Dialog>

        {/* Vault Detail Dialog */}
        <Dialog open={!!selectedVault} onOpenChange={() => setSelectedVault(null)}>
          <DialogContent className="max-w-2xl">
            <ScrollArea className="max-h-[80vh]">
              {selectedVault && (
                <div className="space-y-6">
                  <DialogHeader>
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-lg ${selectedVault.locked ? 'bg-amber-100' : 'bg-blue-100'} flex items-center justify-center`}>
                        {selectedVault.locked ? <Lock className="h-6 w-6 text-amber-600" /> : <FolderLock className="h-6 w-6 text-blue-600" />}
                      </div>
                      <div>
                        <DialogTitle>{selectedVault.name}</DialogTitle>
                        <p className="text-gray-500">{selectedVault.description}</p>
                      </div>
                    </div>
                  </DialogHeader>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                      <p className="text-2xl font-bold">{selectedVault.recoveryPointCount}</p>
                      <p className="text-sm text-gray-500">Recovery Points</p>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                      <p className="text-2xl font-bold">{formatSize(selectedVault.totalSizeBytes)}</p>
                      <p className="text-sm text-gray-500">Total Size</p>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                      <p className="text-2xl font-bold">{selectedVault.legalHoldCount}</p>
                      <p className="text-sm text-gray-500">Legal Holds</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between"><span className="text-gray-500">Region:</span><span className="font-medium">{selectedVault.region}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Encryption Key:</span><span className="font-medium">{selectedVault.encryptionKey}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Access Policy:</span><span className="font-medium">{selectedVault.accessPolicy}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Retention:</span><span className="font-medium">{selectedVault.minRetentionDays} - {selectedVault.maxRetentionDays} days</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Created By:</span><span className="font-medium">{selectedVault.createdBy}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Last Accessed:</span><span className="font-medium">{selectedVault.lastAccessedAt}</span></div>
                  </div>
                </div>
              )}
            </ScrollArea>
          </DialogContent>
        </Dialog>

        {/* Compliance Detail Dialog */}
        <Dialog open={!!selectedCompliance} onOpenChange={() => setSelectedCompliance(null)}>
          <DialogContent className="max-w-3xl">
            <ScrollArea className="max-h-[80vh]">
              {selectedCompliance && (
                <div className="space-y-6">
                  <DialogHeader>
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-lg ${selectedCompliance.status === 'compliant' ? 'bg-green-100' : 'bg-red-100'} flex items-center justify-center`}>
                        <Scale className={`h-6 w-6 ${selectedCompliance.status === 'compliant' ? 'text-green-600' : 'text-red-600'}`} />
                      </div>
                      <div>
                        <DialogTitle>{selectedCompliance.name}</DialogTitle>
                        <p className="text-gray-500">{selectedCompliance.frameworkName} Framework</p>
                      </div>
                    </div>
                  </DialogHeader>
                  <div className="grid grid-cols-4 gap-4">
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                      <p className="text-2xl font-bold">{selectedCompliance.score}%</p>
                      <p className="text-sm text-gray-500">Score</p>
                    </div>
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg text-center">
                      <p className="text-2xl font-bold text-green-600">{selectedCompliance.controlsPassed}</p>
                      <p className="text-sm text-gray-500">Passed</p>
                    </div>
                    <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg text-center">
                      <p className="text-2xl font-bold text-red-600">{selectedCompliance.controlsFailed}</p>
                      <p className="text-sm text-gray-500">Failed</p>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                      <p className="text-2xl font-bold">{selectedCompliance.controlsTotal}</p>
                      <p className="text-sm text-gray-500">Total Controls</p>
                    </div>
                  </div>
                  {selectedCompliance.findings.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-3">Findings</h4>
                      <div className="space-y-3">
                        {selectedCompliance.findings.map(finding => (
                          <div key={finding.id} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <h5 className="font-medium">{finding.title}</h5>
                              <Badge className={getSeverityColor(finding.severity)}>{finding.severity}</Badge>
                            </div>
                            <p className="text-sm text-gray-500 mb-2">{finding.description}</p>
                            <p className="text-sm"><span className="text-gray-500">Recommendation:</span> {finding.recommendation}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </ScrollArea>
          </DialogContent>
        </Dialog>

        {/* Legal Hold Dialog */}
        <Dialog open={showLegalHoldDialog} onOpenChange={setShowLegalHoldDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2"><Gavel className="h-5 w-5" />Apply Legal Hold</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Select Recovery Points</Label>
                <Select>
                  <SelectTrigger><SelectValue placeholder="Choose recovery points" /></SelectTrigger>
                  <SelectContent>
                    {mockRecoveryPoints.filter(rp => !rp.legalHold).map(rp => (
                      <SelectItem key={rp.id} value={rp.id}>{rp.jobName} - {new Date(rp.timestamp).toLocaleDateString()}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Legal Hold Reason</Label>
                <Input placeholder="e.g., Litigation hold - Case #12345" />
              </div>
              <div>
                <Label>Authorized By</Label>
                <Input placeholder="Legal department contact" />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowLegalHoldDialog(false)}>Cancel</Button>
                <Button className="bg-rose-600 hover:bg-rose-700">Apply Legal Hold</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
