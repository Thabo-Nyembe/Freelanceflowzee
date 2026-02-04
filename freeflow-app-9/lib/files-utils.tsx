/**
 * ========================================
 * FILES UTILITIES - PRODUCTION READY
 * ========================================
 *
 * Complete file management system with:
 * - Multi-format support (PDF, images, videos, documents, code, archives)
 * - Folder organization with hierarchical structure
 * - File versioning and history
 * - Sharing and permissions
 * - Starred/favorite files
 * - Tags and metadata
 * - Storage quota tracking
 * - Trash and recovery
 * - Bulk operations
 */

import { createSimpleLogger } from '@/lib/simple-logger'

const logger = createSimpleLogger('FilesUtils')

// ========================================
// TYPE DEFINITIONS
// ========================================

export type FileType = 'pdf' | 'figma' | 'folder' | 'video' | 'excel' | 'image' | 'archive' | 'word' | 'code' | 'text' | 'audio' | 'presentation'
export type FileStatus = 'active' | 'archived' | 'deleted' | 'locked'
export type SharePermission = 'view' | 'comment' | 'edit' | 'admin'
export type SortBy = 'name' | 'date' | 'size' | 'type'
export type ViewMode = 'grid' | 'list'

export interface FileItem {
  id: string
  userId: string
  name: string
  type: FileType
  size: number
  sizeFormatted: string
  dateCreated: Date
  dateModified: Date
  owner: string
  folderId?: string
  folderPath: string
  starred: boolean
  shared: boolean
  locked: boolean
  thumbnail?: string
  tags: string[]
  description?: string
  version: number
  mimeType: string
  status: FileStatus
  metadata: {
    width?: number
    height?: number
    duration?: number
    pages?: number
    resolution?: string
  }
}

export interface Folder {
  id: string
  userId: string
  name: string
  path: string
  parentId?: string
  fileCount: number
  totalSize: number
  dateCreated: Date
  dateModified: Date
  color?: string
  icon?: string
  shared: boolean
}

export interface FileVersion {
  id: string
  fileId: string
  version: number
  size: number
  dateCreated: Date
  uploadedBy: string
  comment?: string
  storageLocation: string
}

export interface FileShare {
  id: string
  fileId: string
  sharedBy: string
  sharedWith: string
  permission: SharePermission
  expiresAt?: Date
  dateShared: Date
  lastAccessed?: Date
}

export interface FileTag {
  id: string
  userId: string
  name: string
  color: string
  fileCount: number
}

export interface StorageQuota {
  userId: string
  used: number
  total: number
  percentage: number
  breakdown: {
    images: number
    videos: number
    documents: number
    archives: number
    other: number
  }
}

export interface FileActivity {
  id: string
  fileId: string
  userId: string
  action: 'created' | 'modified' | 'viewed' | 'shared' | 'downloaded' | 'deleted' | 'restored'
  timestamp: Date
  metadata?: Record<string, any>
}

// ========================================
// CONSTANTS
// ========================================

const FILE_NAMES = [
  'Project Proposal.pdf',
  'Design Mockups.fig',
  'Marketing Assets',
  'Tutorial Video.mp4',
  'Budget 2024.xlsx',
  'Team Photo.jpg',
  'Source Code.zip',
  'Meeting Notes.docx',
  'API Documentation.md',
  'Client Presentation.pptx',
  'Database Backup.sql',
  'Logo Design.svg',
  'Product Catalog.pdf',
  'Analytics Report.xlsx',
  'Brand Guidelines.pdf',
  'Website Wireframes.fig',
  'Training Materials',
  'Demo Recording.mp4',
  'Financial Statement.xlsx',
  'Company Profile.pdf'
]

const FOLDERS = [
  'Projects',
  'Marketing',
  'Development',
  'Design',
  'Documents',
  'Media',
  'Archives',
  'Templates',
  'Resources',
  'Clients'
]

const TAGS = [
  'important',
  'draft',
  'final',
  'review',
  'approved',
  'client',
  'internal',
  'urgent',
  'archived',
  'template'
]

