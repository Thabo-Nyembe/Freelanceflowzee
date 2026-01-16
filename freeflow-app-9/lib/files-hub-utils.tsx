/**
 * FILES HUB UTILITIES
 * Session 9: Comprehensive File Management System
 *
 * Features:
 * - Complete TypeScript interfaces for files, folders, and metadata
 * - Extensive mock data with 60+ files and 15+ folders
 * - 25+ helper functions for file operations
 * - File type detection and categorization
 * - Storage analytics and calculations
 * - Multi-cloud storage utilities
 */

import {
  File, FileText, FileImage, FileVideo, FileArchive, FileCode,
  Music, LucideIcon
} from 'lucide-react'

// ============================================================================
// TYPESCRIPT INTERFACES
// ============================================================================

export interface FileMetadata {
  mimeType: string
  encoding?: string
  dimensions?: { width: number; height: number } // for images/videos
  duration?: number // for videos/audio (in seconds)
  pageCount?: number // for documents
  wordCount?: number // for documents
  compression?: string // for archives
  language?: string // for code files
  checksum?: string // SHA-256 hash
  originalName?: string // if renamed
}

export interface FileItem {
  id: string
  name: string
  type: 'document' | 'image' | 'video' | 'audio' | 'archive' | 'code' | 'other'
  size: number // in bytes
  url: string
  thumbnailUrl?: string
  uploadedAt: string
  uploadedBy: { id: string; name: string; avatar: string }
  modifiedAt: string
  folder: string
  tags: string[]
  shared: boolean
  starred: boolean
  locked: boolean
  downloads: number
  views: number
  version: number
  extension: string
  description?: string
  sharedWith?: string[]
  accessLevel?: 'private' | 'team' | 'public'
  metadata?: FileMetadata
  storageProvider?: 'supabase' | 'wasabi' // Multi-cloud storage
  isArchived?: boolean
  archivedAt?: string
  lastAccessedAt?: string
}

export interface FolderPermissions {
  canRead: boolean
  canWrite: boolean
  canDelete: boolean
  canShare: boolean
}

export interface FolderStructure {
  id: string
  name: string
  path: string
  parentId: string | null
  icon?: string
  color?: string
  fileCount: number
  totalSize: number
  createdAt: string
  updatedAt: string
  permissions: FolderPermissions
  isShared?: boolean
  sharedWith?: string[]
  description?: string
}

export interface FilesHubState {
  files: FileItem[]
  folders: FolderStructure[]
  selectedFile: FileItem | null
  searchTerm: string
  filterType: 'all' | 'document' | 'image' | 'video' | 'audio' | 'archive' | 'code' | 'starred'
  sortBy: 'name' | 'date' | 'size' | 'type' | 'downloads' | 'views'
  viewMode: 'grid' | 'list'
  selectedFiles: string[]
  currentFolder: string
  uploadProgress: { [key: string]: number }
}

export type FilesHubAction =
  | { type: 'SET_FILES'; files: FileItem[] }
  | { type: 'ADD_FILE'; file: FileItem }
  | { type: 'ADD_FILES'; payload: FileItem[] }
  | { type: 'UPDATE_FILE'; file: FileItem }
  | { type: 'DELETE_FILE'; fileId: string }
  | { type: 'SELECT_FILE'; file: FileItem | null }
  | { type: 'SET_SEARCH'; searchTerm: string }
  | { type: 'SET_FILTER'; filterType: FilesHubState['filterType'] }
  | { type: 'SET_SORT'; sortBy: FilesHubState['sortBy'] }
  | { type: 'SET_VIEW_MODE'; viewMode: FilesHubState['viewMode'] }
  | { type: 'TOGGLE_SELECT_FILE'; fileId: string }
  | { type: 'CLEAR_SELECTED_FILES' }
  | { type: 'TOGGLE_STAR'; fileId: string }
  | { type: 'SET_FOLDER'; folder: string }
  | { type: 'SET_FOLDERS'; folders: FolderStructure[] }
  | { type: 'UPDATE_UPLOAD_PROGRESS'; fileId: string; progress: number }

export interface FileAnalytics {
  totalFiles: number
  totalSize: number
  filesByType: Record<string, number>
  storageByType: Record<string, number>
  avgFileSize: number
  largestFile: FileItem | null
  mostDownloaded: FileItem | null
  mostViewed: FileItem | null
  recentUploads: FileItem[]
}

export interface StorageStats {
  supabaseStorage: {
    fileCount: number
    totalSize: number
    monthlyCost: number
  }
  wasabiStorage: {
    fileCount: number
    totalSize: number
    monthlyCost: number
  }
  totalCost: number
  savings: number
  savingsPercentage: number
}

// ============================================================================
// MOCK DATA - USERS (Migration Batch #9)
// ============================================================================

// MIGRATED: Batch #11 - Removed mock data, using database hooks
const MOCK_USERS: Array<{ id: string; name: string; avatar: string }> = []

// ============================================================================
// MOCK DATA - FOLDERS (Migration Batch #9)
// ============================================================================

// MIGRATED: Batch #11 - Removed mock data, using database hooks
export const MOCK_FOLDERS: FolderStructure[] = []

/* ORIGINAL MOCK DATA REMOVED - Previously contained 15 folders:
  {
    id: 'folder-001',
    name: 'All Files',
    path: '/',
    parentId: null,
    icon: 'folder',
    color: 'blue',
    fileCount: 0,
    totalSize: 0,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-11-26T00:00:00.000Z',
    permissions: { canRead: true, canWrite: true, canDelete: true, canShare: true },
    description: 'Root folder containing all files'
  },
  {
    id: 'folder-002',
    name: 'Documents',
    path: '/Documents',
    parentId: 'folder-001',
    icon: 'file-text',
    color: 'blue',
    fileCount: 15,
    totalSize: 45000000,
    createdAt: '2024-01-15T00:00:00.000Z',
    updatedAt: '2024-11-20T00:00:00.000Z',
    permissions: { canRead: true, canWrite: true, canDelete: true, canShare: true },
    description: 'Business documents, reports, and presentations'
  },
  {
    id: 'folder-003',
    name: 'Images',
    path: '/Images',
    parentId: 'folder-001',
    icon: 'image',
    color: 'green',
    fileCount: 12,
    totalSize: 87000000,
    createdAt: '2024-01-20T00:00:00.000Z',
    updatedAt: '2024-11-18T00:00:00.000Z',
    permissions: { canRead: true, canWrite: true, canDelete: true, canShare: true },
    description: 'Photos, graphics, and design assets'
  },
  {
    id: 'folder-004',
    name: 'Videos',
    path: '/Videos',
    parentId: 'folder-001',
    icon: 'video',
    color: 'purple',
    fileCount: 8,
    totalSize: 650000000,
    createdAt: '2024-02-01T00:00:00.000Z',
    updatedAt: '2024-11-15T00:00:00.000Z',
    permissions: { canRead: true, canWrite: true, canDelete: true, canShare: true },
    description: 'Video content, recordings, and tutorials'
  },
  {
    id: 'folder-005',
    name: 'Downloads',
    path: '/Downloads',
    parentId: 'folder-001',
    icon: 'download',
    color: 'cyan',
    fileCount: 10,
    totalSize: 123000000,
    createdAt: '2024-02-10T00:00:00.000Z',
    updatedAt: '2024-11-22T00:00:00.000Z',
    permissions: { canRead: true, canWrite: true, canDelete: true, canShare: true },
    description: 'Downloaded files and temporary storage'
  },
  {
    id: 'folder-006',
    name: 'Projects',
    path: '/Projects',
    parentId: 'folder-001',
    icon: 'briefcase',
    color: 'indigo',
    fileCount: 18,
    totalSize: 234000000,
    createdAt: '2024-03-01T00:00:00.000Z',
    updatedAt: '2024-11-25T00:00:00.000Z',
    permissions: { canRead: true, canWrite: true, canDelete: true, canShare: true },
    isShared: true,
    sharedWith: ['user-002', 'user-003'],
    description: 'Active project files and deliverables'
  },
  {
    id: 'folder-007',
    name: 'Designs',
    path: '/Designs',
    parentId: 'folder-001',
    icon: 'palette',
    color: 'pink',
    fileCount: 14,
    totalSize: 156000000,
    createdAt: '2024-03-15T00:00:00.000Z',
    updatedAt: '2024-11-19T00:00:00.000Z',
    permissions: { canRead: true, canWrite: true, canDelete: true, canShare: true },
    description: 'Design mockups, wireframes, and assets'
  },
  {
    id: 'folder-008',
    name: 'Archive',
    path: '/Archive',
    parentId: 'folder-001',
    icon: 'archive',
    color: 'yellow',
    fileCount: 25,
    totalSize: 890000000,
    createdAt: '2024-04-01T00:00:00.000Z',
    updatedAt: '2024-11-10T00:00:00.000Z',
    permissions: { canRead: true, canWrite: false, canDelete: false, canShare: false },
    description: 'Archived files and old versions'
  },
  {
    id: 'folder-009',
    name: 'Shared',
    path: '/Shared',
    parentId: 'folder-001',
    icon: 'users',
    color: 'teal',
    fileCount: 9,
    totalSize: 67000000,
    createdAt: '2024-04-15T00:00:00.000Z',
    updatedAt: '2024-11-24T00:00:00.000Z',
    permissions: { canRead: true, canWrite: true, canDelete: false, canShare: true },
    isShared: true,
    sharedWith: ['user-002', 'user-003', 'user-004', 'user-005'],
    description: 'Files shared with team members'
  },
  {
    id: 'folder-010',
    name: 'Marketing',
    path: '/Marketing',
    parentId: 'folder-001',
    icon: 'megaphone',
    color: 'red',
    fileCount: 11,
    totalSize: 145000000,
    createdAt: '2024-05-01T00:00:00.000Z',
    updatedAt: '2024-11-21T00:00:00.000Z',
    permissions: { canRead: true, canWrite: true, canDelete: true, canShare: true },
    description: 'Marketing materials and campaign assets'
  },
  {
    id: 'folder-011',
    name: 'Legal',
    path: '/Legal',
    parentId: 'folder-002',
    icon: 'scale',
    color: 'gray',
    fileCount: 7,
    totalSize: 34000000,
    createdAt: '2024-05-15T00:00:00.000Z',
    updatedAt: '2024-11-16T00:00:00.000Z',
    permissions: { canRead: true, canWrite: false, canDelete: false, canShare: false },
    description: 'Legal documents, contracts, and agreements'
  },
  {
    id: 'folder-012',
    name: 'HR',
    path: '/HR',
    parentId: 'folder-002',
    icon: 'user-check',
    color: 'orange',
    fileCount: 6,
    totalSize: 28000000,
    createdAt: '2024-06-01T00:00:00.000Z',
    updatedAt: '2024-11-17T00:00:00.000Z',
    permissions: { canRead: true, canWrite: false, canDelete: false, canShare: false },
    description: 'HR documents, policies, and employee files'
  },
  {
    id: 'folder-013',
    name: 'Code',
    path: '/Code',
    parentId: 'folder-006',
    icon: 'code',
    color: 'cyan',
    fileCount: 22,
    totalSize: 89000000,
    createdAt: '2024-06-15T00:00:00.000Z',
    updatedAt: '2024-11-23T00:00:00.000Z',
    permissions: { canRead: true, canWrite: true, canDelete: true, canShare: true },
    description: 'Source code and development files'
  },
  {
    id: 'folder-014',
    name: 'Resources',
    path: '/Resources',
    parentId: 'folder-001',
    icon: 'package',
    color: 'lime',
    fileCount: 13,
    totalSize: 178000000,
    createdAt: '2024-07-01T00:00:00.000Z',
    updatedAt: '2024-11-14T00:00:00.000Z',
    permissions: { canRead: true, canWrite: true, canDelete: true, canShare: true },
    description: 'General resources and reference materials'
  },
  {
    id: 'folder-015',
    name: 'Backups',
    path: '/Backups',
    parentId: 'folder-008',
    icon: 'hard-drive',
    color: 'slate',
    fileCount: 19,
    totalSize: 567000000,
    createdAt: '2024-08-01T00:00:00.000Z',
    updatedAt: '2024-11-12T00:00:00.000Z',
    permissions: { canRead: true, canWrite: false, canDelete: false, canShare: false },
    description: 'System backups and snapshots'
  },
*/

