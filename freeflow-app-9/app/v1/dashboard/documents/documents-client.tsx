'use client'
import React, { useState, useMemo, useRef, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Loader2 } from 'lucide-react'
import { useDocuments, useDocumentMutations, type Document, type DocumentType, type DocumentFolder as DBFolder, type DocumentShare, type DocumentVersion, type PermissionLevel } from '@/lib/hooks/use-documents'
import { useTeam } from '@/lib/hooks/use-team'
import { useActivityLogs } from '@/lib/hooks/use-activity-logs'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  FileText, Upload, Download, Share2, Clock,
  Plus, Search, Folder, File,
  Star, Lock, Users, Globe, MessageSquare, Link2,
  Copy, Trash2, Edit3, Grid3X3, List, Image as ImageIcon, Sparkles, BookOpen, Presentation,
  Settings, BarChart3, FileSpreadsheet, FilePlus, FolderPlus, Archive, CloudUpload, HardDrive,
  AlertCircle, FolderTree, Zap, Shield,
  ExternalLink, RefreshCw, MoreVertical, Move,
  Key, Webhook, Mail, Bell, AlertOctagon, Palette, Database
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
  CollapsibleInsightsPanel,
  InsightsToggleButton,
  useInsightsPanel
} from '@/components/ui/collapsible-insights-panel'




// ============================================================================
// TYPE DEFINITIONS - Google Docs Level Document Platform
// ============================================================================

interface DocumentFile {
  id: string
  name: string
  type: 'document' | 'spreadsheet' | 'presentation' | 'pdf' | 'image' | 'video' | 'audio' | 'archive' | 'other'
  extension: string
  size: number
  folderId?: string
  ownerId: string
  ownerName: string
  ownerAvatar?: string
  status: 'draft' | 'review' | 'approved' | 'published' | 'archived'
  starred: boolean
  shared: boolean
  sharingType: 'private' | 'team' | 'organization' | 'public'
  permissions: Permission[]
  version: number
  createdAt: Date
  updatedAt: Date
  lastAccessedAt?: Date
  tags: string[]
  comments: number
  thumbnail?: string
}

interface DocumentFolder {
  id: string
  name: string
  color: string
  parentId?: string
  documentCount: number
  size: number
  createdAt: Date
  shared: boolean
  ownerId: string
  ownerName: string
}

interface Permission {
  userId: string
  userName: string
  userEmail: string
  userAvatar?: string
  role: 'owner' | 'editor' | 'commenter' | 'viewer'
  addedAt: Date
}

interface DocTemplate {
  id: string
  name: string
  description: string
  category: string
  icon: string
  type: 'document' | 'spreadsheet' | 'presentation'
  uses: number
  isPremium: boolean
  thumbnail?: string
}

interface VersionEntry {
  id: string
  version: number
  userId: string
  userName: string
  userAvatar?: string
  changes: string
  size: number
  createdAt: Date
}

interface Comment {
  id: string
  documentId: string
  userId: string
  userName: string
  userAvatar?: string
  content: string
  resolved: boolean
  replies: CommentReply[]
  createdAt: Date
  position?: { x: number; y: number }
}

interface CommentReply {
  id: string
  userId: string
  userName: string
  userAvatar?: string
  content: string
  createdAt: Date
}

interface StorageInfo {
  used: number
  total: number
  breakdown: {
    documents: number
    images: number
    videos: number
    other: number
  }
}

interface RecentActivity {
  id: string
  action: 'created' | 'edited' | 'shared' | 'commented' | 'deleted' | 'restored' | 'moved'
  documentId: string
  documentName: string
  userId: string
  userName: string
  userAvatar?: string
  timestamp: Date
  details?: string
}

// ============================================================================
// EMPTY DATA ARRAYS - Real data comes from Supabase hooks
// Note: documentFiles is now computed from DB data inside the component
// ============================================================================

// Note: folders are now loaded dynamically from database via dbFolders state
const folders: DocumentFolder[] = [] // Kept for backwards compatibility, use dbFolders instead

const templates: DocTemplate[] = []

const versionHistory: VersionEntry[] = []

const comments: Comment[] = []

const recentActivity: RecentActivity[] = []