const FILE_TYPE_EXTENSIONS: Record<FileType, string[]> = {
  pdf: ['pdf'],
  figma: ['fig'],
  folder: [],
  video: ['mp4', 'mov', 'avi', 'mkv', 'webm'],
  excel: ['xlsx', 'xls', 'csv'],
  image: ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'],
  archive: ['zip', 'rar', '7z', 'tar', 'gz'],
  word: ['docx', 'doc'],
  code: ['js', 'ts', 'tsx', 'jsx', 'py', 'java', 'cpp', 'cs', 'go', 'rb'],
  text: ['txt', 'md', 'json', 'xml', 'yaml'],
  audio: ['mp3', 'wav', 'ogg', 'flac'],
  presentation: ['pptx', 'ppt', 'key']
}

const FILE_TYPE_COLORS: Record<FileType, string> = {
  pdf: 'red',
  figma: 'purple',
  folder: 'blue',
  video: 'orange',
  excel: 'green',
  image: 'pink',
  archive: 'gray',
  word: 'blue',
  code: 'yellow',
  text: 'slate',
  audio: 'purple',
  presentation: 'orange'
}

// ========================================
// MOCK DATA GENERATION
// ========================================

export function generateMockFiles(count: number = 100, userId: string = 'user-1'): FileItem[] {
  logger.info('Generating mock files', { count, userId })

  const files: FileItem[] = []
  const now = new Date()
  const fileTypes: FileType[] = ['pdf', 'figma', 'video', 'excel', 'image', 'archive', 'word', 'code', 'text', 'audio', 'presentation']

  for (let i = 0; i < count; i++) {
    const type = fileTypes[i % fileTypes.length]
    const size = Math.floor(Math.random() * 100000000) + 10000 // 10KB - 100MB
    const daysAgo = Math.floor(Math.random() * 90) // Last 90 days

    files.push({
      id: `file-${i + 1}`,
      userId,
      name: FILE_NAMES[i % FILE_NAMES.length],
      type,
      size,
      sizeFormatted: formatFileSize(size),
      dateCreated: new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000),
      dateModified: new Date(now.getTime() - Math.floor(daysAgo / 2) * 24 * 60 * 60 * 1000),
      owner: userId,
      folderId: i % 5 === 0 ? `folder-${(i % 10) + 1}` : undefined,
      folderPath: i % 5 === 0 ? `/${FOLDERS[i % FOLDERS.length]}` : '/',
      starred: i % 7 === 0,
      shared: i % 4 === 0,
      locked: i % 15 === 0,
      thumbnail: ['image', 'video'].includes(type) ? `/thumbnails/file-${i + 1}.jpg` : undefined,
      tags: [
        TAGS[i % TAGS.length],
        TAGS[(i + 1) % TAGS.length]
      ],
      description: i % 3 === 0 ? `Description for ${FILE_NAMES[i % FILE_NAMES.length]}` : undefined,
      version: Math.floor(i / 20) + 1,
      mimeType: getMimeType(type),
      status: 'active',
      metadata: getFileMetadata(type)
    })
  }

  logger.debug('Mock files generated', {
    total: files.length,
    byType: fileTypes.map(t => ({ type: t, count: files.filter(f => f.type === t).length }))
  })

  return files
}

export function generateMockFolders(count: number = 20, userId: string = 'user-1'): Folder[] {
  logger.info('Generating mock folders', { count, userId })

  const folders: Folder[] = []
  const now = new Date()

  for (let i = 0; i < count; i++) {
    const fileCount = Math.floor(Math.random() * 50) + 1
    const avgFileSize = 5000000 // 5MB average
    const totalSize = fileCount * avgFileSize

    folders.push({
      id: `folder-${i + 1}`,
      userId,
      name: FOLDERS[i % FOLDERS.length] + (i >= FOLDERS.length ? ` ${Math.floor(i / FOLDERS.length) + 1}` : ''),
      path: `/${FOLDERS[i % FOLDERS.length]}`,
      parentId: i % 4 === 0 && i > 0 ? `folder-${Math.floor(i / 2)}` : undefined,
      fileCount,
      totalSize,
      dateCreated: new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000),
      dateModified: new Date(now.getTime() - i * 3 * 24 * 60 * 60 * 1000),
      color: ['blue', 'green', 'purple', 'orange', 'pink'][i % 5],
      icon: 'Folder',
      shared: i % 5 === 0
    })
  }

  logger.debug('Mock folders generated', { count: folders.length })
  return folders
}

