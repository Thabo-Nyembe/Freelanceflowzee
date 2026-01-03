'use client'
import { useState, useMemo, useRef } from 'react'
import { useDocuments, useDocumentMutations, type Document, type DocumentType } from '@/lib/hooks/use-documents'
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
// MOCK DATA
// ============================================================================

const mockDocuments: DocumentFile[] = [
  { id: '1', name: 'Product Roadmap 2024', type: 'document', extension: 'docx', size: 245000, ownerId: '1', ownerName: 'John Developer', status: 'published', starred: true, shared: true, sharingType: 'team', permissions: [], version: 12, createdAt: new Date('2024-01-15'), updatedAt: new Date(Date.now() - 1000 * 60 * 30), tags: ['roadmap', 'product'], comments: 8 },
  { id: '2', name: 'Q4 Financial Report', type: 'spreadsheet', extension: 'xlsx', size: 890000, ownerId: '2', ownerName: 'Sarah Finance', status: 'approved', starred: true, shared: true, sharingType: 'organization', permissions: [], version: 5, createdAt: new Date('2024-02-01'), updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2), tags: ['finance', 'quarterly'], comments: 3 },
  { id: '3', name: 'Team Presentation', type: 'presentation', extension: 'pptx', size: 4500000, ownerId: '3', ownerName: 'Mike Designer', status: 'review', starred: false, shared: true, sharingType: 'team', permissions: [], version: 8, createdAt: new Date('2024-02-15'), updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 5), tags: ['presentation', 'team'], comments: 12 },
  { id: '4', name: 'API Documentation', type: 'document', extension: 'md', size: 125000, ownerId: '1', ownerName: 'John Developer', status: 'published', starred: false, shared: true, sharingType: 'public', permissions: [], version: 25, createdAt: new Date('2024-01-01'), updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24), tags: ['api', 'docs'], comments: 0 },
  { id: '5', name: 'Design System Guide', type: 'document', extension: 'docx', size: 1200000, ownerId: '3', ownerName: 'Mike Designer', status: 'draft', starred: false, shared: false, sharingType: 'private', permissions: [], version: 3, createdAt: new Date('2024-03-01'), updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 8), tags: ['design', 'guide'], comments: 5 },
  { id: '6', name: 'Meeting Notes - March', type: 'document', extension: 'docx', size: 45000, ownerId: '4', ownerName: 'Emily PM', status: 'published', starred: false, shared: true, sharingType: 'team', permissions: [], version: 2, createdAt: new Date('2024-03-10'), updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), tags: ['meetings', 'notes'], comments: 1 },
  { id: '7', name: 'Brand Assets', type: 'archive', extension: 'zip', size: 15000000, ownerId: '3', ownerName: 'Mike Designer', status: 'approved', starred: true, shared: true, sharingType: 'organization', permissions: [], version: 1, createdAt: new Date('2024-02-20'), updatedAt: new Date('2024-02-20'), tags: ['brand', 'assets'], comments: 0 },
  { id: '8', name: 'User Research Results', type: 'spreadsheet', extension: 'xlsx', size: 560000, ownerId: '4', ownerName: 'Emily PM', status: 'review', starred: false, shared: true, sharingType: 'team', permissions: [], version: 4, createdAt: new Date('2024-03-05'), updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 48), tags: ['research', 'ux'], comments: 7 },
]

const mockFolders: DocumentFolder[] = [
  { id: '1', name: 'Projects', color: 'bg-blue-500', documentCount: 24, size: 45000000, createdAt: new Date('2024-01-01'), shared: true, ownerId: '1', ownerName: 'John Developer' },
  { id: '2', name: 'Marketing', color: 'bg-pink-500', documentCount: 18, size: 32000000, createdAt: new Date('2024-01-15'), shared: true, ownerId: '2', ownerName: 'Sarah Finance' },
  { id: '3', name: 'Engineering', color: 'bg-emerald-500', documentCount: 42, size: 78000000, createdAt: new Date('2024-02-01'), shared: true, ownerId: '1', ownerName: 'John Developer' },
  { id: '4', name: 'Design', color: 'bg-purple-500', documentCount: 35, size: 125000000, createdAt: new Date('2024-01-20'), shared: true, ownerId: '3', ownerName: 'Mike Designer' },
  { id: '5', name: 'Finance', color: 'bg-amber-500', documentCount: 12, size: 15000000, createdAt: new Date('2024-02-15'), shared: false, ownerId: '2', ownerName: 'Sarah Finance' },
  { id: '6', name: 'Archive', color: 'bg-gray-500', documentCount: 156, size: 890000000, createdAt: new Date('2024-01-01'), shared: false, ownerId: '1', ownerName: 'John Developer' },
]