// ============================================================================
// MOCK DATA - FILES (Migration Batch #9)
// ============================================================================

// MIGRATED: Batch #11 - Removed mock data, using database hooks
export const MOCK_FILES: FileItem[] = []

/* ORIGINAL MOCK DATA REMOVED - Previously contained 60+ files:
  // DOCUMENTS (15 files)
  {
    id: 'FILE-001',
    name: 'Q4 2024 Financial Report.pdf',
    type: 'document',
    size: 4567890,
    url: '/files/q4-2024-financial-report.pdf',
    uploadedAt: '2024-11-01T10:30:00.000Z',
    uploadedBy: MOCK_USERS[0],
    modifiedAt: '2024-11-15T14:20:00.000Z',
    folder: 'Documents',
    tags: ['finance', 'quarterly', 'report'],
    shared: true,
    starred: true,
    locked: false,
    downloads: 45,
    views: 123,
    version: 2,
    extension: 'pdf',
    description: 'Quarterly financial performance report',
    sharedWith: ['user-002', 'user-003'],
    accessLevel: 'team',
    metadata: {
      mimeType: 'application/pdf',
      pageCount: 24,
      wordCount: 5678
    },
    storageProvider: 'supabase',
    lastAccessedAt: '2024-11-25T09:15:00.000Z'
  },
  {
    id: 'FILE-002',
    name: 'Business Plan 2025.docx',
    type: 'document',
    size: 3456789,
    url: '/files/business-plan-2025.docx',
    uploadedAt: '2024-10-15T08:45:00.000Z',
    uploadedBy: MOCK_USERS[1],
    modifiedAt: '2024-11-20T16:30:00.000Z',
    folder: 'Documents',
    tags: ['business', 'planning', 'strategy'],
    shared: true,
    starred: true,
    locked: true,
    downloads: 67,
    views: 234,
    version: 5,
    extension: 'docx',
    description: 'Strategic business plan for 2025',
    sharedWith: ['user-001', 'user-002', 'user-004'],
    accessLevel: 'team',
    metadata: {
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      pageCount: 45,
      wordCount: 12345
    },
    storageProvider: 'supabase',
    lastAccessedAt: '2024-11-24T11:20:00.000Z'
  },
  {
    id: 'FILE-003',
    name: 'Meeting Notes - Nov 2024.txt',
    type: 'document',
    size: 123456,
    url: '/files/meeting-notes-nov-2024.txt',
    uploadedAt: '2024-11-05T14:00:00.000Z',
    uploadedBy: MOCK_USERS[2],
    modifiedAt: '2024-11-22T10:15:00.000Z',
    folder: 'Documents',
    tags: ['meeting', 'notes', 'november'],
    shared: false,
    starred: false,
    locked: false,
    downloads: 12,
    views: 45,
    version: 3,
    extension: 'txt',
    metadata: {
      mimeType: 'text/plain',
      encoding: 'UTF-8',
      wordCount: 2345
    },
    storageProvider: 'supabase',
    lastAccessedAt: '2024-11-23T15:30:00.000Z'
  },
  {
    id: 'FILE-004',
    name: 'Client Proposal - ABC Corp.pdf',
    type: 'document',
    size: 5678901,
    url: '/files/client-proposal-abc-corp.pdf',
    uploadedAt: '2024-10-20T09:30:00.000Z',
    uploadedBy: MOCK_USERS[3],
    modifiedAt: '2024-11-10T13:45:00.000Z',
    folder: 'Documents',
    tags: ['proposal', 'client', 'abc-corp'],
    shared: true,
    starred: false,
    locked: false,
    downloads: 34,
    views: 89,
    version: 4,
    extension: 'pdf',
    description: 'Project proposal for ABC Corporation',
    sharedWith: ['user-001', 'user-005'],
    accessLevel: 'team',
    metadata: {
      mimeType: 'application/pdf',
      pageCount: 18,
      wordCount: 4567
    },
    storageProvider: 'supabase',
    lastAccessedAt: '2024-11-21T08:00:00.000Z'
  },
  {
    id: 'FILE-005',
    name: 'Marketing Strategy 2025.pptx',
    type: 'document',
    size: 8901234,
    url: '/files/marketing-strategy-2025.pptx',
    uploadedAt: '2024-09-30T11:20:00.000Z',
    uploadedBy: MOCK_USERS[4],
    modifiedAt: '2024-11-18T15:00:00.000Z',
    folder: 'Marketing',
    tags: ['marketing', 'strategy', 'presentation'],
    shared: true,
    starred: true,
    locked: false,
    downloads: 56,
    views: 178,
    version: 6,
    extension: 'pptx',
    description: 'Comprehensive marketing strategy presentation',
    sharedWith: ['user-001', 'user-002', 'user-003', 'user-006'],
    accessLevel: 'team',
    metadata: {
      mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      pageCount: 32
    },
    storageProvider: 'supabase',
    lastAccessedAt: '2024-11-25T10:45:00.000Z'
  },
  {
    id: 'FILE-006',
    name: 'Budget Analysis Q3.xlsx',
    type: 'document',
    size: 2345678,
    url: '/files/budget-analysis-q3.xlsx',
    uploadedAt: '2024-10-10T13:15:00.000Z',
    uploadedBy: MOCK_USERS[0],
    modifiedAt: '2024-11-12T09:30:00.000Z',
    folder: 'Documents',
    tags: ['budget', 'finance', 'analysis'],
    shared: false,
    starred: false,
    locked: true,
    downloads: 23,
    views: 67,
    version: 2,
    extension: 'xlsx',
    metadata: {
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    },
    storageProvider: 'supabase',
    lastAccessedAt: '2024-11-20T14:00:00.000Z'
  },
  {
    id: 'FILE-007',
    name: 'Employee Handbook 2024.pdf',
    type: 'document',
    size: 6789012,
    url: '/files/employee-handbook-2024.pdf',
    uploadedAt: '2024-08-15T10:00:00.000Z',
    uploadedBy: MOCK_USERS[5],
    modifiedAt: '2024-09-20T11:30:00.000Z',
    folder: 'HR',
    tags: ['hr', 'handbook', 'policy'],
    shared: true,
    starred: false,
    locked: true,
    downloads: 89,
    views: 234,
    version: 3,
    extension: 'pdf',
    description: 'Company employee handbook and policies',
    sharedWith: ['user-001', 'user-002', 'user-003', 'user-004', 'user-005'],
    accessLevel: 'team',
    metadata: {
      mimeType: 'application/pdf',
      pageCount: 56,
      wordCount: 15678
    },
    storageProvider: 'wasabi',
    isArchived: true,
    archivedAt: '2024-10-01T00:00:00.000Z',
    lastAccessedAt: '2024-11-15T16:20:00.000Z'
  },
  {
    id: 'FILE-008',
    name: 'Contract Template.docx',
    type: 'document',
    size: 1234567,
    url: '/files/contract-template.docx',
    uploadedAt: '2024-07-20T14:30:00.000Z',
    uploadedBy: MOCK_USERS[1],
    modifiedAt: '2024-08-15T10:45:00.000Z',
    folder: 'Legal',
    tags: ['legal', 'template', 'contract'],
    shared: false,
    starred: true,
    locked: true,
    downloads: 45,
    views: 123,
    version: 4,
    extension: 'docx',
    metadata: {
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      pageCount: 12,
      wordCount: 3456
    },
    storageProvider: 'wasabi',
    isArchived: true,
    archivedAt: '2024-09-01T00:00:00.000Z',
    lastAccessedAt: '2024-11-10T09:00:00.000Z'
  },
  {
    id: 'FILE-009',
    name: 'Product Roadmap 2025.pdf',
    type: 'document',
    size: 3456789,
    url: '/files/product-roadmap-2025.pdf',
    uploadedAt: '2024-11-08T09:00:00.000Z',
    uploadedBy: MOCK_USERS[2],
    modifiedAt: '2024-11-23T14:30:00.000Z',
    folder: 'Projects',
    tags: ['product', 'roadmap', 'planning'],
    shared: true,
    starred: true,
    locked: false,
    downloads: 78,
    views: 201,
    version: 7,
    extension: 'pdf',
    description: 'Product development roadmap for 2025',
    sharedWith: ['user-001', 'user-003', 'user-004', 'user-005'],
    accessLevel: 'team',
    metadata: {
      mimeType: 'application/pdf',
      pageCount: 28,
      wordCount: 6789
    },
    storageProvider: 'supabase',
    lastAccessedAt: '2024-11-26T08:30:00.000Z'
  },
  {
    id: 'FILE-010',
    name: 'Sales Report October.xlsx',
    type: 'document',
    size: 2345678,
    url: '/files/sales-report-october.xlsx',
    uploadedAt: '2024-11-02T11:30:00.000Z',
    uploadedBy: MOCK_USERS[3],
    modifiedAt: '2024-11-16T13:15:00.000Z',
    folder: 'Documents',
    tags: ['sales', 'report', 'october'],
    shared: true,
    starred: false,
    locked: false,
    downloads: 34,
    views: 92,
    version: 2,
    extension: 'xlsx',
    sharedWith: ['user-001', 'user-002'],
    accessLevel: 'team',
    metadata: {
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    },
    storageProvider: 'supabase',
    lastAccessedAt: '2024-11-22T10:00:00.000Z'
  },
  {
    id: 'FILE-011',
    name: 'Team Building Event Plan.docx',
    type: 'document',
    size: 987654,
    url: '/files/team-building-event-plan.docx',
    uploadedAt: '2024-10-25T15:00:00.000Z',
    uploadedBy: MOCK_USERS[4],
    modifiedAt: '2024-11-05T09:30:00.000Z',
    folder: 'HR',
    tags: ['hr', 'team-building', 'event'],
    shared: false,
    starred: false,
    locked: false,
    downloads: 18,
    views: 56,
    version: 3,
    extension: 'docx',
    metadata: {
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      pageCount: 8,
      wordCount: 1234
    },
    storageProvider: 'supabase',
    lastAccessedAt: '2024-11-19T14:00:00.000Z'
  },
  {
    id: 'FILE-012',
    name: 'Investor Presentation.pptx',
    type: 'document',
    size: 12345678,
    url: '/files/investor-presentation.pptx',
    uploadedAt: '2024-09-15T10:30:00.000Z',
    uploadedBy: MOCK_USERS[0],
    modifiedAt: '2024-10-20T14:45:00.000Z',
    folder: 'Documents',
    tags: ['investor', 'presentation', 'pitch'],
    shared: true,
    starred: true,
    locked: true,
    downloads: 92,
    views: 287,
    version: 8,
    extension: 'pptx',
    description: 'Investment pitch deck presentation',
    sharedWith: ['user-001', 'user-002'],
    accessLevel: 'private',
    metadata: {
      mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      pageCount: 42
    },
    storageProvider: 'wasabi',
    isArchived: true,
    archivedAt: '2024-11-01T00:00:00.000Z',
    lastAccessedAt: '2024-11-18T11:00:00.000Z'
  },
  {
    id: 'FILE-013',
    name: 'Risk Assessment Report.pdf',
    type: 'document',
    size: 4567890,
    url: '/files/risk-assessment-report.pdf',
    uploadedAt: '2024-10-05T13:00:00.000Z',
    uploadedBy: MOCK_USERS[1],
    modifiedAt: '2024-11-11T15:30:00.000Z',
    folder: 'Legal',
    tags: ['risk', 'assessment', 'compliance'],
    shared: false,
    starred: false,
    locked: true,
    downloads: 27,
    views: 73,
    version: 2,
    extension: 'pdf',
    metadata: {
      mimeType: 'application/pdf',
      pageCount: 34,
      wordCount: 8901
    },
    storageProvider: 'supabase',
    lastAccessedAt: '2024-11-17T10:30:00.000Z'
  },
  {
    id: 'FILE-014',
    name: 'Customer Feedback Analysis.xlsx',
    type: 'document',
    size: 3456789,
    url: '/files/customer-feedback-analysis.xlsx',
    uploadedAt: '2024-11-12T09:45:00.000Z',
    uploadedBy: MOCK_USERS[2],
    modifiedAt: '2024-11-24T11:20:00.000Z',
    folder: 'Marketing',
    tags: ['customer', 'feedback', 'analysis'],
    shared: true,
    starred: false,
    locked: false,
    downloads: 41,
    views: 118,
    version: 4,
    extension: 'xlsx',
    sharedWith: ['user-001', 'user-003', 'user-004'],
    accessLevel: 'team',
    metadata: {
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    },
    storageProvider: 'supabase',
    lastAccessedAt: '2024-11-25T13:45:00.000Z'
  },
  {
    id: 'FILE-015',
    name: 'Training Materials.pdf',
    type: 'document',
    size: 7890123,
    url: '/files/training-materials.pdf',
    uploadedAt: '2024-08-20T14:15:00.000Z',
    uploadedBy: MOCK_USERS[5],
    modifiedAt: '2024-09-10T10:00:00.000Z',
    folder: 'Resources',
    tags: ['training', 'education', 'materials'],
    shared: true,
    starred: false,
    locked: false,
    downloads: 156,
    views: 423,
    version: 3,
    extension: 'pdf',
    description: 'Comprehensive training materials for new hires',
    sharedWith: ['user-001', 'user-002', 'user-003', 'user-004', 'user-005', 'user-006'],
    accessLevel: 'team',
    metadata: {
      mimeType: 'application/pdf',
      pageCount: 67,
      wordCount: 18901
    },
    storageProvider: 'wasabi',
    isArchived: true,
    archivedAt: '2024-10-01T00:00:00.000Z',
    lastAccessedAt: '2024-11-13T09:30:00.000Z'
  },

  // IMAGES (12 files)
  {
    id: 'FILE-016',
    name: 'Company Logo 2024.png',
    type: 'image',
    size: 1234567,
    url: '/files/company-logo-2024.png',
    thumbnailUrl: '/thumbnails/company-logo-2024.png',
    uploadedAt: '2024-01-15T10:00:00.000Z',
    uploadedBy: MOCK_USERS[3],
    modifiedAt: '2024-03-20T14:30:00.000Z',
    folder: 'Images',
    tags: ['logo', 'branding', 'design'],
    shared: true,
    starred: true,
    locked: true,
    downloads: 234,
    views: 567,
    version: 4,
    extension: 'png',
    description: 'Official company logo',
    sharedWith: ['user-001', 'user-002', 'user-004', 'user-005'],
    accessLevel: 'team',
    metadata: {
      mimeType: 'image/png',
      dimensions: { width: 2048, height: 2048 }
    },
    storageProvider: 'supabase',
    lastAccessedAt: '2024-11-26T07:00:00.000Z'
  },
  {
    id: 'FILE-017',
    name: 'Product Mockup V3.jpg',
    type: 'image',
    size: 8901234,
    url: '/files/product-mockup-v3.jpg',
    thumbnailUrl: '/thumbnails/product-mockup-v3.jpg',
    uploadedAt: '2024-11-10T11:30:00.000Z',
    uploadedBy: MOCK_USERS[4],
    modifiedAt: '2024-11-22T15:45:00.000Z',
    folder: 'Designs',
    tags: ['mockup', 'product', 'design'],
    shared: true,
    starred: true,
    locked: false,
    downloads: 67,
    views: 189,
    version: 3,
    extension: 'jpg',
    description: 'Latest product design mockup',
    sharedWith: ['user-001', 'user-002', 'user-003'],
    accessLevel: 'team',
    metadata: {
      mimeType: 'image/jpeg',
      dimensions: { width: 3840, height: 2160 }
    },
    storageProvider: 'supabase',
    lastAccessedAt: '2024-11-25T16:30:00.000Z'
  },
  {
    id: 'FILE-018',
    name: 'Team Photo - Annual Retreat.jpg',
    type: 'image',
    size: 6789012,
    url: '/files/team-photo-annual-retreat.jpg',
    thumbnailUrl: '/thumbnails/team-photo-annual-retreat.jpg',
    uploadedAt: '2024-09-25T14:00:00.000Z',
    uploadedBy: MOCK_USERS[0],
    modifiedAt: '2024-09-25T14:00:00.000Z',
    folder: 'Images',
    tags: ['team', 'photo', 'retreat'],
    shared: true,
    starred: false,
    locked: false,
    downloads: 123,
    views: 345,
    version: 1,
    extension: 'jpg',
    sharedWith: ['user-001', 'user-002', 'user-003', 'user-004', 'user-005', 'user-006', 'user-007'],
    accessLevel: 'team',
    metadata: {
      mimeType: 'image/jpeg',
      dimensions: { width: 4096, height: 2731 }
    },
    storageProvider: 'wasabi',
    isArchived: true,
    archivedAt: '2024-10-25T00:00:00.000Z',
    lastAccessedAt: '2024-11-12T10:00:00.000Z'
  },
  {
    id: 'FILE-019',
    name: 'Website Banner - Holiday Sale.png',
    type: 'image',
    size: 4567890,
    url: '/files/website-banner-holiday-sale.png',
    thumbnailUrl: '/thumbnails/website-banner-holiday-sale.png',
    uploadedAt: '2024-11-15T09:30:00.000Z',
    uploadedBy: MOCK_USERS[1],
    modifiedAt: '2024-11-20T11:15:00.000Z',
    folder: 'Marketing',
    tags: ['banner', 'marketing', 'sale'],
    shared: true,
    starred: true,
    locked: false,
    downloads: 45,
    views: 134,
    version: 5,
    extension: 'png',
    description: 'Holiday sale promotional banner',
    sharedWith: ['user-001', 'user-004'],
    accessLevel: 'team',
    metadata: {
      mimeType: 'image/png',
      dimensions: { width: 1920, height: 600 }
    },
    storageProvider: 'supabase',
    lastAccessedAt: '2024-11-24T14:20:00.000Z'
  },
  {
    id: 'FILE-020',
    name: 'Infographic - Q3 Results.svg',
    type: 'image',
    size: 987654,
    url: '/files/infographic-q3-results.svg',
    thumbnailUrl: '/thumbnails/infographic-q3-results.svg',
    uploadedAt: '2024-10-12T10:45:00.000Z',
    uploadedBy: MOCK_USERS[2],
    modifiedAt: '2024-10-28T13:30:00.000Z',
    folder: 'Marketing',
    tags: ['infographic', 'results', 'data'],
    shared: false,
    starred: false,
    locked: false,
    downloads: 32,
    views: 87,
    version: 2,
    extension: 'svg',
    metadata: {
      mimeType: 'image/svg+xml',
      dimensions: { width: 1200, height: 1800 }
    },
    storageProvider: 'supabase',
    lastAccessedAt: '2024-11-18T09:45:00.000Z'
  },
  {
    id: 'FILE-021',
    name: 'Profile Picture - Sarah.jpg',
    type: 'image',
    size: 2345678,
    url: '/files/profile-picture-sarah.jpg',
    thumbnailUrl: '/thumbnails/profile-picture-sarah.jpg',
    uploadedAt: '2024-08-10T15:20:00.000Z',
    uploadedBy: MOCK_USERS[3],
    modifiedAt: '2024-08-10T15:20:00.000Z',
    folder: 'Images',
    tags: ['profile', 'photo', 'sarah'],
    shared: false,
    starred: false,
    locked: false,
    downloads: 12,
    views: 45,
    version: 1,
    extension: 'jpg',
    metadata: {
      mimeType: 'image/jpeg',
      dimensions: { width: 1024, height: 1024 }
    },
    storageProvider: 'wasabi',
    isArchived: true,
    archivedAt: '2024-09-10T00:00:00.000Z',
    lastAccessedAt: '2024-11-08T12:00:00.000Z'
  },
  {
    id: 'FILE-022',
    name: 'Office Space Photos.zip',
    type: 'archive',
    size: 45678901,
    url: '/files/office-space-photos.zip',
    uploadedAt: '2024-07-15T11:00:00.000Z',
    uploadedBy: MOCK_USERS[4],
    modifiedAt: '2024-07-15T11:00:00.000Z',
    folder: 'Archive',
    tags: ['office', 'photos', 'archive'],
    shared: false,
    starred: false,
    locked: false,
    downloads: 23,
    views: 56,
    version: 1,
    extension: 'zip',
    description: 'Collection of office space photos',
    metadata: {
      mimeType: 'application/zip',
      compression: 'deflate'
    },
    storageProvider: 'wasabi',
    isArchived: true,
    archivedAt: '2024-08-15T00:00:00.000Z',
    lastAccessedAt: '2024-11-05T10:30:00.000Z'
  },
  {
    id: 'FILE-023',
    name: 'Product Screenshot 1.png',
    type: 'image',
    size: 3456789,
    url: '/files/product-screenshot-1.png',
    thumbnailUrl: '/thumbnails/product-screenshot-1.png',
    uploadedAt: '2024-11-18T13:15:00.000Z',
    uploadedBy: MOCK_USERS[0],
    modifiedAt: '2024-11-18T13:15:00.000Z',
    folder: 'Projects',
    tags: ['screenshot', 'product', 'ui'],
    shared: true,
    starred: false,
    locked: false,
    downloads: 28,
    views: 76,
    version: 1,
    extension: 'png',
    sharedWith: ['user-002', 'user-003'],
    accessLevel: 'team',
    metadata: {
      mimeType: 'image/png',
      dimensions: { width: 2560, height: 1440 }
    },
    storageProvider: 'supabase',
    lastAccessedAt: '2024-11-23T11:00:00.000Z'
  },
  {
    id: 'FILE-024',
    name: 'Social Media Graphics Pack.zip',
    type: 'archive',
    size: 23456789,
    url: '/files/social-media-graphics-pack.zip',
    uploadedAt: '2024-10-08T09:45:00.000Z',
    uploadedBy: MOCK_USERS[1],
    modifiedAt: '2024-10-08T09:45:00.000Z',
    folder: 'Marketing',
    tags: ['social-media', 'graphics', 'marketing'],
    shared: true,
    starred: false,
    locked: false,
    downloads: 67,
    views: 145,
    version: 1,
    extension: 'zip',
    description: 'Social media graphics template pack',
    sharedWith: ['user-001', 'user-004', 'user-005'],
    accessLevel: 'team',
    metadata: {
      mimeType: 'application/zip',
      compression: 'deflate'
    },
    storageProvider: 'wasabi',
    isArchived: true,
    archivedAt: '2024-11-08T00:00:00.000Z',
    lastAccessedAt: '2024-11-16T14:30:00.000Z'
  },
  {
    id: 'FILE-025',
    name: 'UI Wireframe Dashboard.png',
    type: 'image',
    size: 5678901,
    url: '/files/ui-wireframe-dashboard.png',
    thumbnailUrl: '/thumbnails/ui-wireframe-dashboard.png',
    uploadedAt: '2024-11-05T10:30:00.000Z',
    uploadedBy: MOCK_USERS[2],
    modifiedAt: '2024-11-19T14:45:00.000Z',
    folder: 'Designs',
    tags: ['wireframe', 'ui', 'dashboard'],
    shared: true,
    starred: true,
    locked: false,
    downloads: 42,
    views: 128,
    version: 6,
    extension: 'png',
    description: 'Dashboard UI wireframe design',
    sharedWith: ['user-001', 'user-003', 'user-004'],
    accessLevel: 'team',
    metadata: {
      mimeType: 'image/png',
      dimensions: { width: 3200, height: 2000 }
    },
    storageProvider: 'supabase',
    lastAccessedAt: '2024-11-25T09:20:00.000Z'
  },
  {
    id: 'FILE-026',
    name: 'Brand Guidelines Assets.zip',
    type: 'archive',
    size: 34567890,
    url: '/files/brand-guidelines-assets.zip',
    uploadedAt: '2024-06-20T14:00:00.000Z',
    uploadedBy: MOCK_USERS[3],
    modifiedAt: '2024-06-20T14:00:00.000Z',
    folder: 'Resources',
    tags: ['brand', 'guidelines', 'assets'],
    shared: true,
    starred: false,
    locked: true,
    downloads: 189,
    views: 456,
    version: 1,
    extension: 'zip',
    description: 'Complete brand guidelines and asset package',
    sharedWith: ['user-001', 'user-002', 'user-003', 'user-004', 'user-005'],
    accessLevel: 'team',
    metadata: {
      mimeType: 'application/zip',
      compression: 'deflate'
    },
    storageProvider: 'wasabi',
    isArchived: true,
    archivedAt: '2024-07-20T00:00:00.000Z',
    lastAccessedAt: '2024-11-10T11:15:00.000Z'
  },
  {
    id: 'FILE-027',
    name: 'Event Banner Design.jpg',
    type: 'image',
    size: 7890123,
    url: '/files/event-banner-design.jpg',
    thumbnailUrl: '/thumbnails/event-banner-design.jpg',
    uploadedAt: '2024-11-20T12:00:00.000Z',
    uploadedBy: MOCK_USERS[4],
    modifiedAt: '2024-11-23T10:30:00.000Z',
    folder: 'Marketing',
    tags: ['event', 'banner', 'design'],
    shared: true,
    starred: false,
    locked: false,
    downloads: 34,
    views: 92,
    version: 3,
    extension: 'jpg',
    sharedWith: ['user-001', 'user-002'],
    accessLevel: 'team',
    metadata: {
      mimeType: 'image/jpeg',
      dimensions: { width: 2400, height: 1200 }
    },
    storageProvider: 'supabase',
    lastAccessedAt: '2024-11-24T15:45:00.000Z'
  },

  // VIDEOS (8 files)
  {
    id: 'FILE-028',
    name: 'Product Demo Video.mp4',
    type: 'video',
    size: 123456789,
    url: '/files/product-demo-video.mp4',
    thumbnailUrl: '/thumbnails/product-demo-video.jpg',
    uploadedAt: '2024-10-15T09:00:00.000Z',
    uploadedBy: MOCK_USERS[0],
    modifiedAt: '2024-11-01T11:30:00.000Z',
    folder: 'Videos',
    tags: ['demo', 'product', 'video'],
    shared: true,
    starred: true,
    locked: false,
    downloads: 234,
    views: 678,
    version: 4,
    extension: 'mp4',
    description: 'Comprehensive product demonstration video',
    sharedWith: ['user-001', 'user-002', 'user-003', 'user-004', 'user-005'],
    accessLevel: 'public',
    metadata: {
      mimeType: 'video/mp4',
      dimensions: { width: 1920, height: 1080 },
      duration: 324 // 5:24 minutes
    },
    storageProvider: 'wasabi',
    isArchived: false,
    lastAccessedAt: '2024-11-25T14:00:00.000Z'
  },
  {
    id: 'FILE-029',
    name: 'Webinar Recording - Nov 2024.mp4',
    type: 'video',
    size: 234567890,
    url: '/files/webinar-recording-nov-2024.mp4',
    thumbnailUrl: '/thumbnails/webinar-recording-nov-2024.jpg',
    uploadedAt: '2024-11-12T15:30:00.000Z',
    uploadedBy: MOCK_USERS[1],
    modifiedAt: '2024-11-12T15:30:00.000Z',
    folder: 'Videos',
    tags: ['webinar', 'recording', 'november'],
    shared: true,
    starred: false,
    locked: false,
    downloads: 89,
    views: 267,
    version: 1,
    extension: 'mp4',
    sharedWith: ['user-001', 'user-002', 'user-003', 'user-004', 'user-005', 'user-006'],
    accessLevel: 'team',
    metadata: {
      mimeType: 'video/mp4',
      dimensions: { width: 1920, height: 1080 },
      duration: 3620 // 1:00:20 hours
    },
    storageProvider: 'wasabi',
    isArchived: false,
    lastAccessedAt: '2024-11-23T16:30:00.000Z'
  },
  {
    id: 'FILE-030',
    name: 'Training Tutorial Part 1.mov',
    type: 'video',
    size: 345678901,
    url: '/files/training-tutorial-part-1.mov',
    thumbnailUrl: '/thumbnails/training-tutorial-part-1.jpg',
    uploadedAt: '2024-09-20T10:15:00.000Z',
    uploadedBy: MOCK_USERS[2],
    modifiedAt: '2024-09-20T10:15:00.000Z',
    folder: 'Resources',
    tags: ['training', 'tutorial', 'education'],
    shared: true,
    starred: false,
    locked: false,
    downloads: 156,
    views: 423,
    version: 1,
    extension: 'mov',
    description: 'Employee training tutorial - Part 1',
    sharedWith: ['user-001', 'user-002', 'user-003', 'user-004', 'user-005', 'user-006', 'user-007'],
    accessLevel: 'team',
    metadata: {
      mimeType: 'video/quicktime',
      dimensions: { width: 1920, height: 1080 },
      duration: 1845 // 30:45 minutes
    },
    storageProvider: 'wasabi',
    isArchived: true,
    archivedAt: '2024-10-20T00:00:00.000Z',
    lastAccessedAt: '2024-11-14T10:00:00.000Z'
  },
  {
    id: 'FILE-031',
    name: 'Conference Keynote 2024.mp4',
    type: 'video',
    size: 456789012,
    url: '/files/conference-keynote-2024.mp4',
    thumbnailUrl: '/thumbnails/conference-keynote-2024.jpg',
    uploadedAt: '2024-08-05T13:45:00.000Z',
    uploadedBy: MOCK_USERS[3],
    modifiedAt: '2024-08-05T13:45:00.000Z',
    folder: 'Archive',
    tags: ['conference', 'keynote', 'presentation'],
    shared: false,
    starred: true,
    locked: true,
    downloads: 67,
    views: 189,
    version: 1,
    extension: 'mp4',
    metadata: {
      mimeType: 'video/mp4',
      dimensions: { width: 3840, height: 2160 },
      duration: 2734 // 45:34 minutes
    },
    storageProvider: 'wasabi',
    isArchived: true,
    archivedAt: '2024-09-05T00:00:00.000Z',
    lastAccessedAt: '2024-11-07T15:20:00.000Z'
  },
  {
    id: 'FILE-032',
    name: 'Behind the Scenes.avi',
    type: 'video',
    size: 567890123,
    url: '/files/behind-the-scenes.avi',
    thumbnailUrl: '/thumbnails/behind-the-scenes.jpg',
    uploadedAt: '2024-07-10T11:30:00.000Z',
    uploadedBy: MOCK_USERS[4],
    modifiedAt: '2024-07-10T11:30:00.000Z',
    folder: 'Archive',
    tags: ['behind-the-scenes', 'video', 'team'],
    shared: false,
    starred: false,
    locked: false,
    downloads: 34,
    views: 92,
    version: 1,
    extension: 'avi',
    metadata: {
      mimeType: 'video/x-msvideo',
      dimensions: { width: 1920, height: 1080 },
      duration: 1523 // 25:23 minutes
    },
    storageProvider: 'wasabi',
    isArchived: true,
    archivedAt: '2024-08-10T00:00:00.000Z',
    lastAccessedAt: '2024-10-28T09:45:00.000Z'
  },
  {
    id: 'FILE-033',
    name: 'Product Launch Event.mkv',
    type: 'video',
    size: 678901234,
    url: '/files/product-launch-event.mkv',
    thumbnailUrl: '/thumbnails/product-launch-event.jpg',
    uploadedAt: '2024-06-15T14:00:00.000Z',
    uploadedBy: MOCK_USERS[0],
    modifiedAt: '2024-06-15T14:00:00.000Z',
    folder: 'Archive',
    tags: ['launch', 'event', 'product'],
    shared: true,
    starred: false,
    locked: false,
    downloads: 123,
    views: 345,
    version: 1,
    extension: 'mkv',
    description: 'Product launch event recording',
    sharedWith: ['user-001', 'user-002', 'user-003'],
    accessLevel: 'team',
    metadata: {
      mimeType: 'video/x-matroska',
      dimensions: { width: 3840, height: 2160 },
      duration: 4567 // 1:16:07 hours
    },
    storageProvider: 'wasabi',
    isArchived: true,
    archivedAt: '2024-07-15T00:00:00.000Z',
    lastAccessedAt: '2024-10-22T13:00:00.000Z'
  },
  {
    id: 'FILE-034',
    name: 'Customer Testimonials.mp4',
    type: 'video',
    size: 89012345,
    url: '/files/customer-testimonials.mp4',
    thumbnailUrl: '/thumbnails/customer-testimonials.jpg',
    uploadedAt: '2024-11-08T10:00:00.000Z',
    uploadedBy: MOCK_USERS[1],
    modifiedAt: '2024-11-18T14:30:00.000Z',
    folder: 'Marketing',
    tags: ['testimonials', 'customer', 'marketing'],
    shared: true,
    starred: true,
    locked: false,
    downloads: 78,
    views: 234,
    version: 2,
    extension: 'mp4',
    description: 'Customer testimonial compilation',
    sharedWith: ['user-001', 'user-004', 'user-005'],
    accessLevel: 'public',
    metadata: {
      mimeType: 'video/mp4',
      dimensions: { width: 1920, height: 1080 },
      duration: 456 // 7:36 minutes
    },
    storageProvider: 'supabase',
    lastAccessedAt: '2024-11-24T11:45:00.000Z'
  },
  {
    id: 'FILE-035',
    name: 'How-To Guide Video.mp4',
    type: 'video',
    size: 123456789,
    url: '/files/how-to-guide-video.mp4',
    thumbnailUrl: '/thumbnails/how-to-guide-video.jpg',
    uploadedAt: '2024-10-28T09:30:00.000Z',
    uploadedBy: MOCK_USERS[2],
    modifiedAt: '2024-11-15T11:00:00.000Z',
    folder: 'Resources',
    tags: ['how-to', 'guide', 'tutorial'],
    shared: true,
    starred: false,
    locked: false,
    downloads: 145,
    views: 389,
    version: 3,
    extension: 'mp4',
    sharedWith: ['user-001', 'user-002', 'user-003', 'user-004', 'user-005'],
    accessLevel: 'team',
    metadata: {
      mimeType: 'video/mp4',
      dimensions: { width: 1920, height: 1080 },
      duration: 678 // 11:18 minutes
    },
    storageProvider: 'wasabi',
    lastAccessedAt: '2024-11-22T15:30:00.000Z'
  },

  // AUDIO (5 files)
  {
    id: 'FILE-036',
    name: 'Podcast Episode 12.mp3',
    type: 'audio',
    size: 12345678,
    url: '/files/podcast-episode-12.mp3',
    uploadedAt: '2024-11-01T08:00:00.000Z',
    uploadedBy: MOCK_USERS[3],
    modifiedAt: '2024-11-01T08:00:00.000Z',
    folder: 'Downloads',
    tags: ['podcast', 'audio', 'episode'],
    shared: true,
    starred: false,
    locked: false,
    downloads: 234,
    views: 567,
    version: 1,
    extension: 'mp3',
    sharedWith: ['user-001', 'user-002', 'user-003', 'user-004'],
    accessLevel: 'public',
    metadata: {
      mimeType: 'audio/mpeg',
      duration: 3245 // 54:05 minutes
    },
    storageProvider: 'wasabi',
    lastAccessedAt: '2024-11-20T10:30:00.000Z'
  },
  {
    id: 'FILE-037',
    name: 'Meeting Recording Oct 25.wav',
    type: 'audio',
    size: 45678901,
    url: '/files/meeting-recording-oct-25.wav',
    uploadedAt: '2024-10-25T15:00:00.000Z',
    uploadedBy: MOCK_USERS[4],
    modifiedAt: '2024-10-25T15:00:00.000Z',
    folder: 'Downloads',
    tags: ['meeting', 'recording', 'audio'],
    shared: false,
    starred: false,
    locked: false,
    downloads: 12,
    views: 34,
    version: 1,
    extension: 'wav',
    metadata: {
      mimeType: 'audio/wav',
      duration: 2567 // 42:47 minutes
    },
    storageProvider: 'wasabi',
    isArchived: true,
    archivedAt: '2024-11-25T00:00:00.000Z',
    lastAccessedAt: '2024-11-18T13:15:00.000Z'
  },
  {
    id: 'FILE-038',
    name: 'Voice Memo - Ideas.m4a',
    type: 'audio',
    size: 5678901,
    url: '/files/voice-memo-ideas.m4a',
    uploadedAt: '2024-11-10T16:30:00.000Z',
    uploadedBy: MOCK_USERS[0],
    modifiedAt: '2024-11-10T16:30:00.000Z',
    folder: 'Downloads',
    tags: ['voice-memo', 'ideas', 'notes'],
    shared: false,
    starred: true,
    locked: false,
    downloads: 5,
    views: 12,
    version: 1,
    extension: 'm4a',
    metadata: {
      mimeType: 'audio/mp4',
      duration: 234 // 3:54 minutes
    },
    storageProvider: 'supabase',
    lastAccessedAt: '2024-11-23T09:00:00.000Z'
  },
  {
    id: 'FILE-039',
    name: 'Background Music Track.flac',
    type: 'audio',
    size: 34567890,
    url: '/files/background-music-track.flac',
    uploadedAt: '2024-09-15T11:45:00.000Z',
    uploadedBy: MOCK_USERS[1],
    modifiedAt: '2024-09-15T11:45:00.000Z',
    folder: 'Resources',
    tags: ['music', 'background', 'audio'],
    shared: true,
    starred: false,
    locked: false,
    downloads: 67,
    views: 145,
    version: 1,
    extension: 'flac',
    sharedWith: ['user-001', 'user-002'],
    accessLevel: 'team',
    metadata: {
      mimeType: 'audio/flac',
      duration: 187 // 3:07 minutes
    },
    storageProvider: 'wasabi',
    isArchived: true,
    archivedAt: '2024-10-15T00:00:00.000Z',
    lastAccessedAt: '2024-11-12T14:20:00.000Z'
  },
  {
    id: 'FILE-040',
    name: 'Sound Effects Library.zip',
    type: 'archive',
    size: 123456789,
    url: '/files/sound-effects-library.zip',
    uploadedAt: '2024-08-20T10:00:00.000Z',
    uploadedBy: MOCK_USERS[2],
    modifiedAt: '2024-08-20T10:00:00.000Z',
    folder: 'Archive',
    tags: ['sound-effects', 'audio', 'library'],
    shared: false,
    starred: false,
    locked: false,
    downloads: 45,
    views: 89,
    version: 1,
    extension: 'zip',
    description: 'Complete sound effects library collection',
    metadata: {
      mimeType: 'application/zip',
      compression: 'deflate'
    },
    storageProvider: 'wasabi',
    isArchived: true,
    archivedAt: '2024-09-20T00:00:00.000Z',
    lastAccessedAt: '2024-11-05T11:30:00.000Z'
  },

  // CODE (22 files)
  {
    id: 'FILE-041',
    name: 'main.tsx',
    type: 'code',
    size: 234567,
    url: '/files/main.tsx',
    uploadedAt: '2024-11-20T10:00:00.000Z',
    uploadedBy: MOCK_USERS[3],
    modifiedAt: '2024-11-25T14:30:00.000Z',
    folder: 'Code',
    tags: ['typescript', 'react', 'main'],
    shared: true,
    starred: true,
    locked: false,
    downloads: 56,
    views: 178,
    version: 12,
    extension: 'tsx',
    description: 'Main application entry point',
    sharedWith: ['user-001', 'user-002', 'user-003'],
    accessLevel: 'team',
    metadata: {
      mimeType: 'text/typescript',
      language: 'typescript',
      wordCount: 3456
    },
    storageProvider: 'supabase',
    lastAccessedAt: '2024-11-26T08:00:00.000Z'
  },
  {
    id: 'FILE-042',
    name: 'api-handler.js',
    type: 'code',
    size: 123456,
    url: '/files/api-handler.js',
    uploadedAt: '2024-11-15T09:30:00.000Z',
    uploadedBy: MOCK_USERS[4],
    modifiedAt: '2024-11-23T11:15:00.000Z',
    folder: 'Code',
    tags: ['javascript', 'api', 'backend'],
    shared: true,
    starred: false,
    locked: false,
    downloads: 34,
    views: 92,
    version: 8,
    extension: 'js',
    sharedWith: ['user-001', 'user-003'],
    accessLevel: 'team',
    metadata: {
      mimeType: 'text/javascript',
      language: 'javascript',
      wordCount: 2345
    },
    storageProvider: 'supabase',
    lastAccessedAt: '2024-11-24T13:00:00.000Z'
  },
  {
    id: 'FILE-043',
    name: 'database-schema.sql',
    type: 'code',
    size: 345678,
    url: '/files/database-schema.sql',
    uploadedAt: '2024-10-20T14:00:00.000Z',
    uploadedBy: MOCK_USERS[0],
    modifiedAt: '2024-11-18T10:30:00.000Z',
    folder: 'Code',
    tags: ['sql', 'database', 'schema'],
    shared: false,
    starred: true,
    locked: true,
    downloads: 23,
    views: 67,
    version: 5,
    extension: 'sql',
    metadata: {
      mimeType: 'application/sql',
      language: 'sql',
      wordCount: 4567
    },
    storageProvider: 'supabase',
    lastAccessedAt: '2024-11-22T09:45:00.000Z'
  },
  {
    id: 'FILE-044',
    name: 'utils.py',
    type: 'code',
    size: 456789,
    url: '/files/utils.py',
    uploadedAt: '2024-11-10T11:00:00.000Z',
    uploadedBy: MOCK_USERS[1],
    modifiedAt: '2024-11-21T15:45:00.000Z',
    folder: 'Code',
    tags: ['python', 'utilities', 'helper'],
    shared: true,
    starred: false,
    locked: false,
    downloads: 45,
    views: 123,
    version: 9,
    extension: 'py',
    sharedWith: ['user-002', 'user-003', 'user-004'],
    accessLevel: 'team',
    metadata: {
      mimeType: 'text/x-python',
      language: 'python',
      wordCount: 5678
    },
    storageProvider: 'supabase',
    lastAccessedAt: '2024-11-25T10:30:00.000Z'
  },
  {
    id: 'FILE-045',
    name: 'config.json',
    type: 'code',
    size: 12345,
    url: '/files/config.json',
    uploadedAt: '2024-11-01T08:30:00.000Z',
    uploadedBy: MOCK_USERS[2],
    modifiedAt: '2024-11-19T09:00:00.000Z',
    folder: 'Code',
    tags: ['config', 'json', 'settings'],
    shared: false,
    starred: false,
    locked: true,
    downloads: 12,
    views: 34,
    version: 3,
    extension: 'json',
    metadata: {
      mimeType: 'application/json',
      language: 'json',
      wordCount: 234
    },
    storageProvider: 'supabase',
    lastAccessedAt: '2024-11-20T11:00:00.000Z'
  },
  {
    id: 'FILE-046',
    name: 'styles.css',
    type: 'code',
    size: 234567,
    url: '/files/styles.css',
    uploadedAt: '2024-11-12T10:45:00.000Z',
    uploadedBy: MOCK_USERS[3],
    modifiedAt: '2024-11-24T14:15:00.000Z',
    folder: 'Code',
    tags: ['css', 'styles', 'frontend'],
    shared: true,
    starred: false,
    locked: false,
    downloads: 28,
    views: 76,
    version: 7,
    extension: 'css',
    sharedWith: ['user-001', 'user-004'],
    accessLevel: 'team',
    metadata: {
      mimeType: 'text/css',
      language: 'css',
      wordCount: 3456
    },
    storageProvider: 'supabase',
    lastAccessedAt: '2024-11-23T16:00:00.000Z'
  },
  {
    id: 'FILE-047',
    name: 'test-suite.spec.ts',
    type: 'code',
    size: 567890,
    url: '/files/test-suite.spec.ts',
    uploadedAt: '2024-11-08T13:00:00.000Z',
    uploadedBy: MOCK_USERS[4],
    modifiedAt: '2024-11-22T10:45:00.000Z',
    folder: 'Code',
    tags: ['test', 'typescript', 'testing'],
    shared: true,
    starred: true,
    locked: false,
    downloads: 41,
    views: 134,
    version: 11,
    extension: 'ts',
    sharedWith: ['user-001', 'user-002', 'user-003'],
    accessLevel: 'team',
    metadata: {
      mimeType: 'text/typescript',
      language: 'typescript',
      wordCount: 6789
    },
    storageProvider: 'supabase',
    lastAccessedAt: '2024-11-25T12:30:00.000Z'
  },
  {
    id: 'FILE-048',
    name: 'README.md',
    type: 'code',
    size: 45678,
    url: '/files/readme.md',
    uploadedAt: '2024-10-15T09:00:00.000Z',
    uploadedBy: MOCK_USERS[0],
    modifiedAt: '2024-11-20T11:30:00.000Z',
    folder: 'Code',
    tags: ['documentation', 'readme', 'markdown'],
    shared: true,
    starred: false,
    locked: false,
    downloads: 89,
    views: 234,
    version: 6,
    extension: 'md',
    sharedWith: ['user-001', 'user-002', 'user-003', 'user-004', 'user-005'],
    accessLevel: 'public',
    metadata: {
      mimeType: 'text/markdown',
      language: 'markdown',
      wordCount: 1234
    },
    storageProvider: 'supabase',
    lastAccessedAt: '2024-11-24T09:15:00.000Z'
  },
  {
    id: 'FILE-049',
    name: 'dockerfile',
    type: 'code',
    size: 23456,
    url: '/files/dockerfile',
    uploadedAt: '2024-10-10T14:30:00.000Z',
    uploadedBy: MOCK_USERS[1],
    modifiedAt: '2024-11-15T10:00:00.000Z',
    folder: 'Code',
    tags: ['docker', 'container', 'devops'],
    shared: true,
    starred: false,
    locked: false,
    downloads: 34,
    views: 89,
    version: 4,
    extension: 'dockerfile',
    sharedWith: ['user-001', 'user-003'],
    accessLevel: 'team',
    metadata: {
      mimeType: 'text/plain',
      language: 'dockerfile',
      wordCount: 345
    },
    storageProvider: 'supabase',
    lastAccessedAt: '2024-11-21T14:45:00.000Z'
  },
  {
    id: 'FILE-050',
    name: 'package.json',
    type: 'code',
    size: 12345,
    url: '/files/package.json',
    uploadedAt: '2024-11-05T10:00:00.000Z',
    uploadedBy: MOCK_USERS[2],
    modifiedAt: '2024-11-23T13:30:00.000Z',
    folder: 'Code',
    tags: ['npm', 'package', 'dependencies'],
    shared: false,
    starred: true,
    locked: true,
    downloads: 23,
    views: 67,
    version: 15,
    extension: 'json',
    metadata: {
      mimeType: 'application/json',
      language: 'json',
      wordCount: 456
    },
    storageProvider: 'supabase',
    lastAccessedAt: '2024-11-25T11:00:00.000Z'
  },
  {
    id: 'FILE-051',
    name: 'component.jsx',
    type: 'code',
    size: 345678,
    url: '/files/component.jsx',
    uploadedAt: '2024-11-18T11:30:00.000Z',
    uploadedBy: MOCK_USERS[3],
    modifiedAt: '2024-11-24T15:00:00.000Z',
    folder: 'Code',
    tags: ['react', 'component', 'jsx'],
    shared: true,
    starred: true,
    locked: false,
    downloads: 45,
    views: 123,
    version: 6,
    extension: 'jsx',
    sharedWith: ['user-001', 'user-002'],
    accessLevel: 'team',
    metadata: {
      mimeType: 'text/javascript',
      language: 'javascript',
      wordCount: 4567
    },
    storageProvider: 'supabase',
    lastAccessedAt: '2024-11-25T16:15:00.000Z'
  },
  {
    id: 'FILE-052',
    name: 'routes.rb',
    type: 'code',
    size: 123456,
    url: '/files/routes.rb',
    uploadedAt: '2024-09-20T09:00:00.000Z',
    uploadedBy: MOCK_USERS[4],
    modifiedAt: '2024-10-15T11:30:00.000Z',
    folder: 'Archive',
    tags: ['ruby', 'routes', 'backend'],
    shared: false,
    starred: false,
    locked: false,
    downloads: 12,
    views: 34,
    version: 3,
    extension: 'rb',
    metadata: {
      mimeType: 'text/x-ruby',
      language: 'ruby',
      wordCount: 2345
    },
    storageProvider: 'wasabi',
    isArchived: true,
    archivedAt: '2024-10-20T00:00:00.000Z',
    lastAccessedAt: '2024-11-08T10:30:00.000Z'
  },
  {
    id: 'FILE-053',
    name: 'server.go',
    type: 'code',
    size: 234567,
    url: '/files/server.go',
    uploadedAt: '2024-10-25T14:00:00.000Z',
    uploadedBy: MOCK_USERS[0],
    modifiedAt: '2024-11-17T10:30:00.000Z',
    folder: 'Code',
    tags: ['golang', 'server', 'backend'],
    shared: true,
    starred: false,
    locked: false,
    downloads: 28,
    views: 78,
    version: 5,
    extension: 'go',
    sharedWith: ['user-002', 'user-003'],
    accessLevel: 'team',
    metadata: {
      mimeType: 'text/x-go',
      language: 'go',
      wordCount: 3456
    },
    storageProvider: 'supabase',
    lastAccessedAt: '2024-11-23T14:00:00.000Z'
  },
  {
    id: 'FILE-054',
    name: 'Application.java',
    type: 'code',
    size: 456789,
    url: '/files/application.java',
    uploadedAt: '2024-08-15T10:00:00.000Z',
    uploadedBy: MOCK_USERS[1],
    modifiedAt: '2024-09-20T13:30:00.000Z',
    folder: 'Archive',
    tags: ['java', 'spring', 'backend'],
    shared: false,
    starred: false,
    locked: false,
    downloads: 15,
    views: 45,
    version: 2,
    extension: 'java',
    metadata: {
      mimeType: 'text/x-java',
      language: 'java',
      wordCount: 5678
    },
    storageProvider: 'wasabi',
    isArchived: true,
    archivedAt: '2024-09-25T00:00:00.000Z',
    lastAccessedAt: '2024-11-02T09:00:00.000Z'
  },
  {
    id: 'FILE-055',
    name: 'script.sh',
    type: 'code',
    size: 34567,
    url: '/files/script.sh',
    uploadedAt: '2024-11-14T13:00:00.000Z',
    uploadedBy: MOCK_USERS[2],
    modifiedAt: '2024-11-22T09:30:00.000Z',
    folder: 'Code',
    tags: ['bash', 'script', 'automation'],
    shared: true,
    starred: false,
    locked: false,
    downloads: 34,
    views: 87,
    version: 4,
    extension: 'sh',
    sharedWith: ['user-001', 'user-003', 'user-004'],
    accessLevel: 'team',
    metadata: {
      mimeType: 'text/x-shellscript',
      language: 'bash',
      wordCount: 567
    },
    storageProvider: 'supabase',
    lastAccessedAt: '2024-11-24T10:00:00.000Z'
  },
  {
    id: 'FILE-056',
    name: 'model.cpp',
    type: 'code',
    size: 567890,
    url: '/files/model.cpp',
    uploadedAt: '2024-07-10T09:30:00.000Z',
    uploadedBy: MOCK_USERS[3],
    modifiedAt: '2024-08-15T11:00:00.000Z',
    folder: 'Archive',
    tags: ['cpp', 'c++', 'model'],
    shared: false,
    starred: false,
    locked: false,
    downloads: 8,
    views: 23,
    version: 2,
    extension: 'cpp',
    metadata: {
      mimeType: 'text/x-c++',
      language: 'cpp',
      wordCount: 6789
    },
    storageProvider: 'wasabi',
    isArchived: true,
    archivedAt: '2024-08-20T00:00:00.000Z',
    lastAccessedAt: '2024-10-15T14:30:00.000Z'
  },
  {
    id: 'FILE-057',
    name: 'index.html',
    type: 'code',
    size: 123456,
    url: '/files/index.html',
    uploadedAt: '2024-11-10T10:00:00.000Z',
    uploadedBy: MOCK_USERS[4],
    modifiedAt: '2024-11-23T14:30:00.000Z',
    folder: 'Code',
    tags: ['html', 'frontend', 'web'],
    shared: true,
    starred: false,
    locked: false,
    downloads: 67,
    views: 189,
    version: 8,
    extension: 'html',
    sharedWith: ['user-001', 'user-002', 'user-004'],
    accessLevel: 'team',
    metadata: {
      mimeType: 'text/html',
      language: 'html',
      wordCount: 2345
    },
    storageProvider: 'supabase',
    lastAccessedAt: '2024-11-25T09:45:00.000Z'
  },
  {
    id: 'FILE-058',
    name: 'webpack.config.js',
    type: 'code',
    size: 45678,
    url: '/files/webpack.config.js',
    uploadedAt: '2024-10-20T11:00:00.000Z',
    uploadedBy: MOCK_USERS[0],
    modifiedAt: '2024-11-15T13:30:00.000Z',
    folder: 'Code',
    tags: ['webpack', 'config', 'build'],
    shared: false,
    starred: true,
    locked: false,
    downloads: 23,
    views: 56,
    version: 5,
    extension: 'js',
    metadata: {
      mimeType: 'text/javascript',
      language: 'javascript',
      wordCount: 678
    },
    storageProvider: 'supabase',
    lastAccessedAt: '2024-11-21T10:15:00.000Z'
  },
  {
    id: 'FILE-059',
    name: 'middleware.ts',
    type: 'code',
    size: 234567,
    url: '/files/middleware.ts',
    uploadedAt: '2024-11-16T09:00:00.000Z',
    uploadedBy: MOCK_USERS[1],
    modifiedAt: '2024-11-24T11:00:00.000Z',
    folder: 'Code',
    tags: ['typescript', 'middleware', 'backend'],
    shared: true,
    starred: true,
    locked: false,
    downloads: 38,
    views: 102,
    version: 7,
    extension: 'ts',
    sharedWith: ['user-001', 'user-003'],
    accessLevel: 'team',
    metadata: {
      mimeType: 'text/typescript',
      language: 'typescript',
      wordCount: 3456
    },
    storageProvider: 'supabase',
    lastAccessedAt: '2024-11-25T14:00:00.000Z'
  },
  {
    id: 'FILE-060',
    name: 'graphql-schema.graphql',
    type: 'code',
    size: 123456,
    url: '/files/graphql-schema.graphql',
    uploadedAt: '2024-10-05T14:00:00.000Z',
    uploadedBy: MOCK_USERS[2],
    modifiedAt: '2024-11-12T10:30:00.000Z',
    folder: 'Code',
    tags: ['graphql', 'schema', 'api'],
    shared: true,
    starred: false,
    locked: false,
    downloads: 45,
    views: 123,
    version: 6,
    extension: 'graphql',
    sharedWith: ['user-001', 'user-002', 'user-003', 'user-004'],
    accessLevel: 'team',
    metadata: {
      mimeType: 'application/graphql',
      language: 'graphql',
      wordCount: 2345
    },
    storageProvider: 'supabase',
    lastAccessedAt: '2024-11-22T13:45:00.000Z'
  },
  {
    id: 'FILE-061',
    name: 'nginx.conf',
    type: 'code',
    size: 34567,
    url: '/files/nginx.conf',
    uploadedAt: '2024-09-15T10:00:00.000Z',
    uploadedBy: MOCK_USERS[3],
    modifiedAt: '2024-10-20T11:30:00.000Z',
    folder: 'Code',
    tags: ['nginx', 'config', 'server'],
    shared: false,
    starred: false,
    locked: true,
    downloads: 18,
    views: 45,
    version: 3,
    extension: 'conf',
    metadata: {
      mimeType: 'text/plain',
      language: 'nginx',
      wordCount: 456
    },
    storageProvider: 'supabase',
    lastAccessedAt: '2024-11-18T15:00:00.000Z'
  },
  {
    id: 'FILE-062',
    name: '.env.example',
    type: 'code',
    size: 12345,
    url: '/files/.env.example',
    uploadedAt: '2024-11-01T09:00:00.000Z',
    uploadedBy: MOCK_USERS[4],
    modifiedAt: '2024-11-19T10:30:00.000Z',
    folder: 'Code',
    tags: ['env', 'config', 'environment'],
    shared: true,
    starred: false,
    locked: false,
    downloads: 56,
    views: 145,
    version: 4,
    extension: 'env',
    sharedWith: ['user-001', 'user-002', 'user-003'],
    accessLevel: 'team',
    metadata: {
      mimeType: 'text/plain',
      language: 'shell',
      wordCount: 234
    },
    storageProvider: 'supabase',
    lastAccessedAt: '2024-11-24T12:00:00.000Z'
  },

  // ARCHIVES (5 additional files)
  {
    id: 'FILE-063',
    name: 'Project Backup Nov 2024.zip',
    type: 'archive',
    size: 234567890,
    url: '/files/project-backup-nov-2024.zip',
    uploadedAt: '2024-11-01T00:00:00.000Z',
    uploadedBy: MOCK_USERS[0],
    modifiedAt: '2024-11-01T00:00:00.000Z',
    folder: 'Backups',
    tags: ['backup', 'project', 'archive'],
    shared: false,
    starred: true,
    locked: true,
    downloads: 5,
    views: 12,
    version: 1,
    extension: 'zip',
    description: 'Complete project backup for November 2024',
    metadata: {
      mimeType: 'application/zip',
      compression: 'deflate'
    },
    storageProvider: 'wasabi',
    isArchived: true,
    archivedAt: '2024-11-01T00:00:00.000Z',
    lastAccessedAt: '2024-11-15T10:00:00.000Z'
  },
  {
    id: 'FILE-064',
    name: 'Old Documents Archive.rar',
    type: 'archive',
    size: 123456789,
    url: '/files/old-documents-archive.rar',
    uploadedAt: '2024-06-01T00:00:00.000Z',
    uploadedBy: MOCK_USERS[1],
    modifiedAt: '2024-06-01T00:00:00.000Z',
    folder: 'Archive',
    tags: ['archive', 'documents', 'old'],
    shared: false,
    starred: false,
    locked: false,
    downloads: 3,
    views: 8,
    version: 1,
    extension: 'rar',
    metadata: {
      mimeType: 'application/x-rar-compressed',
      compression: 'rar'
    },
    storageProvider: 'wasabi',
    isArchived: true,
    archivedAt: '2024-06-01T00:00:00.000Z',
    lastAccessedAt: '2024-10-20T09:30:00.000Z'
  },
  {
    id: 'FILE-065',
    name: 'Source Code Repository.tar.gz',
    type: 'archive',
    size: 345678901,
    url: '/files/source-code-repository.tar.gz',
    uploadedAt: '2024-05-15T00:00:00.000Z',
    uploadedBy: MOCK_USERS[2],
    modifiedAt: '2024-05-15T00:00:00.000Z',
    folder: 'Backups',
    tags: ['source-code', 'repository', 'backup'],
    shared: false,
    starred: false,
    locked: true,
    downloads: 7,
    views: 18,
    version: 1,
    extension: 'tar.gz',
    metadata: {
      mimeType: 'application/gzip',
      compression: 'gzip'
    },
    storageProvider: 'wasabi',
    isArchived: true,
    archivedAt: '2024-05-15T00:00:00.000Z',
    lastAccessedAt: '2024-10-10T14:00:00.000Z'
  },
  {
    id: 'FILE-066',
    name: 'Database Dump Oct 2024.7z',
    type: 'archive',
    size: 456789012,
    url: '/files/database-dump-oct-2024.7z',
    uploadedAt: '2024-10-31T00:00:00.000Z',
    uploadedBy: MOCK_USERS[3],
    modifiedAt: '2024-10-31T00:00:00.000Z',
    folder: 'Backups',
    tags: ['database', 'dump', 'backup'],
    shared: false,
    starred: true,
    locked: true,
    downloads: 4,
    views: 9,
    version: 1,
    extension: '7z',
    metadata: {
      mimeType: 'application/x-7z-compressed',
      compression: '7z'
    },
    storageProvider: 'wasabi',
    isArchived: true,
    archivedAt: '2024-10-31T00:00:00.000Z',
    lastAccessedAt: '2024-11-12T11:00:00.000Z'
  },
  {
    id: 'FILE-067',
    name: 'Legacy System Files.tar',
    type: 'archive',
    size: 567890123,
    url: '/files/legacy-system-files.tar',
    uploadedAt: '2024-04-01T00:00:00.000Z',
    uploadedBy: MOCK_USERS[4],
    modifiedAt: '2024-04-01T00:00:00.000Z',
    folder: 'Archive',
    tags: ['legacy', 'system', 'archive'],
    shared: false,
    starred: false,
    locked: true,
    downloads: 2,
    views: 5,
    version: 1,
    extension: 'tar',
    description: 'Legacy system files from old infrastructure',
    metadata: {
      mimeType: 'application/x-tar',
      compression: 'none'
    },
    storageProvider: 'wasabi',
    isArchived: true,
    archivedAt: '2024-04-01T00:00:00.000Z',
    lastAccessedAt: '2024-09-15T10:30:00.000Z'
  },
*/