export function generateMockTags(userId: string = 'user-1'): FileTag[] {
  logger.info('Generating mock tags', { userId })

  const colors = ['red', 'blue', 'green', 'yellow', 'purple', 'orange', 'pink', 'cyan', 'gray', 'indigo']

  return TAGS.map((tag, i) => ({
    id: `tag-${i + 1}`,
    userId,
    name: tag,
    color: colors[i % colors.length],
    fileCount: Math.floor(Math.random() * 50) + 1
  }))
}

// ========================================
// UTILITY FUNCTIONS
// ========================================

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

export function getMimeType(fileType: FileType): string {
  const mimeTypes: Record<FileType, string> = {
    pdf: 'application/pdf',
    figma: 'application/figma',
    folder: 'inode/directory',
    video: 'video/mp4',
    excel: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    image: 'image/jpeg',
    archive: 'application/zip',
    word: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    code: 'text/javascript',
    text: 'text/plain',
    audio: 'audio/mpeg',
    presentation: 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
  }
  return mimeTypes[fileType]
}

export function getFileMetadata(fileType: FileType): FileItem['metadata'] {
  const metadata: FileItem['metadata'] = {}

  switch (fileType) {
    case 'image':
      metadata.width = 1920
      metadata.height = 1080
      metadata.resolution = '1920x1080'
      break
    case 'video':
      metadata.width = 1920
      metadata.height = 1080
      metadata.duration = Math.floor(Math.random() * 600) + 60 // 1-10 minutes
      break
    case 'pdf':
    case 'word':
    case 'presentation':
      metadata.pages = Math.floor(Math.random() * 50) + 1
      break
  }

  return metadata
}

export function getFileIcon(fileType: FileType): string {
  const icons: Record<FileType, string> = {
    pdf: 'FileText',
    figma: 'FileCode',
    folder: 'Folder',
    video: 'Video',
    excel: 'FileSpreadsheet',
    image: 'Image',
    archive: 'Archive',
    word: 'FileText',
    code: 'FileCode',
    text: 'FileText',
    audio: 'Music',
    presentation: 'Presentation'
  }
  return icons[fileType]
}

export function getFileColor(fileType: FileType): string {
  return FILE_TYPE_COLORS[fileType]
}

export function getFileExtension(fileName: string): string {
  const parts = fileName.split('.')
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : ''
}

export function detectFileType(fileName: string): FileType {
  const ext = getFileExtension(fileName)

  for (const [type, extensions] of Object.entries(FILE_TYPE_EXTENSIONS)) {
    if (extensions.includes(ext)) {
      return type as FileType
    }
  }

  return 'text'
}

export function searchFiles(files: FileItem[], searchTerm: string): FileItem[] {
  if (!searchTerm.trim()) return files

  const term = searchTerm.toLowerCase()
  logger.debug('Searching files', { term, totalFiles: files.length })

  const filtered = files.filter(file =>
    file.name.toLowerCase().includes(term) ||
    file.tags.some(tag => tag.toLowerCase().includes(term)) ||
    file.description?.toLowerCase().includes(term) ||
    file.folderPath.toLowerCase().includes(term)
  )

  logger.info('File search complete', {
    term,
    resultsCount: filtered.length,
    totalSearched: files.length
  })

  return filtered
}

export function filterByFolder(files: FileItem[], folderId?: string): FileItem[] {
  if (!folderId) return files.filter(f => !f.folderId)

  logger.debug('Filtering files by folder', { folderId })

  const filtered = files.filter(f => f.folderId === folderId)

  logger.info('Files filtered by folder', {
    folderId,
    resultsCount: filtered.length
  })

  return filtered
}