const storageInfo: StorageInfo = {
  used: 0,
  total: 15 * 1024 * 1024 * 1024,
  breakdown: {
    documents: 0,
    images: 0,
    videos: 0,
    other: 0,
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const getStatusColor = (status: DocumentFile['status']): string => {
  const colors: Record<DocumentFile['status'], string> = {
    draft: 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700 dark:text-gray-300',
    review: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400',
    approved: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400',
    published: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400',
    archived: 'bg-gray-100 text-gray-500 border-gray-200 dark:bg-gray-700 dark:text-gray-400',
  }
  return colors[status]
}

const getSharingColor = (type: DocumentFile['sharingType']): string => {
  const colors: Record<DocumentFile['sharingType'], string> = {
    private: 'bg-gray-100 text-gray-800',
    team: 'bg-blue-100 text-blue-800',
    organization: 'bg-purple-100 text-purple-800',
    public: 'bg-green-100 text-green-800',
  }
  return colors[type]
}

const getFileIcon = (type: DocumentFile['type']) => {
  const icons: Record<DocumentFile['type'], React.ReactNode> = {
    document: <FileText className="h-5 w-5 text-blue-600" />,
    spreadsheet: <FileSpreadsheet className="h-5 w-5 text-green-600" />,
    presentation: <Presentation className="h-5 w-5 text-orange-600" />,
    pdf: <FileText className="h-5 w-5 text-red-600" />,
    image: <ImageIcon className="h-5 w-5 text-purple-600" />,
    video: <FileText className="h-5 w-5 text-pink-600" />,
    audio: <FileText className="h-5 w-5 text-indigo-600" />,
    archive: <Archive className="h-5 w-5 text-amber-600" />,
    other: <File className="h-5 w-5 text-gray-600" />,
  }
  return icons[type]
}

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

const getActionIcon = (action: RecentActivity['action']) => {
  const icons: Record<RecentActivity['action'], React.ReactNode> = {
    created: <FilePlus className="h-4 w-4 text-green-600" />,
    edited: <Edit3 className="h-4 w-4 text-blue-600" />,
    shared: <Share2 className="h-4 w-4 text-purple-600" />,
    commented: <MessageSquare className="h-4 w-4 text-amber-600" />,
    deleted: <Trash2 className="h-4 w-4 text-red-600" />,
    restored: <RefreshCw className="h-4 w-4 text-emerald-600" />,
    moved: <Move className="h-4 w-4 text-cyan-600" />,
  }
  return icons[action]
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

// Empty arrays for AI-powered competitive upgrade components - real data from API
const documentsAIInsights: { id: string; type: 'success' | 'warning' | 'info'; title: string; description: string; priority: 'low' | 'medium' | 'high'; timestamp: string; category: string }[] = []

const documentsCollaborators: { id: string; name: string; avatar: string; status: 'online' | 'away' | 'offline'; role: string }[] = []

const documentsPredictions: { id: string; title: string; prediction: string; confidence: number; trend: 'up' | 'down' | 'stable'; impact: 'low' | 'medium' | 'high' }[] = []

const documentsActivities: { id: string; user: string; action: string; target: string; timestamp: string; type: 'success' | 'info' | 'warning' | 'error' }[] = []

// Quick actions initialized inside component to access state setters

export default function DocumentsClient({ initialDocuments }: { initialDocuments: Document[] }) {
  // Demo mode detection for investor demos
  const { data: nextAuthSession, status: sessionStatus } = useSession()
  const isDemoAccount = nextAuthSession?.user?.email === 'alex@freeflow.io' ||
                        nextAuthSession?.user?.email === 'sarah@freeflow.io' ||
                        nextAuthSession?.user?.email === 'mike@freeflow.io'
  const isSessionLoading = sessionStatus === 'loading'

  // Team and activity data hooks
  const { members: teamMembers } = useTeam()
  const { logs: activityLogs } = useActivityLogs()

  const insightsPanel = useInsightsPanel(false)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [statusFilter, setStatusFilter] = useState<DocumentFile['status'] | 'all'>('all')
  const [typeFilter, setTypeFilter] = useState<DocumentFile['type'] | 'all'>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDocument, setSelectedDocument] = useState<DocumentFile | null>(null)
  const [selectedFolder, setSelectedFolder] = useState<DocumentFolder | null>(null)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showUploadDialog, setShowUploadDialog] = useState(false)
  const [showShareDialog, setShowShareDialog] = useState(false)
  const [showMoveDialog, setShowMoveDialog] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [documentToAction, setDocumentToAction] = useState<DocumentFile | null>(null)
  const [settingsTab, setSettingsTab] = useState('general')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [renameDialogOpen, setRenameDialogOpen] = useState(false)
  const [renameValue, setRenameValue] = useState('')
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false)
  const [templateFilter, setTemplateFilter] = useState<'all' | 'document' | 'spreadsheet' | 'presentation'>('all')
  const [sharingFilter, setSharingFilter] = useState<'all' | 'team' | 'public' | 'private'>('all')
  const [showOrganizeDialog, setShowOrganizeDialog] = useState(false)
  const [folderOrder, setFolderOrder] = useState<DocumentFolder[]>([])
  const [showFolderDialog, setShowFolderDialog] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')
  const [newFolderColor, setNewFolderColor] = useState('#3B82F6')
  const [showVersionDialog, setShowVersionDialog] = useState(false)
  const [versionChangeSummary, setVersionChangeSummary] = useState('')
  const versionFileInputRef = useRef<HTMLInputElement>(null)
  const [shareEmail, setShareEmail] = useState('')
  const [sharePermission, setSharePermission] = useState<PermissionLevel>('view')

  // Quick actions with real functionality
  const documentsQuickActions = [
    { id: '1', label: 'New Document', icon: 'plus', action: () => setShowCreateDialog(true), variant: 'default' as const },
    { id: '2', label: 'Upload Files', icon: 'upload', action: () => setShowUploadDialog(true), variant: 'default' as const },
    { id: '3', label: 'Create Folder', icon: 'folder', action: () => handleCreateDocument('folder'), variant: 'outline' as const },
  ]

  const { data: hookDocuments, isLoading: hookLoading, error: hookError, refetch } = useDocuments({ status: statusFilter as string, type: typeFilter as string })
  const {
    createDocument,
    updateDocument,
    deleteDocument,
    uploadDocument,
    shareDocument,
    archiveDocument,
    moveToFolder,
    starDocument,
    downloadDocument,
    // Folder operations
    createFolder,
    updateFolder,
    deleteFolder,
    getFolders,
    // Share operations
    updateSharePermissions,
    revokeShare,
    getDocumentShares,
    // Version operations
    uploadNewVersion,
    getDocumentVersions,
    restoreVersion,
    loading: mutating
  } = useDocumentMutations()

  // Demo documents data for investor demos
  const demoDocuments: Document[] = useMemo(() => [
    {
      id: 'demo-doc-1',
      user_id: 'demo-user-1',
      document_title: 'Q1 2026 Financial Report',
      document_type: 'report',
      status: 'approved',
      access_level: 'internal',
      version: '2.1',
      version_number: 3,
      file_extension: 'pdf',
      file_size_bytes: 2450000,
      is_latest_version: true,
      is_encrypted: false,
      is_archived: false,
      owner: 'Alex Johnson',
      created_by: 'alex@freeflow.io',
      tags: ['finance', 'quarterly', '2026'],
      shared_with: ['sarah@freeflow.io', 'mike@freeflow.io'],
      parent_folder_id: null,
      permissions: [],
      comment_count: 5,
      created_at: '2026-01-15T10:00:00Z',
      updated_at: '2026-01-25T14:30:00Z',
      last_accessed_at: '2026-01-27T09:00:00Z'
    },
    {
      id: 'demo-doc-2',
      user_id: 'demo-user-1',
      document_title: 'Product Roadmap 2026',
      document_type: 'presentation',
      status: 'published',
      access_level: 'internal',
      version: '1.0',
      version_number: 1,
      file_extension: 'pptx',
      file_size_bytes: 8750000,
      is_latest_version: true,
      is_encrypted: false,
      is_archived: false,
      owner: 'Sarah Chen',
      created_by: 'sarah@freeflow.io',
      tags: ['product', 'roadmap', 'strategy'],
      shared_with: ['alex@freeflow.io'],
      parent_folder_id: null,
      permissions: [],
      comment_count: 12,
      created_at: '2026-01-10T08:00:00Z',
      updated_at: '2026-01-20T16:45:00Z',
      last_accessed_at: '2026-01-26T11:30:00Z'
    },
    {
      id: 'demo-doc-3',
      user_id: 'demo-user-1',
      document_title: 'Employee Handbook v3',
      document_type: 'policy',
      status: 'approved',
      access_level: 'public',
      version: '3.0',
      version_number: 5,
      file_extension: 'docx',
      file_size_bytes: 1250000,
      is_latest_version: true,
      is_encrypted: false,
      is_archived: false,
      owner: 'Mike Rodriguez',
      created_by: 'mike@freeflow.io',
      tags: ['hr', 'policy', 'handbook'],
      shared_with: [],
      parent_folder_id: null,
      permissions: [],
      comment_count: 8,
      created_at: '2025-12-01T09:00:00Z',
      updated_at: '2026-01-18T10:00:00Z',
      last_accessed_at: '2026-01-25T14:00:00Z'
    },
    {
      id: 'demo-doc-4',
      user_id: 'demo-user-1',
      document_title: 'Client Contract - Acme Corp',
      document_type: 'contract',
      status: 'review',
      access_level: 'confidential',
      version: '1.2',
      version_number: 2,
      file_extension: 'pdf',
      file_size_bytes: 980000,
      is_latest_version: true,
      is_encrypted: true,
      is_archived: false,
      owner: 'Alex Johnson',
      created_by: 'alex@freeflow.io',
      tags: ['contract', 'client', 'legal'],
      shared_with: ['legal@freeflow.io'],
      parent_folder_id: null,
      permissions: [],
      comment_count: 3,
      created_at: '2026-01-22T11:00:00Z',
      updated_at: '2026-01-26T09:30:00Z',
      last_accessed_at: '2026-01-27T08:00:00Z'
    },
    {
      id: 'demo-doc-5',
      user_id: 'demo-user-1',
      document_title: 'Marketing Budget Spreadsheet',
      document_type: 'spreadsheet',
      status: 'draft',
      access_level: 'internal',
      version: '1.0',
      version_number: 1,
      file_extension: 'xlsx',
      file_size_bytes: 450000,
      is_latest_version: true,
      is_encrypted: false,
      is_archived: false,
      owner: 'Sarah Chen',
      created_by: 'sarah@freeflow.io',
      tags: ['marketing', 'budget', 'finance'],
      shared_with: ['alex@freeflow.io'],
      parent_folder_id: null,
      permissions: [],
      comment_count: 2,
      created_at: '2026-01-24T13:00:00Z',
      updated_at: '2026-01-26T17:00:00Z',
      last_accessed_at: '2026-01-27T10:00:00Z'
    },
    {
      id: 'demo-doc-6',
      user_id: 'demo-user-1',
      document_title: 'Technical Architecture Doc',
      document_type: 'report',
      status: 'approved',
      access_level: 'internal',
      version: '2.0',
      version_number: 4,
      file_extension: 'md',
      file_size_bytes: 125000,
      is_latest_version: true,
      is_encrypted: false,
      is_archived: false,
      owner: 'Mike Rodriguez',
      created_by: 'mike@freeflow.io',
      tags: ['technical', 'architecture', 'engineering'],
      shared_with: ['alex@freeflow.io', 'sarah@freeflow.io'],
      parent_folder_id: null,
      permissions: [],
      comment_count: 15,
      created_at: '2025-11-15T10:00:00Z',
      updated_at: '2026-01-20T11:00:00Z',
      last_accessed_at: '2026-01-26T16:00:00Z'
    },
    {
      id: 'demo-doc-7',
      user_id: 'demo-user-1',
      document_title: 'Investor Pitch Deck',
      document_type: 'presentation',
      status: 'published',
      access_level: 'confidential',
      version: '4.0',
      version_number: 8,
      file_extension: 'pptx',
      file_size_bytes: 15600000,
      is_latest_version: true,
      is_encrypted: true,
      is_archived: false,
      owner: 'Alex Johnson',
      created_by: 'alex@freeflow.io',
      tags: ['investor', 'pitch', 'fundraising'],
      shared_with: [],
      parent_folder_id: null,
      permissions: [],
      comment_count: 25,
      created_at: '2025-10-01T09:00:00Z',
      updated_at: '2026-01-25T18:00:00Z',
      last_accessed_at: '2026-01-27T07:30:00Z'
    },
    {
      id: 'demo-doc-8',
      user_id: 'demo-user-1',
      document_title: 'Monthly Invoice - Jan 2026',
      document_type: 'invoice',
      status: 'approved',
      access_level: 'internal',
      version: '1.0',
      version_number: 1,
      file_extension: 'pdf',
      file_size_bytes: 85000,
      is_latest_version: true,
      is_encrypted: false,
      is_archived: false,
      owner: 'Sarah Chen',
      created_by: 'sarah@freeflow.io',
      tags: ['invoice', 'billing', 'january'],
      shared_with: ['accounting@freeflow.io'],
      parent_folder_id: null,
      permissions: [],
      comment_count: 0,
      created_at: '2026-01-01T08:00:00Z',
      updated_at: '2026-01-05T10:00:00Z',
      last_accessed_at: '2026-01-20T09:00:00Z'
    }
  ], [])

  // Use demo data for demo accounts, otherwise use hook data
  const documents = isDemoAccount ? demoDocuments : hookDocuments
  const loading = isSessionLoading || (isDemoAccount ? false : hookLoading)
  const error = !isSessionLoading && !isDemoAccount && hookError

  // Show error toast if there's an error loading documents
  useEffect(() => {
    if (error) {
      toast.error('Failed to load documents', {
        description: 'Please check your connection and try again'
      })
    }
  }, [error])

  // Map database documents to UI DocumentFile type
  const documentFiles: DocumentFile[] = useMemo(() => {
    if (!documents || documents.length === 0) return []
    return documents.map((doc: Document): DocumentFile => {
      // Map document_type to UI file type
      const typeMap: Record<string, DocumentFile['type']> = {
        'contract': 'pdf',
        'proposal': 'document',
        'report': 'document',
        'policy': 'document',
        'invoice': 'pdf',
        'presentation': 'presentation',
        'spreadsheet': 'spreadsheet',
        'other': 'other'
      }
      // Map status to UI status
      const statusMap: Record<string, DocumentFile['status']> = {
        'draft': 'draft',
        'review': 'review',
        'approved': 'approved',
        'archived': 'archived',
        'rejected': 'draft',
        'published': 'published'
      }
      // Map access_level to sharing type
      const sharingMap: Record<string, DocumentFile['sharingType']> = {
        'public': 'public',
        'internal': 'team',
        'confidential': 'private',
        'restricted': 'private',
        'secret': 'private'
      }
      return {
        id: doc.id,
        name: doc.document_title || 'Untitled Document',
        type: typeMap[doc.document_type] || 'other',
        extension: doc.file_extension || 'unknown',
        size: doc.file_size_bytes || 0,
        folderId: doc.parent_folder_id || undefined,
        ownerId: doc.user_id,
        ownerName: doc.owner || doc.created_by || 'Unknown',
        ownerAvatar: undefined,
        status: statusMap[doc.status] || 'draft',
        starred: (doc as Record<string, unknown>).starred || false,
        shared: (doc.shared_with && doc.shared_with.length > 0) || doc.access_level === 'public',
        sharingType: sharingMap[doc.access_level] || 'private',
        permissions: doc.permissions ? (Array.isArray(doc.permissions) ? doc.permissions : []) : [],
        version: doc.version_number || 1,
        createdAt: new Date(doc.created_at),
        updatedAt: new Date(doc.updated_at),
        lastAccessedAt: doc.last_accessed_at ? new Date(doc.last_accessed_at) : undefined,
        tags: doc.tags || [],
        comments: doc.comment_count || 0,
        thumbnail: undefined
      }
    })
  }, [documents])

  // Handle creating a new document or folder - REAL SUPABASE OPERATION
  const handleCreateDocument = async (docType: 'document' | 'spreadsheet' | 'presentation' | 'folder') => {
    try {
      if (docType === 'folder') {
        // Create folder using the folder API
        await handleCreateFolder(`New Folder ${Date.now().toString().slice(-4)}`)
      } else {
        const typeMap: Record<string, DocumentType> = {
          document: 'report',
          spreadsheet: 'spreadsheet',
          presentation: 'presentation'
        }
        await createDocument({
          document_title: `Untitled ${docType.charAt(0).toUpperCase() + docType.slice(1)}`,
          document_type: typeMap[docType],
          status: 'draft',
          access_level: 'internal',
          version: '1.0',
          version_number: 1,
          is_latest_version: true,
          is_encrypted: false,
          is_archived: false,
          parent_folder_id: selectedFolder?.id || null
        })
      }
      setShowCreateDialog(false)
      refetch()
    } catch (error) {
      console.error('Failed to create:', error)
      toast.error('Creation failed', {
        description: error instanceof Error ? error.message : 'Failed to create'
      })
    }
  }

  // ============================================================================
  // FOLDER HANDLERS - WIRED TO SUPABASE
  // ============================================================================

  // Create folder - REAL SUPABASE OPERATION
  const handleCreateFolder = async (name: string, options?: { description?: string; color?: string }) => {
    try {
      const folder = await createFolder(name, selectedFolder?.id, options)
      await loadFolders()
      return folder
    } catch (error) {
      console.error('Failed to create folder:', error)
      toast.error('Failed to create folder', {
        description: error instanceof Error ? error.message : 'Unknown error'
      })
      throw error
    }
  }

  // Update folder - REAL SUPABASE OPERATION
  const handleUpdateFolder = async (folderId: string, updates: { name?: string; description?: string; color?: string }) => {
    try {
      await updateFolder(folderId, updates)
      await loadFolders()
    } catch (error) {
      console.error('Failed to update folder:', error)
      toast.error('Failed to update folder')
    }
  }

  // Delete folder - REAL SUPABASE OPERATION
  const handleDeleteFolder = async (folderId: string) => {
    try {
      await deleteFolder(folderId)
      setSelectedFolder(null)
      await loadFolders()
    } catch (error) {
      console.error('Failed to delete folder:', error)
      toast.error('Failed to delete folder', {
        description: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }

  // Load folders from database
  const [dbFolders, setDbFolders] = useState<DBFolder[]>([])
  const loadFolders = async () => {
    const folders = await getFolders(selectedFolder?.id || null)
    setDbFolders(folders)
  }

  // Load folders on mount and when selected folder changes
  useEffect(() => {
    loadFolders()
  }, [selectedFolder?.id])

  // Handle file upload - REAL SUPABASE STORAGE OPERATION
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    // Upload each file to Supabase Storage
    for (const file of Array.from(files)) {
      try {
        // Use the uploadDocument method which handles storage upload + database record
        await uploadDocument(file, selectedFolder?.id)
      } catch (error) {
        console.error('Failed to upload document:', error)
        toast.error('Upload failed', {
          description: error instanceof Error ? error.message : 'Failed to upload file'
        })
      }
    }

    setShowUploadDialog(false)
    refetch()
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Handle delete document - REAL SUPABASE OPERATION
  const handleDeleteDocument = async (doc: DocumentFile) => {
    try {
      await deleteDocument(doc.id)
      setShowDeleteConfirm(false)
      setDocumentToAction(null)
      setSelectedDocument(null)
      refetch()
    } catch (error) {
      console.error('Failed to delete document:', error)
    }
  }

  // Handle share document - REAL SUPABASE OPERATION
  const handleShareDocument = async (doc: DocumentFile, options?: {
    email?: string
    permissionLevel?: PermissionLevel
    createPublicLink?: boolean
  }) => {
    try {
      await shareDocument(doc.id, {
        email: options?.email,
        permissionLevel: options?.permissionLevel || 'view',
        allowDownload: true,
        createPublicLink: options?.createPublicLink ?? true
      })
      refetch()
    } catch (error) {
      console.error('Failed to share document:', error)
      toast.error('Failed to share document', {
        description: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }

  // ============================================================================
  // VERSION HANDLERS - WIRED TO SUPABASE
  // ============================================================================

  // Upload new version - REAL SUPABASE STORAGE OPERATION
  const handleUploadVersion = async (documentId: string, file: File, changeSummary?: string) => {
    try {
      await uploadNewVersion(documentId, file, changeSummary)
      refetch()
    } catch (error) {
      console.error('Failed to upload version:', error)
      toast.error('Failed to upload new version', {
        description: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }

  // Get version history - REAL SUPABASE QUERY
  const [documentVersions, setDocumentVersions] = useState<DocumentVersion[]>([])
  const loadVersions = async (documentId: string) => {
    const versions = await getDocumentVersions(documentId)
    setDocumentVersions(versions)
  }

  // Restore version - REAL SUPABASE OPERATION
  const handleRestoreVersionAction = async (documentId: string, versionId: string) => {
    try {
      await restoreVersion(documentId, versionId)
      refetch()
      if (selectedDocument) {
        loadVersions(selectedDocument.id)
      }
    } catch (error) {
      console.error('Failed to restore version:', error)
      toast.error('Failed to restore version', {
        description: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }

  // ============================================================================
  // PERMISSION HANDLERS - WIRED TO SUPABASE
  // ============================================================================

  // Get document shares/permissions
  const [documentShares, setDocumentShares] = useState<DocumentShare[]>([])
  const loadShares = async (documentId: string) => {
    const shares = await getDocumentShares(documentId)
    setDocumentShares(shares)
  }

  // Update share permissions - REAL SUPABASE OPERATION
  const handleUpdatePermissions = async (shareId: string, updates: {
    permissionLevel?: PermissionLevel
    allowDownload?: boolean
    expiresAt?: string
  }) => {
    try {
      await updateSharePermissions(shareId, updates)
      if (selectedDocument) {
        loadShares(selectedDocument.id)
      }
    } catch (error) {
      console.error('Failed to update permissions:', error)
      toast.error('Failed to update permissions')
    }
  }

  // Revoke share - REAL SUPABASE OPERATION
  const handleRevokeShare = async (shareId: string) => {
    try {
      await revokeShare(shareId)
      if (selectedDocument) {
        loadShares(selectedDocument.id)
      }
      refetch()
    } catch (error) {
      console.error('Failed to revoke share:', error)
      toast.error('Failed to revoke share')
    }
  }

  // Load versions and shares when document is selected
  useEffect(() => {
    if (selectedDocument) {
      loadVersions(selectedDocument.id)
      loadShares(selectedDocument.id)
    }
  }, [selectedDocument?.id])

  // Handle archive document - REAL SUPABASE OPERATION
  const handleArchiveDocument = async (doc: DocumentFile) => {
    try {
      await archiveDocument(doc.id)
      setSelectedDocument(null)
      refetch()
    } catch (error) {
      console.error('Failed to archive document:', error)
    }
  }

  // Handle move to folder - REAL SUPABASE OPERATION
  const handleMoveToFolder = async (doc: DocumentFile, folderId: string | null) => {
    try {
      const folder = dbFolders.find(f => f.id === folderId)
      await moveToFolder(doc.id, folderId, folder?.path)
      setShowMoveDialog(false)
      setDocumentToAction(null)
      refetch()
    } catch (error) {
      console.error('Failed to move document:', error)
      toast.error('Failed to move document', {
        description: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }

  // Handle move document dialog action
  const handleMoveDocument = (doc: DocumentFile) => {
    setDocumentToAction(doc)
    setShowMoveDialog(true)
  }

  // Handle star/unstar document - REAL SUPABASE OPERATION
  const handleStarDocument = async (doc: DocumentFile) => {
    try {
      await starDocument(doc.id, !doc.starred)
      const action = doc.starred ? 'removed from' : 'added to'
      toast.success('Star updated', {
        description: `"${doc.name}" ${action} starred`
      })
      refetch()
    } catch (error) {
      console.error('Failed to star document:', error)
    }
  }

  // Handle download document - REAL SUPABASE STORAGE DOWNLOAD
  const handleDownloadDocument = async (doc: DocumentFile) => {
    try {
      // This now triggers actual file download from Supabase Storage
      await downloadDocument(doc.id)
    } catch (error) {
      console.error('Failed to download document:', error)
      toast.error('Download failed', {
        description: error instanceof Error ? error.message : 'Could not download document'
      })
    }
  }

  // Calculate comprehensive stats including storage breakdown from actual data
  const stats = useMemo(() => {
    const totalDocs = documentFiles.length
    const sharedDocs = documentFiles.filter(d => d.shared).length
    const starredDocs = documentFiles.filter(d => d.starred).length
    const draftDocs = documentFiles.filter(d => d.status === 'draft').length
    const reviewDocs = documentFiles.filter(d => d.status === 'review').length
    const archivedDocs = documentFiles.filter(d => d.status === 'archived').length
    const totalComments = documentFiles.reduce((sum, d) => sum + d.comments, 0)
    const totalFolders = dbFolders.length
    const totalStorageBytes = documentFiles.reduce((sum, d) => sum + d.size, 0)
    const storageUsedGB = totalStorageBytes / (1024 * 1024 * 1024)

    // Calculate storage breakdown by file type from actual data
    const storageBreakdown = documentFiles.reduce((acc, doc) => {
      const size = doc.size || 0
      const ext = (doc.extension || '').toLowerCase()
      if (['doc', 'docx', 'pdf', 'txt', 'rtf', 'odt', 'xls', 'xlsx', 'ppt', 'pptx', 'csv'].includes(ext)) {
        acc.documents += size
      } else if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico'].includes(ext)) {
        acc.images += size
      } else if (['mp4', 'mov', 'avi', 'mkv', 'webm', 'mp3', 'wav', 'ogg'].includes(ext)) {
        acc.media += size
      } else {
        acc.other += size
      }
      return acc
    }, { documents: 0, images: 0, media: 0, other: 0 })

    // Calculate trash size (archived documents)
    const trashSize = documentFiles
      .filter(d => d.status === 'archived')
      .reduce((sum, d) => sum + d.size, 0)

    return {
      totalDocs,
      sharedDocs,
      starredDocs,
      draftDocs,
      reviewDocs,
      archivedDocs,
      totalComments,
      totalFolders,
      totalStorageBytes,
      storageUsedGB: storageUsedGB.toFixed(1),
      storageBreakdown,
      trashSize
    }
  }, [documentFiles, dbFolders])

  // Filter documents
  const filteredDocuments = useMemo(() => {
    return documentFiles.filter(doc => {
      const matchesSearch = !searchQuery ||
        doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
      const matchesStatus = statusFilter === 'all' || doc.status === statusFilter
      const matchesType = typeFilter === 'all' || doc.type === typeFilter
      return matchesSearch && matchesStatus && matchesType
    })
  }, [documentFiles, searchQuery, statusFilter, typeFilter])

  const starredDocuments = useMemo(() => documentFiles.filter(d => d.starred), [documentFiles])
  const recentDocuments = useMemo(() =>
    [...documentFiles].sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()).slice(0, 6),
    [documentFiles]
  )

  // Handler to show upload dialog
  const handleUploadDocument = () => {
    setShowUploadDialog(true)
  }

  // Confirm delete action
  const confirmDeleteDocument = (doc: DocumentFile) => {
    setDocumentToAction(doc)
    setShowDeleteConfirm(true)
  }

  // Show move to folder dialog
  const showMoveToFolderDialog = (doc: DocumentFile) => {
    setDocumentToAction(doc)
    setShowMoveDialog(true)
  }

  // Copy link to clipboard - REAL OPERATION
  const handleCopyLink = async (doc?: DocumentFile) => {
    const docName = doc?.name || 'Document'
    const link = `${window.location.origin}/documents/${doc?.id || 'shared'}`
    try {
      await navigator.clipboard.writeText(link)
      toast.success('Link copied', { description: `Link for "${docName}" copied to clipboard` })
    } catch (error) {
      toast.error('Copy failed', { description: 'Could not copy link to clipboard' })
    }
  }

  // API token state - fetched from Supabase
  const [apiToken, setApiToken] = useState<string | null>(null)

  // Fetch API token on mount
  useEffect(() => {
    const fetchApiToken = async () => {
      if (isDemoAccount) {
        setApiToken('demo_doc_token_xxxxxxxxxxxxxxxxxxxxx')
        return
      }
      try {
        const response = await fetch('/api/documents/token')
        if (response.ok) {
          const data = await response.json()
          setApiToken(data.token || null)
        }
      } catch (error) {
        console.error('Failed to fetch API token:', error)
      }
    }
    fetchApiToken()
  }, [isDemoAccount])

  // Copy API token to clipboard - Uses real token from state
  const handleCopyApiToken = async () => {
    const tokenToCopy = apiToken || 'No token available - generate one first'
    try {
      await navigator.clipboard.writeText(tokenToCopy)
      toast.success('Token copied', { description: 'API token copied to clipboard' })
    } catch (error) {
      toast.error('Copy failed', { description: 'Could not copy token to clipboard' })
    }
  }

  // Regenerate API token - REAL API CALL with state update
  const handleRegenerateToken = async () => {
    toast.promise(
      (async () => {
        const response = await fetch('/api/documents/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'regenerate' })
        })
        if (!response.ok) throw new Error('Failed to regenerate token')
        const data = await response.json()
        // Update the token state with the new token
        if (data.token) {
          setApiToken(data.token)
        }
        return data
      })(),
      {
        loading: apiToken ? 'Regenerating API token...' : 'Generating API token...',
        success: apiToken ? 'New API token generated' : 'API token generated',
        error: 'Failed to generate token'
      }
    )
  }

  // Export all documents - REAL DOWNLOAD with actual database data
  const handleExportAll = async () => {
    toast.loading('Preparing export...')
    try {
      // Use actual documents data from Supabase hooks (documents contains the real DB data)
      const exportData = {
        version: '1.0',
        exportedAt: new Date().toISOString(),
        documentCount: documents?.length || 0,
        documents: documents?.map(doc => ({
          id: doc.id,
          title: doc.document_title,
          type: doc.document_type,
          status: doc.status,
          accessLevel: doc.access_level,
          version: doc.version,
          versionNumber: doc.version_number,
          fileExtension: doc.file_extension,
          fileSizeBytes: doc.file_size_bytes,
          isEncrypted: doc.is_encrypted,
          isArchived: doc.is_archived,
          owner: doc.owner,
          createdBy: doc.created_by,
          tags: doc.tags,
          sharedWith: doc.shared_with,
          parentFolderId: doc.parent_folder_id,
          commentCount: doc.comment_count,
          createdAt: doc.created_at,
          updatedAt: doc.updated_at,
          lastAccessedAt: doc.last_accessed_at
        })) || []
      }
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `documents-export-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      toast.dismiss()
      toast.success('Export complete', { description: `Exported ${documents?.length || 0} documents` })
    } catch (error) {
      toast.dismiss()
      toast.error('Export failed', { description: 'Could not export documents' })
    }
  }

  // Download backup - REAL DATA from Supabase
  const handleDownloadBackup = async () => {
    toast.loading('Preparing backup...')
    try {
      // Calculate storage breakdown from actual document data
      const storageBreakdown = (documents || []).reduce((acc, doc) => {
        const size = doc.file_size_bytes || 0
        const ext = (doc.file_extension || '').toLowerCase()
        if (['doc', 'docx', 'pdf', 'txt', 'rtf', 'odt', 'xls', 'xlsx', 'ppt', 'pptx'].includes(ext)) {
          acc.documents += size
        } else if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'].includes(ext)) {
          acc.images += size
        } else if (['mp4', 'mov', 'avi', 'mkv', 'webm'].includes(ext)) {
          acc.videos += size
        } else {
          acc.other += size
        }
        return acc
      }, { documents: 0, images: 0, videos: 0, other: 0 })

      const backupData = {
        version: '1.0',
        backupType: 'full',
        exportedAt: new Date().toISOString(),
        summary: {
          totalDocuments: documents?.length || 0,
          totalFolders: dbFolders.length,
          totalStorageBytes: (documents || []).reduce((sum, d) => sum + (d.file_size_bytes || 0), 0),
          storageBreakdown
        },
        documents: documents?.map(doc => ({
          id: doc.id,
          title: doc.document_title,
          type: doc.document_type,
          status: doc.status,
          accessLevel: doc.access_level,
          version: doc.version,
          versionNumber: doc.version_number,
          fileExtension: doc.file_extension,
          fileSizeBytes: doc.file_size_bytes,
          filePath: doc.file_path,
          fileUrl: doc.file_url,
          mimeType: doc.mime_type,
          isEncrypted: doc.is_encrypted,
          isArchived: doc.is_archived,
          owner: doc.owner,
          createdBy: doc.created_by,
          tags: doc.tags,
          categories: doc.categories,
          sharedWith: doc.shared_with,
          permissions: doc.permissions,
          parentFolderId: doc.parent_folder_id,
          folderPath: doc.folder_path,
          commentCount: doc.comment_count,
          viewCount: doc.view_count,
          downloadCount: doc.download_count,
          shareCount: doc.share_count,
          createdAt: doc.created_at,
          updatedAt: doc.updated_at,
          lastAccessedAt: doc.last_accessed_at
        })) || [],
        folders: dbFolders.map(folder => ({
          id: folder.id,
          name: folder.name,
          description: folder.description,
          color: folder.color,
          icon: folder.icon,
          parentId: folder.parent_id,
          path: folder.path,
          depth: folder.depth,
          isShared: folder.is_shared,
          documentCount: folder.document_count,
          totalSize: folder.total_size,
          createdAt: folder.created_at,
          updatedAt: folder.updated_at
        }))
      }
      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `freeflow-documents-backup-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      toast.dismiss()
      toast.success('Backup ready', { description: `Backed up ${documents?.length || 0} documents and ${dbFolders.length} folders` })
    } catch (error) {
      toast.dismiss()
      toast.error('Backup failed', { description: 'Could not prepare backup' })
    }
  }

  // Sync documents
  const handleSyncDocuments = () => {
    toast.promise(
      (async () => {
        await refetch()
        return true
      })(),
      {
        loading: 'Syncing documents...',
        success: 'Documents synced successfully',
        error: 'Sync failed'
      }
    )
  }

  // Clear trash with confirmation - REAL API DELETE
  const handleClearTrash = async () => {
    if (confirm('Are you sure you want to permanently delete all trashed documents? This action cannot be undone.')) {
      toast.promise(
        (async () => {
          const response = await fetch('/api/documents/trash', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' }
          })
          if (!response.ok) throw new Error('Failed to clear trash')
          await refetch()
          return true
        })(),
        {
          loading: 'Clearing trash...',
          success: 'Trash emptied successfully',
          error: 'Failed to clear trash'
        }
      )
    }
  }

  // Delete all documents with confirmation - REAL API DELETE
  const handleDeleteAllDocuments = async () => {
    if (confirm('Are you sure you want to delete ALL documents? This action cannot be undone!')) {
      if (confirm('This will permanently delete everything. Type "DELETE" in your mind and click OK to proceed.')) {
        toast.promise(
          (async () => {
            const response = await fetch('/api/documents/all', {
              method: 'DELETE',
              headers: { 'Content-Type': 'application/json' }
            })
            if (!response.ok) throw new Error('Failed to delete documents')
            await refetch()
            return true
          })(),
          {
            loading: 'Deleting all documents...',
            success: 'All documents deleted',
            error: 'Failed to delete documents'
          }
        )
      }
    }
  }

  // Share document via Web Share API or copy link
  const handleWebShare = async (doc?: DocumentFile) => {
    const shareData = {
      title: doc?.name || 'Document',
      text: `Check out this document: ${doc?.name || 'Shared Document'}`,
      url: `${window.location.origin}/documents/${doc?.id || 'shared'}`
    }

    if (navigator.share) {
      try {
        await navigator.share(shareData)
        toast.success('Shared successfully')
      } catch (error) {
        // User cancelled or share failed, fallback to copy
        handleCopyLink(doc)
      }
    } else {
      // Fallback: copy to clipboard
      handleCopyLink(doc)
    }
  }

  // Open document in new tab
  const handleOpenDocument = (doc: DocumentFile) => {
    window.open(`/documents/${doc.id}`, '_blank')
  }

  // Restore version - REAL SUPABASE OPERATION
  const handleRestoreVersion = async (version: VersionEntry) => {
    if (!selectedDocument) return

    toast.promise(
      handleRestoreVersionAction(selectedDocument.id, version.id),
      {
        loading: `Restoring version ${version.version}...`,
        success: `Restored to version ${version.version}`,
        error: 'Failed to restore version'
      }
    )
  }

  // Connect/disconnect cloud integration - REAL API CALL
  const handleCloudIntegration = async (name: string, connected: boolean) => {
    toast.promise(
      (async () => {
        const response = await fetch('/api/integrations/cloud', {
          method: connected ? 'DELETE' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ provider: name.toLowerCase().replace(' ', '-') })
        })
        if (!response.ok) throw new Error(`Failed to ${connected ? 'disconnect' : 'connect'} ${name}`)
        return true
      })(),
      {
        loading: connected ? `Disconnecting ${name}...` : `Connecting ${name}...`,
        success: connected ? `${name} disconnected` : `${name} connected successfully`,
        error: connected ? `Failed to disconnect ${name}` : `Failed to connect ${name}`
      }
    )
  }

  // Open rename dialog
  const handleOpenRenameDialog = (doc: DocumentFile) => {
    setDocumentToAction(doc)
    setRenameValue(doc.name)
    setRenameDialogOpen(true)
  }

  // Submit rename
  const handleRenameDocument = async () => {
    if (!documentToAction || !renameValue.trim()) return
    toast.promise(
      (async () => {
        await updateDocument(documentToAction.id, { document_title: renameValue })
        setRenameDialogOpen(false)
        setDocumentToAction(null)
        refetch()
      })(),
      {
        loading: 'Renaming document...',
        success: `Renamed to "${renameValue}"`,
        error: 'Failed to rename document'
      }
    )
  }

  // Open preview dialog
  const handlePreviewDocument = (doc: DocumentFile) => {
    setDocumentToAction(doc)
    setPreviewDialogOpen(true)
  }

  // Filtered templates based on templateFilter
  const filteredTemplates = useMemo(() => {
    if (templateFilter === 'all') return templates
    return templates.filter(t => t.type === templateFilter)
  }, [templateFilter])

  // Filtered shared documents based on sharingFilter
  const sharedDocuments = useMemo(() => {
    const shared = documentFiles.filter(d => d.shared)
    if (sharingFilter === 'all') return shared
    if (sharingFilter === 'team') return shared.filter(d => d.sharingType === 'team')
    if (sharingFilter === 'public') return shared.filter(d => d.sharingType === 'public' || d.sharingType === 'organization')
    if (sharingFilter === 'private') return documentFiles.filter(d => d.sharingType === 'private')
    return shared
  }, [documentFiles, sharingFilter])

  // Loading state - early return (after all hooks are defined)
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-600" />
      </div>
    )
  }

  // Error state - early return (after all hooks are defined)
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-screen gap-4">
        <p className="text-red-500">Error loading documents data</p>
        <Button onClick={() => refetch()}>Retry</Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-indigo-50 dark:bg-none dark:bg-gray-900 p-4 md:p-6 lg:p-8">
      <div className="max-w-[1800px] mx-auto space-y-8">
        {/* Premium Header */}
        <div className="relative overflow-hidden bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 rounded-2xl p-8 text-white">
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                    <FileText className="h-8 w-8" />
                  </div>
                  <Badge className="bg-white/20 text-white border-0 backdrop-blur-sm">
                    Documents Pro
                  </Badge>
                  <Badge className="bg-cyan-500/30 text-white border-0 backdrop-blur-sm">
                    Google Docs Level
                  </Badge>
                </div>
                <h1 className="text-4xl font-bold mb-2">Document Hub</h1>
                <p className="text-white/80 max-w-xl">
                  Create, collaborate, and manage documents with real-time editing, version history, and secure sharing
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                  <DialogTrigger asChild>
                    <Button className="bg-white text-cyan-600 hover:bg-white/90">
                      <Plus className="h-4 w-4 mr-2" />
                      New Document
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-lg">
                    <DialogHeader>
                      <DialogTitle>Create New Document</DialogTitle>
                      <DialogDescription>Choose a document type to get started</DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6 py-4">
                      {[
                        { icon: <FileText className="h-6 w-6" />, label: 'Document', desc: 'Word processor', color: 'blue', type: 'document' as const },
                        { icon: <FileSpreadsheet className="h-6 w-6" />, label: 'Spreadsheet', desc: 'Data & calculations', color: 'green', type: 'spreadsheet' as const },
                        { icon: <Presentation className="h-6 w-6" />, label: 'Presentation', desc: 'Slides & visuals', color: 'orange', type: 'presentation' as const },
                        { icon: <FolderPlus className="h-6 w-6" />, label: 'Folder', desc: 'Organize files', color: 'purple', type: 'folder' as const },
                      ].map((item, i) => (
                        <button
                          key={i}
                          onClick={() => handleCreateDocument(item.type)}
                          disabled={mutating}
                          className={`p-4 border rounded-lg hover:border-${item.color}-500 hover:bg-${item.color}-50 dark:hover:bg-${item.color}-900/20 transition-colors text-left disabled:opacity-50`}
                        >
                          <div className={`text-${item.color}-600 mb-2`}>{item.icon}</div>
                          <h4 className="font-medium">{item.label}</h4>
                          <p className="text-xs text-gray-500">{item.desc}</p>
                        </button>
                      ))}
                    </div>
                  </DialogContent>
                </Dialog>
                <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
                  <DialogTrigger asChild>
                    <Button variant="ghost" className="text-white hover:bg-white/20">
                      <Upload className="h-5 w-5" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Upload Files</DialogTitle>
                      <DialogDescription>Upload documents to your library</DialogDescription>
                    </DialogHeader>
                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-12 text-center">
                      <CloudUpload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                      <p className="font-medium mb-1">Drop files here or click to browse</p>
                      <p className="text-sm text-gray-500">Supports all file types up to 100MB</p>
                      <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        className="hidden"
                        onChange={handleFileUpload}
                        accept=".doc,.docx,.xls,.xlsx,.ppt,.pptx,.pdf,.txt,.csv,.odt,.ods,.odp"
                      />
                      <Button
                        variant="outline"
                        className="mt-4"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={mutating}
                      >
                        {mutating ? 'Uploading...' : 'Select Files'}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
                <Button variant="ghost" className="text-white hover:bg-white/20" onClick={() => setActiveTab('settings')}>
                  <Settings className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid - 8 Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          {[
            { label: 'Documents', value: stats.totalDocs, icon: FileText, color: 'cyan', change: '+5' },
            { label: 'Shared', value: stats.sharedDocs, icon: Share2, color: 'purple', change: '+2' },
            { label: 'Starred', value: stats.starredDocs, icon: Star, color: 'amber', change: '' },
            { label: 'In Review', value: stats.reviewDocs, icon: Clock, color: 'orange', change: '+1' },
            { label: 'Drafts', value: stats.draftDocs, icon: Edit3, color: 'gray', change: '' },
            { label: 'Comments', value: stats.totalComments, icon: MessageSquare, color: 'blue', change: '+12' },
            { label: 'Folders', value: stats.totalFolders, icon: Folder, color: 'emerald', change: '' },
            { label: 'Storage', value: `${stats.storageUsedGB} GB`, icon: HardDrive, color: 'pink', change: '' },
          ].map((stat, index) => (
            <Card key={index} className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className={`p-1.5 rounded-lg bg-gradient-to-br from-${stat.color}-400 to-${stat.color}-600`}>
                    <stat.icon className="h-3.5 w-3.5 text-white" />
                  </div>
                  <span className="text-xs text-gray-500 truncate">{stat.label}</span>
                </div>
                <div className="flex items-end justify-between">
                  <span className="text-xl font-bold text-gray-900 dark:text-white">{stat.value}</span>
                  {stat.change && (
                    <span className="text-xs text-green-600">{stat.change}</span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="flex items-center justify-between">
            <TabsList className="bg-white dark:bg-gray-800 p-1 shadow-sm">
              <TabsTrigger value="dashboard" className="gap-2">
                <BarChart3 className="h-4 w-4" />
                Dashboard
              </TabsTrigger>
              <TabsTrigger value="documents" className="gap-2">
                <FileText className="h-4 w-4" />
                Documents
              </TabsTrigger>
              <TabsTrigger value="folders" className="gap-2">
                <Folder className="h-4 w-4" />
                Folders
              </TabsTrigger>
              <TabsTrigger value="templates" className="gap-2">
                <BookOpen className="h-4 w-4" />
                Templates
              </TabsTrigger>
              <TabsTrigger value="shared" className="gap-2">
                <Users className="h-4 w-4" />
                Shared
              </TabsTrigger>
              <TabsTrigger value="settings" className="gap-2">
                <Settings className="h-4 w-4" />
                Settings
              </TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search documents..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <div className="flex items-center border rounded-lg bg-white dark:bg-gray-800">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-gray-100 dark:bg-gray-700' : ''}`}
                >
                  <Grid3X3 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${viewMode === 'list' ? 'bg-gray-100 dark:bg-gray-700' : ''}`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
              <InsightsToggleButton
                isOpen={insightsPanel.isOpen}
                onToggle={insightsPanel.toggle}
              />
            </div>
          </div>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            {/* Dashboard Banner */}
            <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 rounded-2xl p-6 text-white mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Document Management</h2>
                  <p className="text-blue-100">Google Docs-level collaboration with real-time editing and versioning</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{documentFiles.length}</p>
                    <p className="text-blue-200 text-sm">Documents</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{dbFolders.length}</p>
                    <p className="text-blue-200 text-sm">Folders</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{((storageInfo.used / storageInfo.total) * 100).toFixed(0)}%</p>
                    <p className="text-blue-200 text-sm">Storage</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Dashboard Quick Actions - Wired to Real Operations */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
              <Button
                variant="ghost"
                className="h-20 flex-col gap-2 bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 hover:scale-105 transition-all duration-200"
                onClick={() => setShowCreateDialog(true)}
                disabled={mutating}
              >
                <FilePlus className="w-5 h-5" />
                <span className="text-xs font-medium">New Doc</span>
              </Button>
              <Button
                variant="ghost"
                className="h-20 flex-col gap-2 bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 hover:scale-105 transition-all duration-200"
                onClick={() => setShowUploadDialog(true)}
                disabled={mutating}
              >
                <Upload className="w-5 h-5" />
                <span className="text-xs font-medium">Upload</span>
              </Button>
              <Button
                variant="ghost"
                className="h-20 flex-col gap-2 bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400 hover:scale-105 transition-all duration-200"
                onClick={() => handleCreateDocument('folder')}
                disabled={mutating}
              >
                <FolderPlus className="w-5 h-5" />
                <span className="text-xs font-medium">New Folder</span>
              </Button>
              <Button
                variant="ghost"
                className="h-20 flex-col gap-2 bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400 hover:scale-105 transition-all duration-200"
                onClick={() => {
                  if (selectedDocument) {
                    handleWebShare(selectedDocument)
                  } else {
                    toast.info('Select a document first', { description: 'Choose a document from the list to share' })
                  }
                }}
              >
                <Share2 className="w-5 h-5" />
                <span className="text-xs font-medium">Share</span>
              </Button>
              <Button
                variant="ghost"
                className="h-20 flex-col gap-2 bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400 hover:scale-105 transition-all duration-200"
                onClick={() => setStatusFilter('all')}
              >
                <Star className="w-5 h-5" />
                <span className="text-xs font-medium">Starred</span>
              </Button>
              <Button
                variant="ghost"
                className="h-20 flex-col gap-2 bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400 hover:scale-105 transition-all duration-200"
                onClick={() => setActiveTab('documents')}
              >
                <Clock className="w-5 h-5" />
                <span className="text-xs font-medium">Recent</span>
              </Button>
              <Button
                variant="ghost"
                className="h-20 flex-col gap-2 bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 hover:scale-105 transition-all duration-200"
                onClick={() => setStatusFilter('archived')}
              >
                <Archive className="w-5 h-5" />
                <span className="text-xs font-medium">Archive</span>
              </Button>
              <Button
                variant="ghost"
                className="h-20 flex-col gap-2 bg-gray-100 text-gray-600 dark:bg-gray-900/30 dark:text-gray-400 hover:scale-105 transition-all duration-200"
                onClick={() => setActiveTab('settings')}
              >
                <Settings className="w-5 h-5" />
                <span className="text-xs font-medium">Settings</span>
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Recent Documents */}
              <Card className="lg:col-span-2">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-lg font-semibold">Recent Documents</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => setActiveTab('documents')}>View All</Button>
                </CardHeader>
                <CardContent className="space-y-3">
                  {recentDocuments.slice(0, 5).map(doc => (
                    <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all cursor-pointer" onClick={() => setSelectedDocument(doc)}>
                      <div className="flex items-center gap-3">
                        {getFileIcon(doc.type)}
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{doc.name}</p>
                          <p className="text-xs text-gray-500">Updated {doc.updatedAt.toLocaleDateString()} • {formatBytes(doc.size)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {doc.starred && <Star className="h-4 w-4 text-amber-500 fill-amber-500" />}
                        <Badge className={getStatusColor(doc.status)}>{doc.status}</Badge>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Storage */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Storage</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{(storageInfo.used / (1024 * 1024 * 1024)).toFixed(1)} GB</p>
                    <p className="text-sm text-gray-500">of {(storageInfo.total / (1024 * 1024 * 1024)).toFixed(0)} GB used</p>
                  </div>
                  <Progress value={(storageInfo.used / storageInfo.total) * 100} className="h-2" />
                  <div className="space-y-2">
                    {[
                      { label: 'Documents', value: storageInfo.breakdown.documents, color: 'bg-blue-500' },
                      { label: 'Images', value: storageInfo.breakdown.images, color: 'bg-purple-500' },
                      { label: 'Videos', value: storageInfo.breakdown.videos, color: 'bg-pink-500' },
                      { label: 'Other', value: storageInfo.breakdown.other, color: 'bg-gray-500' },
                    ].map(item => (
                      <div key={item.label} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded ${item.color}`}></div>
                          <span>{item.label}</span>
                        </div>
                        <span className="font-medium">{formatBytes(item.value)}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Activity */}
              <Card className="lg:col-span-2">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => {
                    // Navigate to full activity view and store preference
                    localStorage.setItem('documents_activity_view', 'expanded')
                    setActiveTab('documents')
                    toast.success('Viewing complete activity history', { description: 'Switched to documents view with expanded activity' })
                  }}>View All</Button>
                </CardHeader>
                <CardContent className="space-y-3">
                  {recentActivity.map(activity => (
                    <div key={activity.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="p-2 rounded-full bg-white dark:bg-gray-700">
                        {getActionIcon(activity.action)}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm">
                          <span className="font-medium">{activity.userName}</span>
                          {' '}{activity.action}{' '}
                          <span className="font-medium">{activity.documentName}</span>
                          {activity.details && <span className="text-gray-500"> {activity.details}</span>}
                        </p>
                        <p className="text-xs text-gray-500">{activity.timestamp.toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Quick Access */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Starred</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {starredDocuments.map(doc => (
                    <div key={doc.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer" onClick={() => setSelectedDocument(doc)}>
                      {getFileIcon(doc.type)}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{doc.name}</p>
                        <p className="text-xs text-gray-500">{formatBytes(doc.size)}</p>
                      </div>
                      <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents">
            {/* Documents Banner */}
            <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 rounded-2xl p-6 text-white mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">All Documents</h2>
                  <p className="text-emerald-100">Browse, search, and manage all your documents in one place</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{filteredDocuments.length}</p>
                    <p className="text-emerald-200 text-sm">Files</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{documentFiles.filter(d => d.starred).length}</p>
                    <p className="text-emerald-200 text-sm">Starred</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Documents Quick Actions - Wired to Real Operations */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
              <Button
                variant="ghost"
                className="h-20 flex-col gap-2 bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 hover:scale-105 transition-all duration-200"
                onClick={() => handleCreateDocument('document')}
                disabled={mutating}
              >
                <FilePlus className="w-5 h-5" />
                <span className="text-xs font-medium">New Doc</span>
              </Button>
              <Button
                variant="ghost"
                className="h-20 flex-col gap-2 bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400 hover:scale-105 transition-all duration-200"
                onClick={() => handleCreateDocument('spreadsheet')}
                disabled={mutating}
              >
                <FileSpreadsheet className="w-5 h-5" />
                <span className="text-xs font-medium">Spreadsheet</span>
              </Button>
              <Button
                variant="ghost"
                className="h-20 flex-col gap-2 bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400 hover:scale-105 transition-all duration-200"
                onClick={() => handleCreateDocument('presentation')}
                disabled={mutating}
              >
                <Presentation className="w-5 h-5" />
                <span className="text-xs font-medium">Slides</span>
              </Button>
              <Button
                variant="ghost"
                className="h-20 flex-col gap-2 bg-sky-100 text-sky-600 dark:bg-sky-900/30 dark:text-sky-400 hover:scale-105 transition-all duration-200"
                onClick={() => setShowUploadDialog(true)}
                disabled={mutating}
              >
                <Upload className="w-5 h-5" />
                <span className="text-xs font-medium">Upload</span>
              </Button>
              <Button
                variant="ghost"
                className="h-20 flex-col gap-2 bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 hover:scale-105 transition-all duration-200"
                onClick={() => {
                  if (selectedDocument) {
                    handleDownloadDocument(selectedDocument)
                  } else {
                    handleExportAll()
                  }
                }}
              >
                <Download className="w-5 h-5" />
                <span className="text-xs font-medium">Export</span>
              </Button>
              <Button
                variant="ghost"
                className="h-20 flex-col gap-2 bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 hover:scale-105 transition-all duration-200"
                onClick={() => {
                  if (selectedDocument) {
                    handleCopyLink(selectedDocument)
                  } else {
                    toast.info('Select a document first', { description: 'Choose a document to duplicate' })
                  }
                }}
              >
                <Copy className="w-5 h-5" />
                <span className="text-xs font-medium">Duplicate</span>
              </Button>
              <Button
                variant="ghost"
                className="h-20 flex-col gap-2 bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400 hover:scale-105 transition-all duration-200"
                onClick={() => {
                  if (selectedDocument) {
                    showMoveToFolderDialog(selectedDocument)
                  } else {
                    toast.info('Select a document first', { description: 'Choose a document to move' })
                  }
                }}
              >
                <Move className="w-5 h-5" />
                <span className="text-xs font-medium">Move</span>
              </Button>
              <Button
                variant="ghost"
                className="h-20 flex-col gap-2 bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 hover:scale-105 transition-all duration-200"
                onClick={() => {
                  if (selectedDocument) {
                    confirmDeleteDocument(selectedDocument)
                  } else {
                    toast.info('Select a document first', { description: 'Choose a document to delete' })
                  }
                }}
              >
                <Trash2 className="w-5 h-5" />
                <span className="text-xs font-medium">Delete</span>
              </Button>
            </div>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>All Documents</CardTitle>
                <div className="flex items-center gap-3">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
                  >
                    <option value="all">All Status</option>
                    <option value="draft">Draft</option>
                    <option value="review">In Review</option>
                    <option value="approved">Approved</option>
                    <option value="published">Published</option>
                  </select>
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
                  >
                    <option value="all">All Types</option>
                    <option value="document">Documents</option>
                    <option value="spreadsheet">Spreadsheets</option>
                    <option value="presentation">Presentations</option>
                  </select>
                </div>
              </CardHeader>
              <CardContent>
                {loading && (
                  <div className="text-center py-8">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-cyan-600 border-r-transparent"></div>
                  </div>
                )}

                {viewMode === 'grid' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredDocuments.map(doc => (
                      <Card key={doc.id} className="hover:shadow-md transition-all cursor-pointer" onClick={() => setSelectedDocument(doc)}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            {getFileIcon(doc.type)}
                            <div className="flex items-center gap-1">
                              {doc.starred && <Star className="h-4 w-4 text-amber-500 fill-amber-500" />}
                              <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={(e) => { e.stopPropagation(); setSelectedDocument(doc); handlePreviewDocument(doc) }}>
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          <h3 className="font-medium mb-1 truncate">{doc.name}</h3>
                          <p className="text-xs text-gray-500 mb-3">Updated {doc.updatedAt.toLocaleDateString()}</p>
                          <div className="flex items-center justify-between">
                            <Badge className={getStatusColor(doc.status)}>{doc.status}</Badge>
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              {doc.shared && <Users className="h-3 w-3" />}
                              {doc.comments > 0 && <span className="flex items-center gap-0.5"><MessageSquare className="h-3 w-3" />{doc.comments}</span>}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredDocuments.map(doc => (
                      <div key={doc.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all cursor-pointer" onClick={() => setSelectedDocument(doc)}>
                        <div className="flex items-center gap-4">
                          {getFileIcon(doc.type)}
                          <div>
                            <p className="font-medium">{doc.name}</p>
                            <p className="text-sm text-gray-500">
                              {doc.ownerName} • {doc.updatedAt.toLocaleDateString()} • {formatBytes(doc.size)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {doc.starred && <Star className="h-4 w-4 text-amber-500 fill-amber-500" />}
                          <Badge className={getStatusColor(doc.status)}>{doc.status}</Badge>
                          <Badge className={getSharingColor(doc.sharingType)}>{doc.sharingType}</Badge>
                          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setSelectedDocument(doc) }}>
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Folders Tab */}
          <TabsContent value="folders">
            {/* Folders Banner */}
            <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 rounded-2xl p-6 text-white mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Folder Organization</h2>
                  <p className="text-amber-100">Organize your documents with smart folders and nested hierarchies</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{dbFolders.length}</p>
                    <p className="text-amber-200 text-sm">Folders</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{dbFolders.filter(f => f.is_shared).length}</p>
                    <p className="text-amber-200 text-sm">Shared</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Folders Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
              {[
                { icon: FolderPlus, label: 'New Folder', color: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400', action: () => handleCreateDocument('folder') },
                { icon: FolderTree, label: 'Organize', color: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400', action: () => setShowOrganizeDialog(true) },
                { icon: Share2, label: 'Share', color: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400', action: () => { if (selectedFolder) { handleWebShare() } else { toast.info('Select a folder first', { description: 'Choose a folder to share' }) } } },
                { icon: Move, label: 'Move', color: 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400', action: () => { if (selectedFolder) { setShowMoveDialog(true) } else { toast.info('Select a folder first', { description: 'Choose a folder to move' }) } } },
                { icon: Copy, label: 'Duplicate', color: 'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400', action: () => { if (selectedFolder) { handleCopyLink() } else { toast.info('Select a folder first', { description: 'Choose a folder to duplicate' }) } } },
                { icon: Archive, label: 'Archive', color: 'bg-fuchsia-100 text-fuchsia-600 dark:bg-fuchsia-900/30 dark:text-fuchsia-400', action: () => {
                  if (selectedFolder) {
                    // Archive folder by saving to localStorage and updating state
                    const archivedFolders = JSON.parse(localStorage.getItem('archived_folders') || '[]')
                    archivedFolders.push({ ...selectedFolder, archivedAt: new Date().toISOString() })
                    localStorage.setItem('archived_folders', JSON.stringify(archivedFolders))
                    setFolderOrder(prev => prev.filter(f => f.id !== selectedFolder.id))
                    setSelectedFolder(null)
                    toast.success('Folder archived', { description: `"${selectedFolder.name}" has been moved to archive` })
                  } else {
                    toast.info('Select a folder first', { description: 'Choose a folder to archive' })
                  }
                } },
                { icon: Palette, label: 'Color', color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400', action: () => {
                  if (selectedFolder) {
                    // Cycle through available colors
                    const colors = ['bg-blue-500', 'bg-pink-500', 'bg-emerald-500', 'bg-purple-500', 'bg-amber-500', 'bg-red-500', 'bg-cyan-500', 'bg-orange-500']
                    const currentIndex = colors.indexOf(selectedFolder.color)
                    const nextColor = colors[(currentIndex + 1) % colors.length]
                    // Update folder color in state
                    setFolderOrder(prev => prev.map(f => f.id === selectedFolder.id ? { ...f, color: nextColor } : f))
                    setSelectedFolder(prev => prev ? { ...prev, color: nextColor } : null)
                    // Save to localStorage
                    const folderColors = JSON.parse(localStorage.getItem('folder_colors') || '{}')
                    folderColors[selectedFolder.id] = nextColor
                    localStorage.setItem('folder_colors', JSON.stringify(folderColors))
                    toast.success('Folder color updated', { description: `Changed "${selectedFolder.name}" color` })
                  } else {
                    toast.info('Select a folder first', { description: 'Choose a folder to color' })
                  }
                } },
                { icon: Settings, label: 'Settings', color: 'bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400', action: () => setActiveTab('settings') },
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {dbFolders.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <Folder className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500 mb-4">No folders yet</p>
                  <Button onClick={() => handleCreateDocument('folder')} disabled={mutating}>
                    <FolderPlus className="h-4 w-4 mr-2" />
                    Create your first folder
                  </Button>
                </div>
              ) : dbFolders.map(folder => (
                <Card key={folder.id} className="hover:shadow-md transition-all cursor-pointer" onClick={() => setSelectedFolder({ id: folder.id, name: folder.name, color: folder.color || 'bg-blue-500', parentId: folder.parent_id || undefined, documentCount: folder.document_count, size: folder.total_size, createdAt: new Date(folder.created_at), shared: folder.is_shared, ownerId: folder.user_id, ownerName: '' })}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`p-3 rounded-xl`} style={{ backgroundColor: folder.color || '#3B82F6' }}>
                        <Folder className="h-6 w-6 text-white" />
                      </div>
                      <Button variant="ghost" size="sm" onClick={(e) => {
                        e.stopPropagation()
                        // Copy folder share link to clipboard
                        const shareLink = `${window.location.origin}/documents/folder/${folder.id}`
                        navigator.clipboard.writeText(shareLink).then(() => {
                          toast.success(`Folder "${folder.name}" selected`, {
                            description: `${folder.document_count} items - ${formatBytes(folder.total_size)}. Share link copied!`,
                            action: {
                              label: 'Open',
                              onClick: () => setActiveTab('folders')
                            }
                          })
                        }).catch(() => {
                          toast.info(folder.name, { description: `${folder.document_count} items - ${formatBytes(folder.total_size)}` })
                        })
                      }}>
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                    <h3 className="font-semibold text-lg mb-1">{folder.name}</h3>
                    <p className="text-sm text-gray-500 mb-3">
                      {folder.document_count} items • {formatBytes(folder.total_size)}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">{folder.description || 'No description'}</span>
                      {folder.is_shared && <Users className="h-4 w-4 text-gray-400" />}
                    </div>
                  </CardContent>
                </Card>
              ))}
              <Card
                className="border-2 border-dashed hover:border-cyan-500 hover:bg-cyan-50/50 dark:hover:bg-cyan-900/20 transition-all cursor-pointer"
                onClick={() => handleCreateDocument('folder')}
              >
                <CardContent className="p-6 flex flex-col items-center justify-center h-full min-h-[180px]">
                  <FolderPlus className="h-10 w-10 text-gray-400 mb-3" />
                  <p className="font-medium text-gray-600">Create New Folder</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Templates Tab */}
          <TabsContent value="templates" className="space-y-6">
            {/* Templates Banner */}
            <div className="bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 rounded-2xl p-6 text-white mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Document Templates</h2>
                  <p className="text-violet-100">Start with pre-built templates to save time and ensure consistency</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{templates.length}</p>
                    <p className="text-violet-200 text-sm">Templates</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{templates.filter(t => t.isPremium).length}</p>
                    <p className="text-violet-200 text-sm">Premium</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Templates Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
              {[
                { icon: FilePlus, label: 'Create New', color: 'bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400', action: async () => {
                  toast.promise(
                    (async () => {
                      const response = await fetch('/api/templates', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: 'Untitled Template', type: 'document' }) })
                      if (!response.ok) throw new Error('Failed to create template')
                      return await response.json()
                    })(),
                    { loading: 'Creating template...', success: 'New template created', error: 'Failed to create template' }
                  )
                }},
                { icon: Upload, label: 'Import', color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400', action: () => {
                  const input = document.createElement('input')
                  input.type = 'file'
                  input.accept = '.json,.docx,.xlsx,.pptx'
                  input.onchange = async (e) => {
                    const file = (e.target as HTMLInputElement).files?.[0]
                    if (!file) return
                    const formData = new FormData()
                    formData.append('file', file)
                    toast.promise(
                      fetch('/api/templates/import', { method: 'POST', body: formData }).then(r => { if (!r.ok) throw new Error(); return r.json() }),
                      { loading: 'Importing template...', success: 'Template imported successfully', error: 'Failed to import template' }
                    )
                  }
                  input.click()
                }},
                { icon: Sparkles, label: 'AI Generate', color: 'bg-fuchsia-100 text-fuchsia-600 dark:bg-fuchsia-900/30 dark:text-fuchsia-400', action: async () => {
                  toast.promise(
                    fetch('/api/templates/ai-generate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt: 'Generate a professional template' }) }).then(r => { if (!r.ok) throw new Error(); return r.json() }),
                    { loading: 'AI generating template...', success: 'AI template generated', error: 'Failed to generate template' }
                  )
                }},
                { icon: Star, label: 'Premium', color: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400', action: () => { setTemplateFilter('all'); toast.success('Showing premium templates') } },
                { icon: FileText, label: 'Documents', color: 'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400', action: () => { setTemplateFilter('document'); toast.success('Showing document templates') } },
                { icon: FileSpreadsheet, label: 'Spreadsheets', color: 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400', action: () => { setTemplateFilter('spreadsheet'); toast.success('Showing spreadsheet templates') } },
                { icon: Presentation, label: 'Slides', color: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400', action: () => { setTemplateFilter('presentation'); toast.success('Showing presentation templates') } },
                { icon: Share2, label: 'Share', color: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400', action: () => handleWebShare() },
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

            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Document Templates</h2>
                <p className="text-gray-500">Start with pre-built templates to save time</p>
              </div>
              <select className="px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700">
                <option>All Categories</option>
                <option>Meetings</option>
                <option>Projects</option>
                <option>Finance</option>
                <option>Engineering</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {templates.map(template => (
                <Card key={template.id} className="hover:shadow-md transition-all cursor-pointer relative">
                  {template.isPremium && (
                    <Badge className="absolute top-3 right-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0">
                      <Star className="h-3 w-3 mr-1" /> Premium
                    </Badge>
                  )}
                  <CardContent className="p-6">
                    <span className="text-4xl block mb-4">{template.icon}</span>
                    <h3 className="font-semibold mb-1">{template.name}</h3>
                    <p className="text-sm text-gray-500 mb-3">{template.description}</p>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">{template.category}</Badge>
                      <span className="text-xs text-gray-500">{template.uses.toLocaleString()} uses</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Shared Tab */}
          <TabsContent value="shared">
            {/* Shared Banner */}
            <div className="bg-gradient-to-r from-cyan-600 via-sky-600 to-blue-600 rounded-2xl p-6 text-white mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Shared Documents</h2>
                  <p className="text-cyan-100">Collaborate on documents shared with you by team members</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{documentFiles.filter(d => d.shared).length}</p>
                    <p className="text-cyan-200 text-sm">Shared</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{documentFiles.filter(d => d.sharingType === 'team').length}</p>
                    <p className="text-cyan-200 text-sm">Team</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Shared Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
              {[
                { icon: Users, label: 'Team Files', color: 'bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400', action: () => { setSharingFilter('team'); toast.success('Showing team files') } },
                { icon: Globe, label: 'Public', color: 'bg-sky-100 text-sky-600 dark:bg-sky-900/30 dark:text-sky-400', action: () => { setSharingFilter('public'); toast.success('Showing public files') } },
                { icon: Link2, label: 'Get Link', color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400', action: async () => {
                  const link = `${window.location.origin}/documents/shared`
                  try { await navigator.clipboard.writeText(link); toast.success('Link copied to clipboard') } catch { toast.error('Failed to copy link') }
                }},
                { icon: Mail, label: 'Email', color: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400', action: () => {
                  const subject = encodeURIComponent('Shared Documents')
                  const body = encodeURIComponent(`Check out these shared documents: ${window.location.origin}/documents/shared`)
                  window.open(`mailto:?subject=${subject}&body=${body}`)
                }},
                { icon: Lock, label: 'Private', color: 'bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400', action: () => { setSharingFilter('private'); toast.success('Showing private files') } },
                { icon: Shield, label: 'Permissions', color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400', action: () => { setActiveTab('settings'); setSettingsTab('sharing') } },
                { icon: Download, label: 'Download', color: 'bg-fuchsia-100 text-fuchsia-600 dark:bg-fuchsia-900/30 dark:text-fuchsia-400', action: () => handleExportAll() },
                { icon: Settings, label: 'Settings', color: 'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400', action: () => setActiveTab('settings') },
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

            <Card>
              <CardHeader>
                <CardTitle>Shared with Me</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {documentFiles.filter(d => d.shared).map(doc => (
                    <div key={doc.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all cursor-pointer" onClick={() => setSelectedDocument(doc)}>
                      <div className="flex items-center gap-4">
                        {getFileIcon(doc.type)}
                        <div>
                          <p className="font-medium">{doc.name}</p>
                          <p className="text-sm text-gray-500">Shared by {doc.ownerName}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className={getSharingColor(doc.sharingType)}>{doc.sharingType}</Badge>
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={`https://avatar.vercel.sh/${doc.ownerName}`} />
                          <AvatarFallback>{doc.ownerName.slice(0, 2)}</AvatarFallback>
                        </Avatar>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          {/* Settings Tab - Google Docs Level with 6 Sub-tabs */}
          <TabsContent value="settings">
            {/* Settings Banner */}
            <div className="bg-gradient-to-r from-gray-700 via-slate-700 to-zinc-700 rounded-2xl p-6 text-white mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Document Settings</h2>
                  <p className="text-gray-100">Configure storage, notifications, sharing, and advanced options</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">6</p>
                    <p className="text-gray-200 text-sm">Categories</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">18</p>
                    <p className="text-gray-200 text-sm">Options</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Settings Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
              {[
                { icon: Settings, label: 'General', color: 'bg-gray-100 text-gray-600 dark:bg-gray-900/30 dark:text-gray-400', action: () => setSettingsTab('general') },
                { icon: HardDrive, label: 'Storage', color: 'bg-slate-100 text-slate-600 dark:bg-slate-900/30 dark:text-slate-400', action: () => setSettingsTab('storage') },
                { icon: Bell, label: 'Alerts', color: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-900/30 dark:text-zinc-400', action: () => setSettingsTab('notifications') },
                { icon: Share2, label: 'Sharing', color: 'bg-neutral-100 text-neutral-600 dark:bg-neutral-900/30 dark:text-neutral-400', action: () => setSettingsTab('sharing') },
                { icon: Zap, label: 'Integrations', color: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400', action: () => setSettingsTab('integrations') },
                { icon: Lock, label: 'Security', color: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400', action: () => setSettingsTab('advanced') },
                { icon: RefreshCw, label: 'Sync', color: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400', action: () => handleSyncDocuments() },
                { icon: Download, label: 'Export', color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400', action: () => handleExportAll() },
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

            <div className="flex gap-6">
              {/* Settings Sidebar */}
              <div className="w-64 shrink-0">
                <div className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 p-4">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 px-3">Settings</h3>
                  <nav className="space-y-1">
                    {[
                      { id: 'general', icon: Settings, label: 'General' },
                      { id: 'storage', icon: HardDrive, label: 'Storage' },
                      { id: 'notifications', icon: Bell, label: 'Notifications' },
                      { id: 'sharing', icon: Share2, label: 'Sharing' },
                      { id: 'integrations', icon: Zap, label: 'Integrations' },
                      { id: 'advanced', icon: Lock, label: 'Advanced' }
                    ].map(item => (
                      <button
                        key={item.id}
                        onClick={() => setSettingsTab(item.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors ${
                          settingsTab === item.id
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                            : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
                        }`}
                      >
                        <item.icon className="h-4 w-4" />
                        {item.label}
                      </button>
                    ))}
                  </nav>
                </div>
              </div>

              {/* Settings Content */}
              <div className="flex-1 space-y-6">
                {/* General Settings */}
                {settingsTab === 'general' && (
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                            <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <CardTitle>Document Settings</CardTitle>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Configure document preferences</p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <Label className="text-gray-900 dark:text-white font-medium">Auto-save Documents</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Save changes automatically</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <Label className="text-gray-900 dark:text-white font-medium">Version History</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Keep track of all document changes</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <Label className="text-gray-900 dark:text-white font-medium">Offline Access</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Access documents without internet</p>
                          </div>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <Label className="text-gray-900 dark:text-white font-medium">Auto-Save Interval</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">How often to save changes</p>
                          </div>
                          <Select defaultValue="30">
                            <SelectTrigger className="w-40">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="10">Every 10 sec</SelectItem>
                              <SelectItem value="30">Every 30 sec</SelectItem>
                              <SelectItem value="60">Every minute</SelectItem>
                              <SelectItem value="300">Every 5 min</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                            <Palette className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                          </div>
                          <div>
                            <CardTitle>Display Settings</CardTitle>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Customize document appearance</p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <Label className="text-gray-900 dark:text-white font-medium">Default View</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Default document list view</p>
                          </div>
                          <Select defaultValue="grid">
                            <SelectTrigger className="w-40">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="grid">Grid View</SelectItem>
                              <SelectItem value="list">List View</SelectItem>
                              <SelectItem value="compact">Compact</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <Label className="text-gray-900 dark:text-white font-medium">Show File Extensions</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Display file extensions in names</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <Label className="text-gray-900 dark:text-white font-medium">Show Thumbnails</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Display document previews</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Storage Settings */}
                {settingsTab === 'storage' && (
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg">
                            <HardDrive className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
                          </div>
                          <div>
                            <CardTitle>Storage Usage</CardTitle>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Manage your storage space</p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="p-4 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg text-white">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold">Pro Plan</span>
                            <Badge className="bg-white/20 text-white border-0">Active</Badge>
                          </div>
                          <p className="text-sm text-white/80">15 GB storage • Unlimited documents</p>
                        </div>
                        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-gray-900 dark:text-white font-medium">Storage Used</span>
                            <span className="text-gray-600 dark:text-gray-400">{formatBytes(stats.totalStorageBytes)} / {formatBytes(storageInfo.total)}</span>
                          </div>
                          <Progress value={(stats.totalStorageBytes / storageInfo.total) * 100} className="h-2" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6">
                          <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <p className="text-sm text-gray-500">Documents</p>
                            <p className="text-lg font-semibold text-gray-900 dark:text-white">{formatBytes(stats.storageBreakdown.documents)}</p>
                          </div>
                          <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <p className="text-sm text-gray-500">Images</p>
                            <p className="text-lg font-semibold text-gray-900 dark:text-white">{formatBytes(stats.storageBreakdown.images)}</p>
                          </div>
                          <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <p className="text-sm text-gray-500">Trash ({stats.archivedDocs} items)</p>
                            <p className="text-lg font-semibold text-gray-900 dark:text-white">{formatBytes(stats.trashSize)}</p>
                          </div>
                          <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <p className="text-sm text-gray-500">Media & Other</p>
                            <p className="text-lg font-semibold text-gray-900 dark:text-white">{formatBytes(stats.storageBreakdown.media + stats.storageBreakdown.other)}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                            <Archive className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                          </div>
                          <div>
                            <CardTitle>Backup & Export</CardTitle>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Export and backup your documents</p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <Label className="text-gray-900 dark:text-white font-medium">Auto-Backup</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Automatically backup documents</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <Label className="text-gray-900 dark:text-white font-medium">Backup Frequency</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">How often to backup</p>
                          </div>
                          <Select defaultValue="daily">
                            <SelectTrigger className="w-40">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="hourly">Hourly</SelectItem>
                              <SelectItem value="daily">Daily</SelectItem>
                              <SelectItem value="weekly">Weekly</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                          <p className="text-sm text-amber-800 dark:text-amber-400">
                            Last backup: {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
                          </p>
                        </div>
                        <div className="flex gap-3">
                          <Button variant="outline" className="flex-1" onClick={() => handleExportAll()}>
                            <Download className="h-4 w-4 mr-2" />
                            Export All
                          </Button>
                          <Button variant="outline" className="flex-1" onClick={() => handleDownloadBackup()}>
                            <Archive className="h-4 w-4 mr-2" />
                            Download Backup
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Notifications Settings */}
                {settingsTab === 'notifications' && (
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                            <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <CardTitle>Email Notifications</CardTitle>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Configure email alerts</p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <Label className="text-gray-900 dark:text-white font-medium">Share Notifications</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Get notified when documents are shared</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <Label className="text-gray-900 dark:text-white font-medium">Comment Notifications</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Get notified on new comments</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <Label className="text-gray-900 dark:text-white font-medium">Edit Notifications</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Get notified when documents are edited</p>
                          </div>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <Label className="text-gray-900 dark:text-white font-medium">Weekly Summary</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Weekly summary of document activity</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                            <Webhook className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                          </div>
                          <div>
                            <CardTitle>Push Notifications</CardTitle>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Real-time alerts</p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <Label className="text-gray-900 dark:text-white font-medium">Desktop Notifications</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Show browser notifications</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <Label className="text-gray-900 dark:text-white font-medium">Mobile Push</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Send to mobile device</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <Label className="text-gray-900 dark:text-white font-medium">Slack Integration</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Send notifications to Slack</p>
                          </div>
                          <Switch />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Sharing Settings */}
                {settingsTab === 'sharing' && (
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                            <Share2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                          </div>
                          <div>
                            <CardTitle>Default Sharing</CardTitle>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Default sharing preferences</p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <Label className="text-gray-900 dark:text-white font-medium">Default Visibility</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Default visibility for new documents</p>
                          </div>
                          <Select defaultValue="private">
                            <SelectTrigger className="w-40">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="private">Private</SelectItem>
                              <SelectItem value="team">Team</SelectItem>
                              <SelectItem value="organization">Organization</SelectItem>
                              <SelectItem value="public">Public</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <Label className="text-gray-900 dark:text-white font-medium">Allow Copy Link</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Let viewers copy document links</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <Label className="text-gray-900 dark:text-white font-medium">Allow Download</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Let viewers download documents</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <Label className="text-gray-900 dark:text-white font-medium">Allow Print</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Let viewers print documents</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                            <Link2 className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                          </div>
                          <div>
                            <CardTitle>Link Settings</CardTitle>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Configure shared link behavior</p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <Label className="text-gray-900 dark:text-white font-medium">Link Expiration</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Default expiration for shared links</p>
                          </div>
                          <Select defaultValue="never">
                            <SelectTrigger className="w-40">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1day">1 Day</SelectItem>
                              <SelectItem value="7days">7 Days</SelectItem>
                              <SelectItem value="30days">30 Days</SelectItem>
                              <SelectItem value="never">Never</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <Label className="text-gray-900 dark:text-white font-medium">Require Password</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Require password for shared links</p>
                          </div>
                          <Switch />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Integrations Settings */}
                {settingsTab === 'integrations' && (
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                            <HardDrive className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                          </div>
                          <div>
                            <CardTitle>Cloud Storage</CardTitle>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Connect cloud storage services</p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {[
                          { name: 'Google Drive', connected: true },
                          { name: 'Dropbox', connected: false },
                          { name: 'OneDrive', connected: true },
                          { name: 'Box', connected: false },
                        ].map((integration, i) => (
                          <div key={i} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${integration.connected ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400'}`}>
                                <HardDrive className="h-5 w-5" />
                              </div>
                              <span className="font-medium text-gray-900 dark:text-white">{integration.name}</span>
                            </div>
                            <Button variant={integration.connected ? 'outline' : 'default'} size="sm" onClick={() => handleCloudIntegration(integration.name, integration.connected)}>
                              {integration.connected ? 'Disconnect' : 'Connect'}
                            </Button>
                          </div>
                        ))}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                            <Key className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                          </div>
                          <div>
                            <CardTitle>API Access</CardTitle>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Manage API tokens</p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <Label className="text-gray-900 dark:text-white font-medium">API Token</Label>
                            <Button variant="outline" size="sm" onClick={() => handleCopyApiToken()} disabled={!apiToken}>
                              <Copy className="h-4 w-4 mr-2" />
                              Copy
                            </Button>
                          </div>
                          <code className="text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded block font-mono break-all">
                            {apiToken || 'No token generated - click Regenerate Token'}
                          </code>
                        </div>
                        <Button variant="outline" className="w-full" onClick={() => handleRegenerateToken()}>
                          <RefreshCw className="h-4 w-4 mr-2" />
                          {apiToken ? 'Regenerate Token' : 'Generate Token'}
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Advanced Settings */}
                {settingsTab === 'advanced' && (
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                            <Database className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                          </div>
                          <div>
                            <CardTitle>Data Management</CardTitle>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Manage your document data</p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <Label className="text-gray-900 dark:text-white font-medium">Version Retention</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">How long to keep old versions</p>
                          </div>
                          <Select defaultValue="forever">
                            <SelectTrigger className="w-40">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="30">30 days</SelectItem>
                              <SelectItem value="90">90 days</SelectItem>
                              <SelectItem value="365">1 year</SelectItem>
                              <SelectItem value="forever">Forever</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <Label className="text-gray-900 dark:text-white font-medium">Auto-Archive</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Archive inactive documents</p>
                          </div>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <Label className="text-gray-900 dark:text-white font-medium">Compress Images</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Automatically compress uploaded images</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                            <Shield className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                          </div>
                          <div>
                            <CardTitle>Security</CardTitle>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Security and privacy settings</p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <Label className="text-gray-900 dark:text-white font-medium">Two-Factor Auth</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Require 2FA for document access</p>
                          </div>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <Label className="text-gray-900 dark:text-white font-medium">Watermark Documents</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Add watermark to shared documents</p>
                          </div>
                          <Switch />
                        </div>
                      </CardContent>
                    </Card>

                    {/* Danger Zone */}
                    <div className="bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-200 dark:border-red-800 p-6">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                          <AlertOctagon className="h-5 w-5 text-red-600 dark:text-red-400" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-red-700 dark:text-red-400">Danger Zone</h3>
                          <p className="text-sm text-red-600/70 dark:text-red-400/70">Destructive actions</p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg border border-red-200 dark:border-red-800">
                          <div>
                            <h4 className="font-medium text-gray-900 dark:text-white">Clear Trash</h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Permanently delete all trashed documents</p>
                          </div>
                          <Button variant="outline" className="border-red-300 text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20" onClick={() => handleClearTrash()}>
                            <Trash2 className="h-4 w-4 mr-2" />
                            Clear Trash
                          </Button>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg border border-red-200 dark:border-red-800">
                          <div>
                            <h4 className="font-medium text-gray-900 dark:text-white">Delete All Documents</h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Permanently remove all documents</p>
                          </div>
                          <Button variant="destructive" onClick={() => handleDeleteAllDocuments()}>
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete All
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Enhanced Competitive Upgrade Components */}
        {insightsPanel.isOpen && (
          <CollapsibleInsightsPanel title="Insights & Analytics" defaultOpen={true} className="mt-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <AIInsightsPanel
                  insights={documentsAIInsights}
                  title="Document Intelligence"
                  onInsightAction={(insight) => {
                    // Store insight action in localStorage and navigate based on insight type
                    const insightActions = JSON.parse(localStorage.getItem('document_insights_actions') || '[]')
                    insightActions.push({ insightId: insight.id || Date.now(), action: 'viewed', timestamp: new Date().toISOString() })
                    localStorage.setItem('document_insights_actions', JSON.stringify(insightActions))

                    // Navigate based on insight category
                    if (insight.category === 'storage' || insight.title?.toLowerCase().includes('storage')) {
                      setActiveTab('settings')
                      setSettingsTab('storage')
                    } else if (insight.category === 'sharing' || insight.title?.toLowerCase().includes('share')) {
                      setActiveTab('shared')
                    } else if (insight.category === 'organization' || insight.title?.toLowerCase().includes('folder')) {
                      setActiveTab('folders')
                    } else {
                      setActiveTab('documents')
                    }
                    toast.success(insight.title || 'AI Insight Applied', { description: insight.description || 'Navigating to relevant section' })
                  }}
                />
              </div>
              <div className="space-y-6">
                <CollaborationIndicator
                  collaborators={teamMembers.map(member => ({
                    id: member.id,
                    name: member.name,
                    avatar: member.avatar_url || undefined,
                    status: member.status === 'active' ? 'online' as const : member.status === 'on_leave' ? 'away' as const : 'offline' as const
                  }))}
                  maxVisible={4}
                />
                <PredictiveAnalytics
                  predictions={documentsPredictions}
                  title="Storage Forecasts"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
              <ActivityFeed
                activities={activityLogs.slice(0, 10).map(log => ({
                  id: log.id,
                  type: log.activity_type === 'create' ? 'create' as const : log.activity_type === 'update' ? 'update' as const : log.activity_type === 'delete' ? 'delete' as const : 'update' as const,
                  title: log.action,
                  description: log.resource_name || undefined,
                  user: { name: log.user_name || 'System', avatar: undefined },
                  timestamp: log.created_at,
                  isUnread: log.status === 'pending'
                }))}
                title="Document Activity"
                maxItems={5}
              />
              <QuickActionsToolbar
                actions={documentsQuickActions}
                variant="grid"
              />
            </div>
          </CollapsibleInsightsPanel>
        )}

        {/* Document Detail Modal */}
        {selectedDocument && (
          <Dialog open={!!selectedDocument} onOpenChange={() => setSelectedDocument(null)}>
            <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden">
              <DialogHeader>
                <div className="flex items-center gap-3">
                  {getFileIcon(selectedDocument.type)}
                  <div>
                    <DialogTitle className="text-xl">{selectedDocument.name}</DialogTitle>
                    <p className="text-sm text-gray-500">
                      {selectedDocument.ownerName} • Last edited {selectedDocument.updatedAt.toLocaleString()}
                    </p>
                  </div>
                </div>
              </DialogHeader>
              <ScrollArea className="h-[400px] mt-4">
                <Tabs defaultValue="details">
                  <TabsList>
                    <TabsTrigger value="details">Details</TabsTrigger>
                    <TabsTrigger value="history">History</TabsTrigger>
                    <TabsTrigger value="comments">Comments ({selectedDocument.comments})</TabsTrigger>
                    <TabsTrigger value="sharing">Sharing</TabsTrigger>
                  </TabsList>
                  <TabsContent value="details" className="mt-4 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <p className="text-sm text-gray-500">Status</p>
                        <Badge className={`mt-1 ${getStatusColor(selectedDocument.status)}`}>{selectedDocument.status}</Badge>
                      </div>
                      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <p className="text-sm text-gray-500">Size</p>
                        <p className="font-medium mt-1">{formatBytes(selectedDocument.size)}</p>
                      </div>
                      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <p className="text-sm text-gray-500">Version</p>
                        <p className="font-medium mt-1">v{selectedDocument.version}</p>
                      </div>
                      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <p className="text-sm text-gray-500">Sharing</p>
                        <Badge className={`mt-1 ${getSharingColor(selectedDocument.sharingType)}`}>{selectedDocument.sharingType}</Badge>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {selectedDocument.tags.map(tag => (
                        <Badge key={tag} variant="outline">{tag}</Badge>
                      ))}
                    </div>
                  </TabsContent>
                  <TabsContent value="history" className="mt-4 space-y-2">
                    {versionHistory.map((version, i) => (
                      <div key={version.id} className={`flex items-start gap-3 p-3 rounded-lg ${i === 0 ? 'bg-cyan-50 dark:bg-cyan-900/20' : 'bg-gray-50 dark:bg-gray-800'}`}>
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={`https://avatar.vercel.sh/${version.userName}`} />
                          <AvatarFallback>{version.userName.slice(0, 2)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{version.userName}</p>
                          <p className="text-sm text-gray-500">{version.changes}</p>
                          <p className="text-xs text-gray-400 mt-1">{version.createdAt.toLocaleString()}</p>
                        </div>
                        {i > 0 && <Button variant="ghost" size="sm" onClick={() => handleRestoreVersion(version)}>Restore</Button>}
                      </div>
                    ))}
                  </TabsContent>
                  <TabsContent value="comments" className="mt-4 space-y-3">
                    {comments.map(comment => (
                      <div key={comment.id} className={`flex gap-3 p-3 rounded-lg ${comment.resolved ? 'bg-green-50 dark:bg-green-900/20' : 'bg-gray-50 dark:bg-gray-800'}`}>
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={`https://avatar.vercel.sh/${comment.userName}`} />
                          <AvatarFallback>{comment.userName.slice(0, 2)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm">{comment.userName}</span>
                            {comment.resolved && <Badge className="bg-green-100 text-green-700 text-xs">Resolved</Badge>}
                          </div>
                          <p className="text-sm">{comment.content}</p>
                          <p className="text-xs text-gray-500 mt-1">{comment.createdAt.toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </TabsContent>
                  <TabsContent value="sharing" className="mt-4 space-y-4">
                    <div className="flex gap-2">
                      <Input placeholder="Add people or groups" className="flex-1" />
                      <Button onClick={() => selectedDocument && handleShareDocument(selectedDocument)}>Share</Button>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Link2 className="h-4 w-4" />
                        <span className="text-sm">Copy link</span>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => handleCopyLink(selectedDocument)}>
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
              </ScrollArea>
              <div className="flex items-center gap-2 pt-4 border-t">
                <Button className="flex-1 bg-cyan-600 hover:bg-cyan-700" onClick={() => selectedDocument && handleOpenDocument(selectedDocument)}>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open Document
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleDownloadDocument(selectedDocument)}
                  disabled={mutating}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleShareDocument(selectedDocument)}
                  disabled={mutating}
                >
                  <Share2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  onClick={() => showMoveToFolderDialog(selectedDocument)}
                  disabled={mutating}
                >
                  <Move className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleArchiveDocument(selectedDocument)}
                  disabled={mutating}
                >
                  <Archive className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={() => confirmDeleteDocument(selectedDocument)}
                  disabled={mutating}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Delete Confirmation Dialog */}
        <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600">
                <AlertCircle className="h-5 w-5" />
                Delete Document
              </DialogTitle>
              <DialogDescription>
                Are you sure you want to delete "{documentToAction?.name}"? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowDeleteConfirm(false)
                  setDocumentToAction(null)
                }}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => documentToAction && handleDeleteDocument(documentToAction)}
                disabled={mutating}
              >
                {mutating ? 'Deleting...' : 'Delete'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Move to Folder Dialog */}
        <Dialog open={showMoveDialog} onOpenChange={setShowMoveDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Move className="h-5 w-5" />
                Move to Folder
              </DialogTitle>
              <DialogDescription>
                Select a folder to move "{documentToAction?.name}" to.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-2 py-4">
              {/* Option to move to root */}
              <button
                onClick={() => documentToAction && handleMoveToFolder(documentToAction, null)}
                disabled={mutating}
                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-left disabled:opacity-50"
              >
                <div className="p-2 rounded-lg bg-gray-400">
                  <Folder className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="font-medium">Root (No folder)</p>
                  <p className="text-xs text-gray-500">Move to top level</p>
                </div>
              </button>
              {dbFolders.length === 0 ? (
                <p className="text-center text-gray-500 py-4">No folders available. Create a folder first.</p>
              ) : dbFolders.map(folder => (
                <button
                  key={folder.id}
                  onClick={() => documentToAction && handleMoveToFolder(documentToAction, folder.id)}
                  disabled={mutating}
                  className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-left disabled:opacity-50"
                >
                  <div className="p-2 rounded-lg" style={{ backgroundColor: folder.color || '#3B82F6' }}>
                    <Folder className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="font-medium">{folder.name}</p>
                    <p className="text-xs text-gray-500">{folder.document_count} items</p>
                  </div>
                </button>
              ))}
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowMoveDialog(false)
                  setDocumentToAction(null)
                }}
              >
                Cancel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Organize Folders Dialog */}
        <Dialog open={showOrganizeDialog} onOpenChange={setShowOrganizeDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FolderTree className="h-5 w-5" />
                Organize Folders
              </DialogTitle>
              <DialogDescription>
                Drag folders to reorder them. Click on a folder to set its parent folder.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-2 mb-4">
                <Label className="text-sm font-medium">Sort by:</Label>
                <Select defaultValue="custom" onValueChange={(value) => {
                  if (value === 'name') {
                    setFolderOrder([...folderOrder].sort((a, b) => a.name.localeCompare(b.name)))
                  } else if (value === 'size') {
                    setFolderOrder([...folderOrder].sort((a, b) => b.size - a.size))
                  } else if (value === 'items') {
                    setFolderOrder([...folderOrder].sort((a, b) => b.documentCount - a.documentCount))
                  } else if (value === 'date') {
                    setFolderOrder([...folderOrder].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()))
                  }
                }}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Sort by..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="custom">Custom Order</SelectItem>
                    <SelectItem value="name">Name (A-Z)</SelectItem>
                    <SelectItem value="size">Size (Largest)</SelectItem>
                    <SelectItem value="items">Items (Most)</SelectItem>
                    <SelectItem value="date">Date (Newest)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-2">
                  {folderOrder.map((folder, index) => (
                    <div
                      key={folder.id}
                      className="flex items-center gap-3 p-3 rounded-lg border bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-move"
                    >
                      <div className="flex items-center gap-2 text-gray-400">
                        <span className="text-sm font-mono w-6">{index + 1}</span>
                        <div className="flex flex-col gap-0.5">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-5 w-5 p-0"
                            disabled={index === 0}
                            onClick={() => {
                              const newOrder = [...folderOrder]
                              const temp = newOrder[index - 1]
                              newOrder[index - 1] = newOrder[index]
                              newOrder[index] = temp
                              setFolderOrder(newOrder)
                            }}
                          >
                            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                            </svg>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-5 w-5 p-0"
                            disabled={index === folderOrder.length - 1}
                            onClick={() => {
                              const newOrder = [...folderOrder]
                              const temp = newOrder[index + 1]
                              newOrder[index + 1] = newOrder[index]
                              newOrder[index] = temp
                              setFolderOrder(newOrder)
                            }}
                          >
                            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </Button>
                        </div>
                      </div>
                      <div className={`p-2 rounded-lg ${folder.color}`}>
                        <Folder className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{folder.name}</p>
                        <p className="text-xs text-gray-500">{folder.documentCount} items - {formatBytes(folder.size)}</p>
                      </div>
                      <Select defaultValue="root" onValueChange={(parentId) => {
                        if (parentId !== 'root' && parentId !== folder.id) {
                          // Save folder parent relationship to localStorage
                          const folderParents = JSON.parse(localStorage.getItem('folder_parents') || '{}')
                          folderParents[folder.id] = parentId
                          localStorage.setItem('folder_parents', JSON.stringify(folderParents))
                          // Update folder in state with parent
                          setFolderOrder(prev => prev.map(f => f.id === folder.id ? { ...f, parentId } : f))
                          const parentFolder = folderOrder.find(f => f.id === parentId)
                          toast.success(`Moved "${folder.name}" into "${parentFolder?.name || 'folder'}"`, { description: 'Folder hierarchy updated' })
                        } else if (parentId === 'root') {
                          // Remove parent relationship
                          const folderParents = JSON.parse(localStorage.getItem('folder_parents') || '{}')
                          delete folderParents[folder.id]
                          localStorage.setItem('folder_parents', JSON.stringify(folderParents))
                          setFolderOrder(prev => prev.map(f => f.id === folder.id ? { ...f, parentId: undefined } : f))
                        }
                      }}>
                        <SelectTrigger className="w-[140px]">
                          <SelectValue placeholder="Parent folder" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="root">Root (No Parent)</SelectItem>
                          {folderOrder.filter(f => f.id !== folder.id).map(f => (
                            <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
            <DialogFooter className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setFolderOrder(dbFolders.map(f => ({ id: f.id, name: f.name, color: f.color || 'bg-blue-500', parentId: f.parent_id || undefined, documentCount: f.document_count, size: f.total_size, createdAt: new Date(f.created_at), shared: f.is_shared, ownerId: f.user_id, ownerName: '' })))
                  setShowOrganizeDialog(false)
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  // Save folder order to localStorage
                  const orderData = folderOrder.map((f, idx) => ({ id: f.id, order: idx, parentId: f.parentId }))
                  localStorage.setItem('folder_order', JSON.stringify(orderData))
                  // Save colors as well
                  const colorData = folderOrder.reduce((acc, f) => ({ ...acc, [f.id]: f.color }), {})
                  localStorage.setItem('folder_colors', JSON.stringify(colorData))
                  toast.success('Folder organization saved', { description: 'Your folder order and hierarchy has been saved' })
                  setShowOrganizeDialog(false)
                }}
              >
                Save Order
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Share Document Dialog - Wired to Supabase */}
        <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Share2 className="h-5 w-5" />
                Share Document
              </DialogTitle>
              <DialogDescription>
                Share "{documentToAction?.name || selectedDocument?.name}" with others.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {/* Share by email */}
              <div className="space-y-2">
                <Label htmlFor="share-email">Share with email</Label>
                <Input
                  id="share-email"
                  type="email"
                  placeholder="Enter email address"
                  value={shareEmail}
                  onChange={(e) => setShareEmail(e.target.value)}
                />
              </div>
              {/* Permission level */}
              <div className="space-y-2">
                <Label>Permission level</Label>
                <Select value={sharePermission} onValueChange={(v) => setSharePermission(v as PermissionLevel)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="view">Can view</SelectItem>
                    <SelectItem value="comment">Can comment</SelectItem>
                    <SelectItem value="edit">Can edit</SelectItem>
                    <SelectItem value="admin">Full access</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {/* Create public link option */}
              <div className="flex items-center justify-between">
                <div>
                  <Label>Create public link</Label>
                  <p className="text-xs text-gray-500">Anyone with the link can view</p>
                </div>
                <Switch />
              </div>
              {/* Current shares */}
              {documentShares.length > 0 && (
                <div className="space-y-2">
                  <Label>Currently shared with</Label>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {documentShares.map(share => (
                      <div key={share.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">{share.shared_with_email || 'Public link'}</span>
                          <Badge variant="outline" className="text-xs">{share.permission_level}</Badge>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRevokeShare(share.id)}
                          disabled={mutating}
                        >
                          <Trash2 className="h-3 w-3 text-red-500" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowShareDialog(false)
                  setShareEmail('')
                  setSharePermission('view')
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={async () => {
                  const docToShare = documentToAction || selectedDocument
                  if (docToShare) {
                    await handleShareDocument(docToShare, {
                      email: shareEmail || undefined,
                      permissionLevel: sharePermission,
                      createPublicLink: !shareEmail
                    })
                    setShowShareDialog(false)
                    setShareEmail('')
                    setSharePermission('view')
                  }
                }}
                disabled={mutating}
              >
                {mutating ? 'Sharing...' : 'Share'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Upload New Version Dialog */}
        <Dialog open={showVersionDialog} onOpenChange={setShowVersionDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Upload New Version
              </DialogTitle>
              <DialogDescription>
                Upload a new version of "{selectedDocument?.name}".
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="version-summary">Change summary</Label>
                <Input
                  id="version-summary"
                  placeholder="What changed in this version?"
                  value={versionChangeSummary}
                  onChange={(e) => setVersionChangeSummary(e.target.value)}
                />
              </div>
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
                <CloudUpload className="h-10 w-10 mx-auto text-gray-400 mb-3" />
                <p className="text-sm text-gray-500 mb-3">Select the new version file</p>
                <input
                  ref={versionFileInputRef}
                  type="file"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0]
                    if (file && selectedDocument) {
                      await handleUploadVersion(selectedDocument.id, file, versionChangeSummary)
                      setShowVersionDialog(false)
                      setVersionChangeSummary('')
                    }
                  }}
                />
                <Button
                  variant="outline"
                  onClick={() => versionFileInputRef.current?.click()}
                  disabled={mutating}
                >
                  {mutating ? 'Uploading...' : 'Select File'}
                </Button>
              </div>
              {/* Version history */}
              {documentVersions.length > 0 && (
                <div className="space-y-2">
                  <Label>Version history</Label>
                  <ScrollArea className="h-32">
                    <div className="space-y-2">
                      {documentVersions.map((version, i) => (
                        <div key={version.id} className={`p-2 rounded ${i === 0 ? 'bg-cyan-50 dark:bg-cyan-900/20' : 'bg-gray-50 dark:bg-gray-800'}`}>
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="text-sm font-medium">v{version.version_number}</span>
                              <span className="text-xs text-gray-500 ml-2">{formatBytes(version.file_size)}</span>
                            </div>
                            {i > 0 && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => selectedDocument && handleRestoreVersionAction(selectedDocument.id, version.id)}
                                disabled={mutating}
                              >
                                Restore
                              </Button>
                            )}
                          </div>
                          <p className="text-xs text-gray-500">{version.change_summary}</p>
                          <p className="text-xs text-gray-400">{new Date(version.created_at).toLocaleDateString()}</p>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowVersionDialog(false)
                  setVersionChangeSummary('')
                }}
              >
                Cancel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Create Folder Dialog */}
        <Dialog open={showFolderDialog} onOpenChange={setShowFolderDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FolderPlus className="h-5 w-5" />
                Create New Folder
              </DialogTitle>
              <DialogDescription>
                Create a new folder to organize your documents.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="folder-name">Folder name</Label>
                <Input
                  id="folder-name"
                  placeholder="Enter folder name"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Folder color</Label>
                <div className="flex gap-2 flex-wrap">
                  {['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#F97316'].map(color => (
                    <button
                      key={color}
                      className={`w-8 h-8 rounded-full ${newFolderColor === color ? 'ring-2 ring-offset-2 ring-gray-900' : ''}`}
                      style={{ backgroundColor: color }}
                      onClick={() => setNewFolderColor(color)}
                    />
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowFolderDialog(false)
                  setNewFolderName('')
                  setNewFolderColor('#3B82F6')
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={async () => {
                  if (newFolderName.trim()) {
                    await handleCreateFolder(newFolderName, { color: newFolderColor })
                    setShowFolderDialog(false)
                    setNewFolderName('')
                    setNewFolderColor('#3B82F6')
                  } else {
                    toast.error('Please enter a folder name')
                  }
                }}
                disabled={mutating || !newFolderName.trim()}
              >
                {mutating ? 'Creating...' : 'Create Folder'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