// ============================================================================
// HELPER FUNCTIONS - FILE OPERATIONS
// ============================================================================

/**
 * Format file size in bytes to human-readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * Get file icon based on file type
 */
export function getFileIcon(type: FileItem['type']): LucideIcon {
  switch (type) {
    case 'document':
      return FileText
    case 'image':
      return FileImage
    case 'video':
      return FileVideo
    case 'audio':
      return Music
    case 'archive':
      return FileArchive
    case 'code':
      return FileCode
    default:
      return File
  }
}

/**
 * Get file extension from filename
 */
export function getFileExtension(filename: string): string {
  const parts = filename.split('.')
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : ''
}

/**
 * Determine file type from extension
 */
export function getFileType(extension: string): FileItem['type'] {
  const ext = extension.toLowerCase()

  // Documents
  if (['pdf', 'doc', 'docx', 'txt', 'rtf', 'odt', 'xlsx', 'xls', 'csv', 'pptx', 'ppt'].includes(ext)) {
    return 'document'
  }

  // Images
  if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'bmp', 'ico', 'tiff'].includes(ext)) {
    return 'image'
  }

  // Videos
  if (['mp4', 'mov', 'avi', 'mkv', 'wmv', 'flv', 'webm', 'm4v'].includes(ext)) {
    return 'video'
  }

  // Audio
  if (['mp3', 'wav', 'flac', 'ogg', 'm4a', 'aac', 'wma', 'aiff'].includes(ext)) {
    return 'audio'
  }

  // Archives
  if (['zip', 'rar', '7z', 'tar', 'gz', 'bz2', 'xz'].includes(ext)) {
    return 'archive'
  }

  // Code
  if (['js', 'ts', 'jsx', 'tsx', 'py', 'java', 'cpp', 'c', 'h', 'cs', 'rb', 'go', 'rs', 'php', 'html', 'css', 'scss', 'sass', 'json', 'xml', 'yaml', 'yml', 'sql', 'sh', 'bash'].includes(ext)) {
    return 'code'
  }

  return 'other'
}