const mockTemplates: DocTemplate[] = [
  { id: '1', name: 'Meeting Notes', description: 'Capture discussion points and action items', category: 'Meetings', icon: '📝', type: 'document', uses: 12400, isPremium: false },
  { id: '2', name: 'Project Brief', description: 'Define project scope and timeline', category: 'Projects', icon: '📋', type: 'document', uses: 8900, isPremium: false },
  { id: '3', name: 'Budget Tracker', description: 'Track expenses and income', category: 'Finance', icon: '💰', type: 'spreadsheet', uses: 6500, isPremium: false },
  { id: '4', name: 'Pitch Deck', description: 'Impress investors and stakeholders', category: 'Business', icon: '🎯', type: 'presentation', uses: 4200, isPremium: true },
  { id: '5', name: 'Product Spec', description: 'Document product requirements', category: 'Product', icon: '📦', type: 'document', uses: 5600, isPremium: false },
  { id: '6', name: 'Design Doc', description: 'Outline design decisions', category: 'Design', icon: '🎨', type: 'document', uses: 3400, isPremium: false },
  { id: '7', name: 'Sprint Planning', description: 'Plan and track sprints', category: 'Engineering', icon: '🏃', type: 'spreadsheet', uses: 7800, isPremium: false },
  { id: '8', name: 'OKR Template', description: 'Set and track objectives', category: 'Planning', icon: '🎯', type: 'spreadsheet', uses: 9200, isPremium: true },
]

const mockVersionHistory: VersionEntry[] = [
  { id: '1', version: 12, userId: '1', userName: 'John Developer', changes: 'Updated timeline section', size: 245000, createdAt: new Date(Date.now() - 1000 * 60 * 30) },
  { id: '2', version: 11, userId: '3', userName: 'Mike Designer', changes: 'Added new graphics', size: 243000, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2) },
  { id: '3', version: 10, userId: '4', userName: 'Emily PM', changes: 'Fixed formatting issues', size: 240000, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24) },
  { id: '4', version: 9, userId: '1', userName: 'John Developer', changes: 'Added Q2 milestones', size: 238000, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48) },
]

const mockComments: Comment[] = [
  { id: '1', documentId: '1', userId: '2', userName: 'Sarah Finance', content: 'Can we add more details about the budget allocation?', resolved: false, replies: [], createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2) },
  { id: '2', documentId: '1', userId: '4', userName: 'Emily PM', content: 'Great progress! The timeline looks solid.', resolved: true, replies: [], createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24) },
  { id: '3', documentId: '1', userId: '3', userName: 'Mike Designer', content: 'I\'ll update the design section by EOD', resolved: false, replies: [], createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5) },
]

const mockRecentActivity: RecentActivity[] = [
  { id: '1', action: 'edited', documentId: '1', documentName: 'Product Roadmap 2024', userId: '1', userName: 'John Developer', timestamp: new Date(Date.now() - 1000 * 60 * 30) },
  { id: '2', action: 'shared', documentId: '2', documentName: 'Q4 Financial Report', userId: '2', userName: 'Sarah Finance', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), details: 'with Marketing team' },
  { id: '3', action: 'commented', documentId: '3', documentName: 'Team Presentation', userId: '4', userName: 'Emily PM', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5) },
  { id: '4', action: 'created', documentId: '5', documentName: 'Design System Guide', userId: '3', userName: 'Mike Designer', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8) },
  { id: '5', action: 'moved', documentId: '6', documentName: 'Meeting Notes', userId: '4', userName: 'Emily PM', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), details: 'to Archive folder' },
]