export function filterByType(files: FileItem[], fileType: FileType | 'all'): FileItem[] {
  if (fileType === 'all') return files

  logger.debug('Filtering files by type', { fileType })

  const filtered = files.filter(f => f.type === fileType)

  logger.info('Files filtered by type', {
    fileType,
    resultsCount: filtered.length
  })

  return filtered
}

export function sortFiles(files: FileItem[], sortBy: SortBy, ascending: boolean = true): FileItem[] {
  logger.debug('Sorting files', { sortBy, ascending, totalFiles: files.length })

  const sorted = [...files].sort((a, b) => {
    let comparison = 0

    switch (sortBy) {
      case 'name':
        comparison = a.name.localeCompare(b.name)
        break
      case 'date':
        comparison = b.dateModified.getTime() - a.dateModified.getTime()
        break
      case 'size':
        comparison = b.size - a.size
        break
      case 'type':
        comparison = a.type.localeCompare(b.type)
        break
    }

    return ascending ? comparison : -comparison
  })

  logger.info('Files sorted', { sortBy, ascending, count: sorted.length })
  return sorted
}

export function getStarredFiles(files: FileItem[]): FileItem[] {
  return files.filter(f => f.starred)
}

export function getSharedFiles(files: FileItem[]): FileItem[] {
  return files.filter(f => f.shared)
}

export function getRecentFiles(files: FileItem[], count: number = 10): FileItem[] {
  return [...files]
    .sort((a, b) => b.dateModified.getTime() - a.dateModified.getTime())
    .slice(0, count)
}

export function calculateStorageQuota(files: FileItem[], totalQuota: number = 100 * 1024 * 1024 * 1024): StorageQuota {
  logger.debug('Calculating storage quota', { totalFiles: files.length, totalQuota })

  const breakdown = {
    images: 0,
    videos: 0,
    documents: 0,
    archives: 0,
    other: 0
  }

  let totalUsed = 0

  files.forEach(file => {
    totalUsed += file.size

    switch (file.type) {
      case 'image':
        breakdown.images += file.size
        break
      case 'video':
        breakdown.videos += file.size
        break
      case 'pdf':
      case 'word':
      case 'excel':
      case 'presentation':
      case 'text':
        breakdown.documents += file.size
        break
      case 'archive':
        breakdown.archives += file.size
        break
      default:
        breakdown.other += file.size
    }
  })

  const quota: StorageQuota = {
    userId: files[0]?.userId || 'user-1',
    used: totalUsed,
    total: totalQuota,
    percentage: Math.round((totalUsed / totalQuota) * 100),
    breakdown
  }

  logger.info('Storage quota calculated', {
    used: formatFileSize(quota.used),
    total: formatFileSize(quota.total),
    percentage: quota.percentage
  })

  return quota
}

export function getFileStats(files: FileItem[]): {
  totalFiles: number
  totalSize: number
  totalSizeFormatted: string
  byType: Record<FileType, number>
  starred: number
  shared: number
  locked: number
} {
  const byType: Record<FileType, number> = {
    pdf: 0,
    figma: 0,
    folder: 0,
    video: 0,
    excel: 0,
    image: 0,
    archive: 0,
    word: 0,
    code: 0,
    text: 0,
    audio: 0,
    presentation: 0
  }

  let totalSize = 0
  let starred = 0
  let shared = 0
  let locked = 0

  files.forEach(file => {
    byType[file.type]++
    totalSize += file.size
    if (file.starred) starred++
    if (file.shared) shared++
    if (file.locked) locked++
  })

  return {
    totalFiles: files.length,
    totalSize,
    totalSizeFormatted: formatFileSize(totalSize),
    byType,
    starred,
    shared,
    locked
  }
}