/**
 * Sort files by name (alphabetically)
 */
export function sortFilesByName(files: FileItem[]): FileItem[] {
  return [...files].sort((a, b) => a.name.localeCompare(b.name))
}

/**
 * Sort files by date (newest first)
 */
export function sortFilesByDate(files: FileItem[]): FileItem[] {
  return [...files].sort((a, b) =>
    new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
  )
}

/**
 * Sort files by size (largest first)
 */
export function sortFilesBySize(files: FileItem[]): FileItem[] {
  return [...files].sort((a, b) => b.size - a.size)
}

/**
 * Sort files by type (alphabetically)
 */
export function sortFilesByType(files: FileItem[]): FileItem[] {
  return [...files].sort((a, b) => a.type.localeCompare(b.type))
}

/**
 * Sort files by downloads (most downloaded first)
 */
export function sortFilesByDownloads(files: FileItem[]): FileItem[] {
  return [...files].sort((a, b) => b.downloads - a.downloads)
}

/**
 * Sort files by views (most viewed first)
 */
export function sortFilesByViews(files: FileItem[]): FileItem[] {
  return [...files].sort((a, b) => b.views - a.views)
}

/**
 * Filter files by type
 */
export function filterFilesByType(files: FileItem[], type: string): FileItem[] {
  if (type === 'all') return files
  if (type === 'starred') return files.filter(f => f.starred)
  return files.filter(f => f.type === type)
}