const storageInfo: StorageInfo = {
  used: 2.4 * 1024 * 1024 * 1024,
  total: 15 * 1024 * 1024 * 1024,
  breakdown: {
    documents: 0.8 * 1024 * 1024 * 1024,
    images: 1.2 * 1024 * 1024 * 1024,
    videos: 0.3 * 1024 * 1024 * 1024,
    other: 0.1 * 1024 * 1024 * 1024,
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

// Mock data for AI-powered competitive upgrade components
const mockDocumentsAIInsights = [
  { id: '1', type: 'success' as const, title: 'Storage Optimized', description: 'Smart compression saved 8GB across 2,500 documents this month.', priority: 'low' as const, timestamp: new Date().toISOString(), category: 'Storage' },
  { id: '2', type: 'warning' as const, title: 'Stale Documents', description: '45 documents haven\'t been accessed in 90+ days. Consider archiving.', priority: 'medium' as const, timestamp: new Date().toISOString(), category: 'Cleanup' },
  { id: '3', type: 'info' as const, title: 'Popular Content', description: 'Q4 Strategy Doc viewed 150 times this week - most accessed file!', priority: 'low' as const, timestamp: new Date().toISOString(), category: 'Analytics' },
]

const mockDocumentsCollaborators = [
  { id: '1', name: 'Content Lead', avatar: '/avatars/content.jpg', status: 'online' as const, role: 'Editor' },
  { id: '2', name: 'Legal Team', avatar: '/avatars/legal.jpg', status: 'online' as const, role: 'Reviewer' },
  { id: '3', name: 'Marketing', avatar: '/avatars/marketing.jpg', status: 'away' as const, role: 'Contributor' },
]

const mockDocumentsPredictions = [
  { id: '1', title: 'Storage Forecast', prediction: 'Document storage will reach 85% capacity by end of quarter', confidence: 89, trend: 'up' as const, impact: 'medium' as const },
  { id: '2', title: 'Collaboration Trend', prediction: 'Real-time editing sessions up 40% - consider upgrading plan', confidence: 92, trend: 'up' as const, impact: 'high' as const },
]

const mockDocumentsActivities = [
  { id: '1', user: 'Content Lead', action: 'Created', target: 'Q4 Marketing Strategy', timestamp: new Date().toISOString(), type: 'success' as const },
  { id: '2', user: 'Legal Team', action: 'Approved', target: 'Vendor Contract v2', timestamp: new Date(Date.now() - 3600000).toISOString(), type: 'success' as const },
  { id: '3', user: 'Marketing', action: 'Shared', target: 'Brand Guidelines', timestamp: new Date(Date.now() - 7200000).toISOString(), type: 'info' as const },
]

const mockDocumentsQuickActions = [
  { id: '1', label: 'New Document', icon: 'plus', action: () => console.log('New doc'), variant: 'default' as const },
  { id: '2', label: 'Upload Files', icon: 'upload', action: () => console.log('Upload'), variant: 'default' as const },
  { id: '3', label: 'Create Folder', icon: 'folder', action: () => console.log('New folder'), variant: 'outline' as const },
]

export default function DocumentsClient({ initialDocuments }: { initialDocuments: Document[] }) {
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

  const { data: documents, isLoading: loading, error, refetch } = useDocuments({ status: statusFilter as any, type: typeFilter as any })
  const {
    createDocument,
    updateDocument,
    deleteDocument,
    shareDocument,
    archiveDocument,
    moveToFolder,
    starDocument,
    downloadDocument,
    loading: mutating
  } = useDocumentMutations()

  // Handle creating a new document - REAL SUPABASE OPERATION
  const handleCreateDocument = async (docType: 'document' | 'spreadsheet' | 'presentation' | 'folder') => {
    const typeMap: Record<string, DocumentType> = {
      document: 'report',
      spreadsheet: 'spreadsheet',
      presentation: 'presentation',
      folder: 'other'
    }
    try {
      await createDocument({
        document_title: `Untitled ${docType.charAt(0).toUpperCase() + docType.slice(1)}`,
        document_type: typeMap[docType],
        status: 'draft',
        access_level: 'internal',
        version: '1.0',
        version_number: 1,
        is_latest_version: true,
        is_encrypted: false,
        is_archived: false
      })
      setShowCreateDialog(false)
      refetch()
    } catch (error) {
      console.error('Failed to create document:', error)
    }
  }

  // Handle file upload - REAL SUPABASE OPERATION
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    for (const file of Array.from(files)) {
      const fileExtension = file.name.split('.').pop()?.toLowerCase() || ''
      let docType: DocumentType = 'other'

      // Determine document type from file extension
      if (['doc', 'docx', 'txt', 'rtf', 'odt'].includes(fileExtension)) {
        docType = 'report'
      } else if (['xls', 'xlsx', 'csv', 'ods'].includes(fileExtension)) {
        docType = 'spreadsheet'
      } else if (['ppt', 'pptx', 'odp'].includes(fileExtension)) {
        docType = 'presentation'
      } else if (['pdf'].includes(fileExtension)) {
        docType = 'contract'
      }

      try {
        await createDocument({
          document_title: file.name.replace(/\.[^/.]+$/, ''),
          document_type: docType,
          file_name: file.name,
          file_extension: fileExtension,
          file_size_bytes: file.size,
          file_size_mb: file.size / (1024 * 1024),
          mime_type: file.type,
          status: 'draft',
          access_level: 'internal'
        })
      } catch (error) {
        console.error('Failed to upload document:', error)
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
  const handleShareDocument = async (doc: DocumentFile) => {
    try {
      await shareDocument(doc.id)
      toast.success('Share link copied', {
        description: `Share link for "${doc.name}" copied to clipboard`
      })
      refetch()
    } catch (error) {
      console.error('Failed to share document:', error)
    }
  }

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
  const handleMoveToFolder = async (doc: DocumentFile, folderId: string) => {
    try {
      const folder = mockFolders.find(f => f.id === folderId)
      await moveToFolder(doc.id, folderId, folder?.name)
      toast.success('Document moved', {
        description: `"${doc.name}" moved to ${folder?.name || 'folder'}`
      })
      setShowMoveDialog(false)
      setDocumentToAction(null)
      refetch()
    } catch (error) {
      console.error('Failed to move document:', error)
    }
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

  // Handle download document - REAL SUPABASE OPERATION
  const handleDownloadDocument = async (doc: DocumentFile) => {
    try {
      await downloadDocument(doc.id)
      toast.success('Download started', {
        description: `Downloading "${doc.name}"...`
      })
    } catch (error) {
      console.error('Failed to download document:', error)
    }
  }

  // Calculate comprehensive stats
  const stats = useMemo(() => {
    const totalDocs = mockDocuments.length
    const sharedDocs = mockDocuments.filter(d => d.shared).length
    const starredDocs = mockDocuments.filter(d => d.starred).length
    const draftDocs = mockDocuments.filter(d => d.status === 'draft').length
    const reviewDocs = mockDocuments.filter(d => d.status === 'review').length
    const totalComments = mockDocuments.reduce((sum, d) => sum + d.comments, 0)
    const totalFolders = mockFolders.length
    const storageUsedGB = storageInfo.used / (1024 * 1024 * 1024)

    return {
      totalDocs,
      sharedDocs,
      starredDocs,
      draftDocs,
      reviewDocs,
      totalComments,
      totalFolders,
      storageUsedGB: storageUsedGB.toFixed(1),
    }
  }, [])

  // Filter documents
  const filteredDocuments = useMemo(() => {
    return mockDocuments.filter(doc => {
      const matchesSearch = !searchQuery ||
        doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
      const matchesStatus = statusFilter === 'all' || doc.status === statusFilter
      const matchesType = typeFilter === 'all' || doc.type === typeFilter
      return matchesSearch && matchesStatus && matchesType
    })
  }, [searchQuery, statusFilter, typeFilter])

  const starredDocuments = useMemo(() => mockDocuments.filter(d => d.starred), [])
  const recentDocuments = useMemo(() =>
    [...mockDocuments].sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()).slice(0, 6),
    []
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

  // In demo mode, continue with empty documents instead of showing error

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-indigo-50 dark:bg-none dark:bg-gray-900 p-8">
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
                    <div className="grid grid-cols-2 gap-3 py-4">
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
                <Button variant="ghost" className="text-white hover:bg-white/20">
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
                    <p className="text-3xl font-bold">{mockDocuments.length}</p>
                    <p className="text-blue-200 text-sm">Documents</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{mockFolders.length}</p>
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
                onClick={() => toast.info('Select a document to share')}
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
                  <Button variant="ghost" size="sm">View All</Button>
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
                  <Button variant="ghost" size="sm">View All</Button>
                </CardHeader>
                <CardContent className="space-y-3">
                  {mockRecentActivity.map(activity => (
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
                    <p className="text-3xl font-bold">{mockDocuments.filter(d => d.starred).length}</p>
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
                onClick={() => toast.info('Select a document to export')}
              >
                <Download className="w-5 h-5" />
                <span className="text-xs font-medium">Export</span>
              </Button>
              <Button
                variant="ghost"
                className="h-20 flex-col gap-2 bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 hover:scale-105 transition-all duration-200"
                onClick={() => toast.info('Select a document to duplicate')}
              >
                <Copy className="w-5 h-5" />
                <span className="text-xs font-medium">Duplicate</span>
              </Button>
              <Button
                variant="ghost"
                className="h-20 flex-col gap-2 bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400 hover:scale-105 transition-all duration-200"
                onClick={() => toast.info('Select a document to move')}
              >
                <Move className="w-5 h-5" />
                <span className="text-xs font-medium">Move</span>
              </Button>
              <Button
                variant="ghost"
                className="h-20 flex-col gap-2 bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 hover:scale-105 transition-all duration-200"
                onClick={() => toast.info('Select a document to delete')}
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
                    onChange={(e) => setStatusFilter(e.target.value as any)}
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
                    onChange={(e) => setTypeFilter(e.target.value as any)}
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
                              <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
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
                          <Button variant="ghost" size="sm">
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
                    <p className="text-3xl font-bold">{mockFolders.length}</p>
                    <p className="text-amber-200 text-sm">Folders</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{mockFolders.filter(f => f.shared).length}</p>
                    <p className="text-amber-200 text-sm">Shared</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Folders Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
              {[
                { icon: FolderPlus, label: 'New Folder', color: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' },
                { icon: FolderTree, label: 'Organize', color: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400' },
                { icon: Share2, label: 'Share', color: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' },
                { icon: Move, label: 'Move', color: 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400' },
                { icon: Copy, label: 'Duplicate', color: 'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400' },
                { icon: Archive, label: 'Archive', color: 'bg-fuchsia-100 text-fuchsia-600 dark:bg-fuchsia-900/30 dark:text-fuchsia-400' },
                { icon: Palette, label: 'Color', color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400' },
                { icon: Settings, label: 'Settings', color: 'bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400' },
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {mockFolders.map(folder => (
                <Card key={folder.id} className="hover:shadow-md transition-all cursor-pointer" onClick={() => setSelectedFolder(folder)}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`p-3 rounded-xl ${folder.color}`}>
                        <Folder className="h-6 w-6 text-white" />
                      </div>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                    <h3 className="font-semibold text-lg mb-1">{folder.name}</h3>
                    <p className="text-sm text-gray-500 mb-3">
                      {folder.documentCount} items • {formatBytes(folder.size)}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">{folder.ownerName}</span>
                      {folder.shared && <Users className="h-4 w-4 text-gray-400" />}
                    </div>
                  </CardContent>
                </Card>
              ))}
              <Card className="border-2 border-dashed hover:border-cyan-500 hover:bg-cyan-50/50 dark:hover:bg-cyan-900/20 transition-all cursor-pointer">
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
                    <p className="text-3xl font-bold">{mockTemplates.length}</p>
                    <p className="text-violet-200 text-sm">Templates</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{mockTemplates.filter(t => t.isPremium).length}</p>
                    <p className="text-violet-200 text-sm">Premium</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Templates Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
              {[
                { icon: FilePlus, label: 'Create New', color: 'bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400' },
                { icon: Upload, label: 'Import', color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400' },
                { icon: Sparkles, label: 'AI Generate', color: 'bg-fuchsia-100 text-fuchsia-600 dark:bg-fuchsia-900/30 dark:text-fuchsia-400' },
                { icon: Star, label: 'Premium', color: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' },
                { icon: FileText, label: 'Documents', color: 'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400' },
                { icon: FileSpreadsheet, label: 'Spreadsheets', color: 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400' },
                { icon: Presentation, label: 'Slides', color: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' },
                { icon: Share2, label: 'Share', color: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400' },
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
              {mockTemplates.map(template => (
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
                    <p className="text-3xl font-bold">{mockDocuments.filter(d => d.shared).length}</p>
                    <p className="text-cyan-200 text-sm">Shared</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{mockDocuments.filter(d => d.sharingType === 'team').length}</p>
                    <p className="text-cyan-200 text-sm">Team</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Shared Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
              {[
                { icon: Users, label: 'Team Files', color: 'bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400' },
                { icon: Globe, label: 'Public', color: 'bg-sky-100 text-sky-600 dark:bg-sky-900/30 dark:text-sky-400' },
                { icon: Link2, label: 'Get Link', color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' },
                { icon: Mail, label: 'Email', color: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400' },
                { icon: Lock, label: 'Private', color: 'bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400' },
                { icon: Shield, label: 'Permissions', color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400' },
                { icon: Download, label: 'Download', color: 'bg-fuchsia-100 text-fuchsia-600 dark:bg-fuchsia-900/30 dark:text-fuchsia-400' },
                { icon: Settings, label: 'Settings', color: 'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400' },
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

            <Card>
              <CardHeader>
                <CardTitle>Shared with Me</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {mockDocuments.filter(d => d.shared).map(doc => (
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
                { icon: Settings, label: 'General', color: 'bg-gray-100 text-gray-600 dark:bg-gray-900/30 dark:text-gray-400' },
                { icon: HardDrive, label: 'Storage', color: 'bg-slate-100 text-slate-600 dark:bg-slate-900/30 dark:text-slate-400' },
                { icon: Bell, label: 'Alerts', color: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-900/30 dark:text-zinc-400' },
                { icon: Share2, label: 'Sharing', color: 'bg-neutral-100 text-neutral-600 dark:bg-neutral-900/30 dark:text-neutral-400' },
                { icon: Zap, label: 'Integrations', color: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' },
                { icon: Lock, label: 'Security', color: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400' },
                { icon: RefreshCw, label: 'Sync', color: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' },
                { icon: Download, label: 'Export', color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' },
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
                            <span className="text-gray-600 dark:text-gray-400">{formatBytes(storageInfo.used)} / {formatBytes(storageInfo.total)}</span>
                          </div>
                          <Progress value={(storageInfo.used / storageInfo.total) * 100} className="h-2" />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <p className="text-sm text-gray-500">Documents</p>
                            <p className="text-lg font-semibold text-gray-900 dark:text-white">4.2 GB</p>
                          </div>
                          <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <p className="text-sm text-gray-500">Images</p>
                            <p className="text-lg font-semibold text-gray-900 dark:text-white">2.8 GB</p>
                          </div>
                          <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <p className="text-sm text-gray-500">Trash</p>
                            <p className="text-lg font-semibold text-gray-900 dark:text-white">512 MB</p>
                          </div>
                          <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <p className="text-sm text-gray-500">Other</p>
                            <p className="text-lg font-semibold text-gray-900 dark:text-white">1.5 GB</p>
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
                          <Button variant="outline" className="flex-1">
                            <Download className="h-4 w-4 mr-2" />
                            Export All
                          </Button>
                          <Button variant="outline" className="flex-1">
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
                            <Button variant={integration.connected ? 'outline' : 'default'} size="sm">
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
                            <Button variant="outline" size="sm">
                              <Copy className="h-4 w-4 mr-2" />
                              Copy
                            </Button>
                          </div>
                          <code className="text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded block font-mono">
                            doc_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
                          </code>
                        </div>
                        <Button variant="outline" className="w-full">
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Regenerate Token
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
                          <Button variant="outline" className="border-red-300 text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Clear Trash
                          </Button>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg border border-red-200 dark:border-red-800">
                          <div>
                            <h4 className="font-medium text-gray-900 dark:text-white">Delete All Documents</h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Permanently remove all documents</p>
                          </div>
                          <Button variant="destructive">
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          <div className="lg:col-span-2">
            <AIInsightsPanel
              insights={mockDocumentsAIInsights}
              title="Document Intelligence"
              onInsightAction={(insight) => console.log('Insight action:', insight)}
            />
          </div>
          <div className="space-y-6">
            <CollaborationIndicator
              collaborators={mockDocumentsCollaborators}
              maxVisible={4}
            />
            <PredictiveAnalytics
              predictions={mockDocumentsPredictions}
              title="Storage Forecasts"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <ActivityFeed
            activities={mockDocumentsActivities}
            title="Document Activity"
            maxItems={5}
          />
          <QuickActionsToolbar
            actions={mockDocumentsQuickActions}
            variant="grid"
          />
        </div>

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
                    <div className="grid grid-cols-2 gap-4">
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
                    {mockVersionHistory.map((version, i) => (
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
                        {i > 0 && <Button variant="ghost" size="sm">Restore</Button>}
                      </div>
                    ))}
                  </TabsContent>
                  <TabsContent value="comments" className="mt-4 space-y-3">
                    {mockComments.map(comment => (
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
                      <Button>Share</Button>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Link2 className="h-4 w-4" />
                        <span className="text-sm">Copy link</span>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
              </ScrollArea>
              <div className="flex items-center gap-2 pt-4 border-t">
                <Button className="flex-1 bg-cyan-600 hover:bg-cyan-700">
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
              {mockFolders.map(folder => (
                <button
                  key={folder.id}
                  onClick={() => documentToAction && handleMoveToFolder(documentToAction, folder.id)}
                  disabled={mutating}
                  className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-left disabled:opacity-50"
                >
                  <div className={`p-2 rounded-lg ${folder.color}`}>
                    <Folder className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="font-medium">{folder.name}</p>
                    <p className="text-xs text-gray-500">{folder.documentCount} items</p>
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
      </div>
    </div>
  )
}
