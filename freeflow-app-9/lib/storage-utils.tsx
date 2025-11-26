/**
 * 💾 STORAGE MANAGEMENT UTILITIES
 * Comprehensive utilities for multi-cloud file storage
 */

import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('Storage-Utils')

// ============================================================================
// TYPESCRIPT INTERFACES
// ============================================================================

export type StorageProvider = 'aws' | 'google' | 'azure' | 'dropbox' | 'local'
export type FileType = 'document' | 'image' | 'video' | 'audio' | 'archive' | 'code' | 'other'
export type FileStatus = 'synced' | 'syncing' | 'error' | 'offline'
export type SharingPermission = 'view' | 'edit' | 'admin'

export interface StorageFile {
  id: string
  userId: string
  name: string
  type: FileType
  size: number
  provider: StorageProvider
  status: FileStatus
  path: string
  extension: string
  mimeType: string
  uploadedAt: Date
  modifiedAt: Date
  accessedAt?: Date
  sharedWith: string[]
  isPublic: boolean
  downloadCount: number
  thumbnail?: string
  tags: string[]
  version: number
  checksum: string
}

export interface StorageFolder {
  id: string
  userId: string
  name: string
  path: string
  provider: StorageProvider
  parentId?: string
  createdAt: Date
  updatedAt: Date
  sharedWith: string[]
  isPublic: boolean
  fileCount: number
  totalSize: number
}

export interface StorageProviderConfig {
  id: StorageProvider
  name: string
  maxFileSize: number // in bytes
  allowedTypes: FileType[]
  enabled: boolean
  apiKey?: string
  region?: string
}

export interface StorageQuota {
  userId: string
  totalQuota: number // in bytes
  usedSpace: number // in bytes
  fileCount: number
  lastUpdated: Date
}

export interface FileShare {
  id: string
  fileId: string
  sharedBy: string
  sharedWith: string
  permission: SharingPermission
  expiresAt?: Date
  createdAt: Date
}

export interface FileVersion {
  id: string
  fileId: string
  version: number
  size: number
  checksum: string
  uploadedBy: string
  uploadedAt: Date
  comment?: string
}

// ============================================================================
// MOCK DATA - 100 Storage Files
// ============================================================================

const fileNames = [
  'Project Proposal.pdf', 'Annual Report 2024.docx', 'Budget Spreadsheet.xlsx',
  'Team Photo.jpg', 'Product Banner.png', 'Logo Design.svg',
  'Marketing Video.mp4', 'Tutorial Screencast.mov', 'Demo Recording.webm',
  'Podcast Episode 1.mp3', 'Background Music.wav', 'Interview Audio.flac',
  'Project Archive.zip', 'Backup Files.tar.gz', 'Source Code.7z',
  'Main Application.js', 'API Server.py', 'Database Schema.sql',
  'Meeting Notes.txt', 'README.md', 'Configuration.json',
  'Presentation Slides.pptx', 'Invoice Template.pdf', 'Contract Draft.docx',
  'Product Mockup.fig', 'UI Designs.sketch', 'Brand Guidelines.pdf',
  'Client Feedback.csv', 'Sales Data.xlsx', 'Analytics Report.pdf',
  'Website Backup.zip', 'App Source Code.tar', 'Build Artifacts.zip',
  'Training Materials.pdf', 'Onboarding Guide.docx', 'Company Handbook.pdf',
  'Profile Picture.jpg', 'Cover Image.png', 'Thumbnail.webp',
  'Promotional Video.mp4', 'Tutorial Series.mov', 'Webinar Recording.mp4'
]

export const mockStorageFiles: StorageFile[] = Array.from({ length: 100 }, (_, i) => {
  const providers: StorageProvider[] = ['aws', 'google', 'azure', 'dropbox', 'local']
  const types: FileType[] = ['document', 'image', 'video', 'audio', 'archive', 'code']
  const statuses: FileStatus[] = ['synced', 'syncing', 'error', 'offline']

  const name = fileNames[i % fileNames.length]
  const extension = name.split('.').pop() || 'file'
  const type = getFileTypeFromExtension(extension)
  const provider = providers[Math.floor(Math.random() * providers.length)]

  const uploadedDate = new Date()
  uploadedDate.setDate(uploadedDate.getDate() - Math.floor(Math.random() * 90))

  return {
    id: `SF-${String(i + 1).padStart(4, '0')}`,
    userId: 'user_demo_123',
    name,
    type,
    size: Math.floor(Math.random() * 100000000) + 10000, // 10KB - 100MB
    provider,
    status: statuses[Math.floor(Math.random() * statuses.length)],
    path: `/storage/${provider}/${name}`,
    extension,
    mimeType: getMimeType(extension),
    uploadedAt: uploadedDate,
    modifiedAt: new Date(uploadedDate.getTime() + Math.random() * 30 * 24 * 60 * 60 * 1000),
    accessedAt: Math.random() > 0.5 ? new Date() : undefined,
    sharedWith: Math.random() > 0.7 ? ['user@example.com', 'team@example.com'] : [],
    isPublic: Math.random() > 0.8,
    downloadCount: Math.floor(Math.random() * 500),
    tags: ['work', 'important', 'project', 'archive', 'shared'].slice(0, Math.floor(Math.random() * 3) + 1),
    version: Math.floor(Math.random() * 5) + 1,
    checksum: `md5_${Math.random().toString(36).substr(2, 32)}`
  }
})

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}