/**
 * Filter files by folder
 */
export function filterFilesByFolder(files: FileItem[], folder: string): FileItem[] {
  if (folder === 'All Files') return files
  return files.filter(f => f.folder === folder)
}

/**
 * Search files by name or tags
 */
export function searchFiles(files: FileItem[], query: string): FileItem[] {
  if (!query.trim()) return files

  const lowercaseQuery = query.toLowerCase()
  return files.filter(file =>
    file.name.toLowerCase().includes(lowercaseQuery) ||
    file.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery)) ||
    file.description?.toLowerCase().includes(lowercaseQuery)
  )
}

/**
 * Calculate total size of files in a folder
 */
export function calculateFolderSize(files: FileItem[], folderId: string): number {
  return files
    .filter(f => f.folder === folderId)
    .reduce((sum, f) => sum + f.size, 0)
}

/**
 * Get files uploaded in the last N days
 */
export function getRecentFiles(files: FileItem[], days: number): FileItem[] {
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - days)

  return files.filter(f => new Date(f.uploadedAt) >= cutoffDate)
}

/**
 * Get all shared files
 */
export function getSharedFiles(files: FileItem[]): FileItem[] {
  return files.filter(f => f.shared)
}

/**
 * Get all starred files
 */
export function getStarredFiles(files: FileItem[]): FileItem[] {
  return files.filter(f => f.starred)
}