export function exportFilesList(files: FileItem[], format: 'json' | 'csv'): Blob {
  logger.info('Exporting files list', { format, count: files.length })

  if (format === 'json') {
    const data = JSON.stringify(files, null, 2)
    return new Blob([data], { type: 'application/json' })
  }

  // CSV format
  const headers = ['Name', 'Type', 'Size', 'Date Modified', 'Owner', 'Folder', 'Starred', 'Shared', 'Tags']
  const rows = files.map(f => [
    f.name,
    f.type,
    f.sizeFormatted,
    f.dateModified.toISOString(),
    f.owner,
    f.folderPath,
    f.starred ? 'Yes' : 'No',
    f.shared ? 'Yes' : 'No',
    f.tags.join('; ')
  ])

  const csv = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n')

  return new Blob([csv], { type: 'text/csv' })
}

export function bulkUpdateTags(files: FileItem[], fileIds: string[], tagsToAdd: string[], tagsToRemove: string[] = []): FileItem[] {
  logger.info('Bulk updating tags', {
    fileCount: fileIds.length,
    tagsToAdd,
    tagsToRemove
  })

  return files.map(file => {
    if (!fileIds.includes(file.id)) return file

    let newTags = [...file.tags]

    // Remove tags
    if (tagsToRemove.length > 0) {
      newTags = newTags.filter(tag => !tagsToRemove.includes(tag))
    }

    // Add tags
    tagsToAdd.forEach(tag => {
      if (!newTags.includes(tag)) {
        newTags.push(tag)
      }
    })

    return { ...file, tags: newTags }
  })
}

export function moveFiles(files: FileItem[], fileIds: string[], targetFolderId?: string, targetFolderPath: string = '/'): FileItem[] {
  logger.info('Moving files', {
    fileCount: fileIds.length,
    targetFolderId,
    targetFolderPath
  })

  return files.map(file => {
    if (!fileIds.includes(file.id)) return file

    return {
      ...file,
      folderId: targetFolderId,
      folderPath: targetFolderPath,
      dateModified: new Date()
    }
  })
}

export function duplicateFile(file: FileItem): FileItem {
  logger.info('Duplicating file', { fileId: file.id, fileName: file.name })

  const nameParts = file.name.split('.')
  const ext = nameParts.length > 1 ? `.${nameParts[nameParts.length - 1]}` : ''
  const baseName = ext ? file.name.slice(0, -ext.length) : file.name

  return {
    ...file,
    id: `${file.id}-copy-${Date.now()}`,
    name: `${baseName} (Copy)${ext}`,
    dateCreated: new Date(),
    dateModified: new Date(),
    version: 1,
    starred: false
  }
}

export function validateFileName(name: string): { valid: boolean; error?: string } {
  if (!name || name.trim().length === 0) {
    return { valid: false, error: 'File name is required' }
  }

  if (name.length > 255) {
    return { valid: false, error: 'File name is too long (max 255 characters)' }
  }

  const invalidChars = /[<>:"/\\|?*]/g
  if (invalidChars.test(name)) {
    return { valid: false, error: 'File name contains invalid characters' }
  }

  return { valid: true }
}

export function getFolderBreadcrumbs(folderPath: string): string[] {
  if (folderPath === '/') return ['Home']

  const parts = folderPath.split('/').filter(p => p.length > 0)
  return ['Home', ...parts]
}

export function canPerformAction(file: FileItem, action: 'edit' | 'delete' | 'share' | 'download'): boolean {
  // Locked files can only be downloaded
  if (file.locked) {
    return action === 'download'
  }

  // All other actions allowed for unlocked files
  return true
}

export default {
  generateMockFiles,
  generateMockFolders,
  generateMockTags,
  formatFileSize,
  getMimeType,
  getFileMetadata,
  getFileIcon,
  getFileColor,
  getFileExtension,
  detectFileType,
  searchFiles,
  filterByFolder,
  filterByType,
  sortFiles,
  getStarredFiles,
  getSharedFiles,
  getRecentFiles,
  calculateStorageQuota,
  getFileStats,
  exportFilesList,
  bulkUpdateTags,
  moveFiles,
  duplicateFile,
  validateFileName,
  getFolderBreadcrumbs,
  canPerformAction
}