export function formatDate(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`
  return `${Math.floor(diffDays / 365)} years ago`
}

export function getFileTypeFromExtension(extension: string): FileType {
  const ext = extension.toLowerCase()

  const types: Record<FileType, string[]> = {
    document: ['pdf', 'doc', 'docx', 'txt', 'odt', 'rtf', 'tex', 'wpd', 'xlsx', 'xls', 'csv', 'pptx', 'ppt'],
    image: ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'bmp', 'ico', 'tiff', 'psd'],
    video: ['mp4', 'mov', 'avi', 'wmv', 'flv', 'webm', 'mkv', 'm4v'],
    audio: ['mp3', 'wav', 'flac', 'm4a', 'aac', 'ogg', 'wma'],
    archive: ['zip', 'rar', 'tar', 'gz', '7z', 'bz2', 'xz'],
    code: ['js', 'ts', 'jsx', 'tsx', 'py', 'java', 'cpp', 'c', 'go', 'rb', 'php', 'html', 'css', 'sql', 'sh', 'json', 'xml', 'yaml', 'yml']
  }

  for (const [type, extensions] of Object.entries(types)) {
    if (extensions.includes(ext)) {
      return type as FileType
    }
  }

  return 'other'
}

export function getMimeType(extension: string): string {
  const ext = extension.toLowerCase()

  const mimeTypes: Record<string, string> = {
    // Documents
    'pdf': 'application/pdf',
    'doc': 'application/msword',
    'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'txt': 'text/plain',
    'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'xls': 'application/vnd.ms-excel',
    'csv': 'text/csv',
    'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'ppt': 'application/vnd.ms-powerpoint',
    // Images
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'svg': 'image/svg+xml',
    'webp': 'image/webp',
    // Videos
    'mp4': 'video/mp4',
    'mov': 'video/quicktime',
    'avi': 'video/x-msvideo',
    'webm': 'video/webm',
    // Audio
    'mp3': 'audio/mpeg',
    'wav': 'audio/wav',
    'flac': 'audio/flac',
    // Archives
    'zip': 'application/zip',
    'tar': 'application/x-tar',
    'gz': 'application/gzip',
    '7z': 'application/x-7z-compressed',
    // Code
    'js': 'text/javascript',
    'json': 'application/json',
    'html': 'text/html',
    'css': 'text/css',
    'xml': 'application/xml'
  }

  return mimeTypes[ext] || 'application/octet-stream'
}

export function getFilesByProvider(files: StorageFile[], provider: StorageProvider): StorageFile[] {
  logger.debug('Filtering files by provider', { provider, totalFiles: files.length })
  return files.filter(f => f.provider === provider)
}

export function getFilesByType(files: StorageFile[], type: FileType): StorageFile[] {
  logger.debug('Filtering files by type', { type, totalFiles: files.length })
  return files.filter(f => f.type === type)
}

export function getFilesByStatus(files: StorageFile[], status: FileStatus): StorageFile[] {
  logger.debug('Filtering files by status', { status, totalFiles: files.length })
  return files.filter(f => f.status === status)
}

export function searchFiles(files: StorageFile[], searchTerm: string): StorageFile[] {
  const searchLower = searchTerm.toLowerCase()
  logger.debug('Searching files', { searchTerm, totalFiles: files.length })

  return files.filter(f =>
    f.name.toLowerCase().includes(searchLower) ||
    f.path.toLowerCase().includes(searchLower) ||
    f.tags.some(tag => tag.toLowerCase().includes(searchLower)) ||
    f.extension.toLowerCase().includes(searchLower)
  )
}

export function sortFiles(
  files: StorageFile[],
  sortBy: 'name' | 'size' | 'date' | 'downloads' | 'type'
): StorageFile[] {
  logger.debug('Sorting files', { sortBy, totalFiles: files.length })

  return [...files].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name)
      case 'size':
        return b.size - a.size
      case 'date':
        return b.uploadedAt.getTime() - a.uploadedAt.getTime()
      case 'downloads':
        return b.downloadCount - a.downloadCount
      case 'type':
        return a.type.localeCompare(b.type)
      default:
        return 0
    }
  })
}

export function calculateStorageStats(files: StorageFile[]) {
  logger.debug('Calculating storage statistics', { totalFiles: files.length })

  const totalFiles = files.length
  const totalSize = files.reduce((sum, f) => sum + f.size, 0)
  const syncedFiles = files.filter(f => f.status === 'synced').length
  const errorFiles = files.filter(f => f.status === 'error').length
  const sharedFiles = files.filter(f => f.sharedWith.length > 0 || f.isPublic).length
  const publicFiles = files.filter(f => f.isPublic).length
  const totalDownloads = files.reduce((sum, f) => sum + f.downloadCount, 0)

  const providerStats = {
    aws: files.filter(f => f.provider === 'aws').length,
    google: files.filter(f => f.provider === 'google').length,
    azure: files.filter(f => f.provider === 'azure').length,
    dropbox: files.filter(f => f.provider === 'dropbox').length,
    local: files.filter(f => f.provider === 'local').length
  }

  const typeStats = {
    document: files.filter(f => f.type === 'document').length,
    image: files.filter(f => f.type === 'image').length,
    video: files.filter(f => f.type === 'video').length,
    audio: files.filter(f => f.type === 'audio').length,
    archive: files.filter(f => f.type === 'archive').length,
    code: files.filter(f => f.type === 'code').length,
    other: files.filter(f => f.type === 'other').length
  }

  const stats = {
    totalFiles,
    totalSize,
    syncedFiles,
    errorFiles,
    sharedFiles,
    publicFiles,
    totalDownloads,
    providerStats,
    typeStats,
    avgFileSize: totalFiles > 0 ? Math.round(totalSize / totalFiles) : 0,
    syncRate: totalFiles > 0 ? Math.round((syncedFiles / totalFiles) * 100) : 0
  }

  logger.info('Storage statistics calculated', stats)
  return stats
}

export function getRecentFiles(files: StorageFile[], limit: number = 10): StorageFile[] {
  logger.debug('Getting recent files', { limit, totalFiles: files.length })
  return sortFiles(files, 'date').slice(0, limit)
}

export function getPopularFiles(files: StorageFile[], limit: number = 10): StorageFile[] {
  logger.debug('Getting popular files', { limit, totalFiles: files.length })
  return sortFiles(files, 'downloads').slice(0, limit)
}

export function getLargestFiles(files: StorageFile[], limit: number = 10): StorageFile[] {
  logger.debug('Getting largest files', { limit, totalFiles: files.length })
  return sortFiles(files, 'size').slice(0, limit)
}

export function getSharedFiles(files: StorageFile[]): StorageFile[] {
  logger.debug('Getting shared files', { totalFiles: files.length })
  return files.filter(f => f.sharedWith.length > 0 || f.isPublic)
}

export function getPublicFiles(files: StorageFile[]): StorageFile[] {
  logger.debug('Getting public files', { totalFiles: files.length })
  return files.filter(f => f.isPublic)
}

export function calculateQuotaUsage(files: StorageFile[], totalQuota: number) {
  const usedSpace = files.reduce((sum, f) => sum + f.size, 0)
  const usagePercent = (usedSpace / totalQuota) * 100
  const remainingSpace = totalQuota - usedSpace

  return {
    usedSpace,
    totalQuota,
    remainingSpace,
    usagePercent: Math.round(usagePercent * 100) / 100,
    fileCount: files.length
  }
}

export function generateFileChecksum(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      // Note: This is a simplified checksum - in production, use crypto.subtle.digest
      const hash = btoa(reader.result as string).substring(0, 32)
      resolve(`md5_${hash}`)
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export function validateFileUpload(file: File, maxSize: number = 100 * 1024 * 1024): { valid: boolean; error?: string } {
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File size exceeds maximum allowed size of ${formatFileSize(maxSize)}`
    }
  }

  if (file.size === 0) {
    return {
      valid: false,
      error: 'File is empty'
    }
  }

  return { valid: true }
}

logger.info('Storage utilities initialized', {
  mockFiles: mockStorageFiles.length
})