/**
 * Get all locked files
 */
export function getLockedFiles(files: FileItem[]): FileItem[] {
  return files.filter(f => f.locked)
}

/**
 * Get all archived files
 */
export function getArchivedFiles(files: FileItem[]): FileItem[] {
  return files.filter(f => f.isArchived)
}

/**
 * Calculate total storage used
 */
export function getTotalStorageUsed(files: FileItem[]): number {
  return files.reduce((sum, f) => sum + f.size, 0)
}

/**
 * Get storage usage by file type
 */
export function getStorageByType(files: FileItem[]): Record<string, number> {
  return files.reduce((acc, file) => {
    acc[file.type] = (acc[file.type] || 0) + file.size
    return acc
  }, {} as Record<string, number>)
}

/**
 * Get most downloaded files
 */
export function getMostDownloadedFiles(files: FileItem[], limit: number = 10): FileItem[] {
  return sortFilesByDownloads(files).slice(0, limit)
}

/**
 * Get most viewed files
 */
export function getMostViewedFiles(files: FileItem[], limit: number = 10): FileItem[] {
  return sortFilesByViews(files).slice(0, limit)
}

/**
 * Get largest files
 */
export function getLargestFiles(files: FileItem[], limit: number = 10): FileItem[] {
  return sortFilesBySize(files).slice(0, limit)
}

/**
 * Build breadcrumb path for a folder
 */
export function buildBreadcrumbs(folderId: string, folders: FolderStructure[]): string[] {
  const breadcrumbs: string[] = []
  let currentFolder = folders.find(f => f.id === folderId)

  while (currentFolder) {
    breadcrumbs.unshift(currentFolder.name)
    if (!currentFolder.parentId) break
    currentFolder = folders.find(f => f.id === currentFolder!.parentId)
  }

  return breadcrumbs
}

/**
 * Check if file is an image
 */
export function isImageFile(extension: string): boolean {
  return ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'bmp', 'ico', 'tiff'].includes(extension.toLowerCase())
}

/**
 * Check if file is a video
 */
export function isVideoFile(extension: string): boolean {
  return ['mp4', 'mov', 'avi', 'mkv', 'wmv', 'flv', 'webm', 'm4v'].includes(extension.toLowerCase())
}

/**
 * Check if file is an audio file
 */
export function isAudioFile(extension: string): boolean {
  return ['mp3', 'wav', 'flac', 'ogg', 'm4a', 'aac', 'wma', 'aiff'].includes(extension.toLowerCase())
}

/**
 * Check if file is a document
 */
export function isDocumentFile(extension: string): boolean {
  return ['pdf', 'doc', 'docx', 'txt', 'rtf', 'odt', 'xlsx', 'xls', 'csv', 'pptx', 'ppt'].includes(extension.toLowerCase())
}

/**
 * Check if file is an archive
 */
export function isArchiveFile(extension: string): boolean {
  return ['zip', 'rar', '7z', 'tar', 'gz', 'bz2', 'xz'].includes(extension.toLowerCase())
}

/**
 * Check if file is a code file
 */
export function isCodeFile(extension: string): boolean {
  return ['js', 'ts', 'jsx', 'tsx', 'py', 'java', 'cpp', 'c', 'h', 'cs', 'rb', 'go', 'rs', 'php', 'html', 'css', 'scss', 'sass', 'json', 'xml', 'yaml', 'yml', 'sql', 'sh', 'bash'].includes(extension.toLowerCase())
}

/**
 * Calculate file analytics
 */
export function calculateFileAnalytics(files: FileItem[]): FileAnalytics {
  const totalSize = getTotalStorageUsed(files)
  const storageByType = getStorageByType(files)
  const filesByType = files.reduce((acc, file) => {
    acc[file.type] = (acc[file.type] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return {
    totalFiles: files.length,
    totalSize,
    filesByType,
    storageByType,
    avgFileSize: files.length > 0 ? totalSize / files.length : 0,
    largestFile: sortFilesBySize(files)[0] || null,
    mostDownloaded: sortFilesByDownloads(files)[0] || null,
    mostViewed: sortFilesByViews(files)[0] || null,
    recentUploads: getRecentFiles(files, 7)
  }
}

/**
 * Calculate multi-cloud storage statistics
 */
export function calculateStorageStats(files: FileItem[]): StorageStats {
  const supabaseFiles = files.filter(f => f.storageProvider === 'supabase')
  const wasabiFiles = files.filter(f => f.storageProvider === 'wasabi')

  const supabaseSize = getTotalStorageUsed(supabaseFiles)
  const wasabiSize = getTotalStorageUsed(wasabiFiles)

  // Cost calculation (example rates)
  // Supabase: $0.021 per GB per month
  // Wasabi: $0.0059 per GB per month
  const supabaseCost = (supabaseSize / 1024 / 1024 / 1024) * 0.021
  const wasabiCost = (wasabiSize / 1024 / 1024 / 1024) * 0.0059

  const totalCost = supabaseCost + wasabiCost

  // Calculate savings compared to storing everything in Supabase
  const totalSize = supabaseSize + wasabiSize
  const traditionalCost = (totalSize / 1024 / 1024 / 1024) * 0.021
  const savings = traditionalCost - totalCost
  const savingsPercentage = traditionalCost > 0 ? (savings / traditionalCost) * 100 : 0

  return {
    supabaseStorage: {
      fileCount: supabaseFiles.length,
      totalSize: supabaseSize,
      monthlyCost: supabaseCost
    },
    wasabiStorage: {
      fileCount: wasabiFiles.length,
      totalSize: wasabiSize,
      monthlyCost: wasabiCost
    },
    totalCost,
    savings,
    savingsPercentage
  }
}

/**
 * Format date to readable string
 */
export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

/**
 * Format date with time
 */
export function formatDateTime(date: string): string {
  return new Date(date).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

/**
 * Get relative time (e.g., "2 hours ago")
 */
export function getRelativeTime(date: string): string {
  const now = new Date()
  const past = new Date(date)
  const diffMs = now.getTime() - past.getTime()
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHour = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHour / 24)

  if (diffDay > 30) return formatDate(date)
  if (diffDay > 0) return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`
  if (diffHour > 0) return `${diffHour} hour${diffHour > 1 ? 's' : ''} ago`
  if (diffMin > 0) return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`
  return 'Just now'
}

/**
 * Get file type color class
 */
export function getFileTypeColor(type: FileItem['type']): string {
  switch (type) {
    case 'document':
      return 'text-blue-500'
    case 'image':
      return 'text-green-500'
    case 'video':
      return 'text-purple-500'
    case 'audio':
      return 'text-pink-500'
    case 'archive':
      return 'text-yellow-500'
    case 'code':
      return 'text-cyan-500'
    default:
      return 'text-gray-500'
  }
}

/**
 * Get file count by folder
 */
export function getFileCountByFolder(files: FileItem[], folders: FolderStructure[]): Record<string, number> {
  return folders.reduce((acc, folder) => {
    acc[folder.name] = files.filter(f => f.folder === folder.name).length
    return acc
  }, {} as Record<string, number>)
}

/**
 * Validate file for upload
 */
export function validateFile(file: File, maxSizeBytes: number = 100 * 1024 * 1024): { valid: boolean; error?: string } {
  if (file.size > maxSizeBytes) {
    return {
      valid: false,
      error: `File size exceeds maximum allowed size of ${formatFileSize(maxSizeBytes)}`
    }
  }

  return { valid: true }
}

/**
 * Generate unique file ID
 */
export function generateFileId(): string {
  return `FILE-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}
