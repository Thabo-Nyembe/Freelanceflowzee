'use client'

import { useState, useCallback, useEffect } from 'react'
import FilesHub from '@/components/hubs/files-hub'

// Mock data for the FilesHub component
const mockFiles = [
  {
    id: '1',
    name: 'Project Proposal.pdf',
    type: 'document' as const,
    size: 2457600, // 2.4 MB in bytes
    url: '/files/project-proposal.pdf',
    uploadedAt: '2024-01-15T10:30:00Z',
    uploadedBy: {
      id: 'user1',
      name: 'John Doe',
      avatar: '/avatars/john.jpg'
    },
    shared: true,
    starred: true,
    downloads: 15,
    views: 42,
    folder: 'Documents',
    tags: ['proposal', 'client', 'project']
  },
  {
    id: '2',
    name: 'Design Mockups.fig',
    type: 'other' as const,
    size: 15925248, // 15.2 MB
    url: '/files/design-mockups.fig',
    uploadedAt: '2024-01-14T15:45:00Z',
    uploadedBy: {
      id: 'user2',
      name: 'Jane Smith',
      avatar: '/avatars/jane.jpg'
    },
    shared: false,
    starred: false,
    downloads: 8,
    views: 23,
    folder: 'Designs',
    tags: ['design', 'figma', 'mockup']
  },
  {
    id: '3',
    name: 'Team Photo.jpg',
    type: 'image' as const,
    size: 3981312, // 3.8 MB
    url: '/files/team-photo.jpg',
    thumbnailUrl: '/files/thumbs/team-photo-thumb.jpg',
    uploadedAt: '2024-01-12T09:20:00Z',
    uploadedBy: {
      id: 'user3',
      name: 'Mike Johnson',
      avatar: '/avatars/mike.jpg'
    },
    shared: true,
    starred: false,
    downloads: 25,
    views: 67,
    folder: 'Images',
    tags: ['team', 'photo', 'company']
  },
  {
    id: '4',
    name: 'Presentation.pptx',
    type: 'document' as const,
    size: 9125888, // 8.7 MB
    url: '/files/presentation.pptx',
    uploadedAt: '2024-01-10T14:15:00Z',
    uploadedBy: {
      id: 'user1',
      name: 'John Doe',
      avatar: '/avatars/john.jpg'
    },
    shared: false,
    starred: true,
    downloads: 12,
    views: 34,
    folder: 'Documents',
    tags: ['presentation', 'powerpoint', 'slides']
  },
  {
    id: '5',
    name: 'Demo Video.mp4',
    type: 'video' as const,
    size: 52428800, // 50 MB
    url: '/files/demo-video.mp4',
    thumbnailUrl: '/files/thumbs/demo-video-thumb.jpg',
    uploadedAt: '2024-01-08T11:30:00Z',
    uploadedBy: {
      id: 'user2',
      name: 'Jane Smith',
      avatar: '/avatars/jane.jpg'
    },
    shared: true,
    starred: true,
    downloads: 18,
    views: 89,
    folder: 'Videos',
    tags: ['demo', 'video', 'presentation']
  }
]

export default function FilesHubPage() {
  const [files, setFiles] = useState(mockFiles)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    console.log('📁 FILES HUB: Loading files...')
    console.log('✅ FILES HUB: Loaded', mockFiles.length, 'files')
  }, [])

  // Upload file handler
  const handleUploadFile = useCallback(async (file: File) => {
    console.log('📤 FILES HUB: Uploading file:', file.name)
    setIsLoading(true)

    try {
      // Simulate file upload
      await new Promise(resolve => setTimeout(resolve, 1500))

      const newFile = {
        id: Date.now().toString(),
        name: file.name,
        type: getFileType(file.name),
        size: file.size,
        url: `/files/${file.name}`,
        uploadedAt: new Date().toISOString(),
        uploadedBy: {
          id: 'current-user',
          name: 'Current User',
          avatar: '/avatars/current-user.jpg'
        },
        shared: false,
        starred: false,
        downloads: 0,
        views: 0,
        folder: 'Uploads',
        tags: []
      }

      setFiles(prev => [newFile, ...prev])
      console.log('✅ FILES HUB: File uploaded successfully:', file.name)
    } catch (error) {
      console.error('❌ FILES HUB: Upload failed:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Delete file handler
  const handleDeleteFile = useCallback((fileId: string) => {
    const file = files.find(f => f.id === fileId)
    console.log('🗑️ FILES HUB: Deleting file:', file?.name)

    setFiles(prev => prev.filter(f => f.id !== fileId))
    console.log('✅ FILES HUB: File deleted successfully')
  }, [files])

  // Download file handler
  const handleDownloadFile = useCallback((fileId: string) => {
    const file = files.find(f => f.id === fileId)
    console.log('📥 FILES HUB: Downloading file:', file?.name)

    // Simulate download
    if (file) {
      // Update download count
      setFiles(prev => prev.map(f =>
        f.id === fileId ? { ...f, downloads: f.downloads + 1 } : f
      ))
      console.log('✅ FILES HUB: File download started')
    }
  }, [files])

  // Share file handler
  const handleShareFile = useCallback((fileId: string, shareWith?: string[]) => {
    const file = files.find(f => f.id === fileId)
    console.log('🔗 FILES HUB: Sharing file:', file?.name)

    if (shareWith && shareWith.length > 0) {
      console.log('📧 FILES HUB: Sharing with:', shareWith.join(', '))
    }

    // Update share status
    setFiles(prev => prev.map(f =>
      f.id === fileId ? { ...f, shared: true } : f
    ))
    console.log('✅ FILES HUB: File shared successfully')
  }, [files])

  // Star/unstar file handler
  const handleToggleStar = useCallback((fileId: string) => {
    const file = files.find(f => f.id === fileId)
    const newStarred = !file?.starred

    console.log(newStarred ? '⭐ FILES HUB: Starring file:' : '☆ FILES HUB: Unstarring file:', file?.name)

    setFiles(prev => prev.map(f =>
      f.id === fileId ? { ...f, starred: newStarred } : f
    ))
    console.log('✅ FILES HUB: Star status updated')
  }, [files])

  // Move file handler
  const handleMoveFile = useCallback((fileId: string, newFolder: string) => {
    const file = files.find(f => f.id === fileId)
    console.log('📂 FILES HUB: Moving file:', file?.name, 'to folder:', newFolder)

    setFiles(prev => prev.map(f =>
      f.id === fileId ? { ...f, folder: newFolder } : f
    ))
    console.log('✅ FILES HUB: File moved successfully')
  }, [files])

  // Rename file handler
  const handleRenameFile = useCallback((fileId: string, newName: string) => {
    const file = files.find(f => f.id === fileId)
    console.log('✏️ FILES HUB: Renaming file:', file?.name, '→', newName)

    setFiles(prev => prev.map(f =>
      f.id === fileId ? { ...f, name: newName } : f
    ))
    console.log('✅ FILES HUB: File renamed successfully')
  }, [files])

  // Bulk delete handler
  const handleBulkDelete = useCallback((fileIds: string[]) => {
    console.log('🗑️ FILES HUB: Bulk deleting', fileIds.length, 'files')

    setFiles(prev => prev.filter(f => !fileIds.includes(f.id)))
    console.log('✅ FILES HUB: Bulk delete completed')
  }, [])

  // Bulk download handler
  const handleBulkDownload = useCallback((fileIds: string[]) => {
    console.log('📥 FILES HUB: Bulk downloading', fileIds.length, 'files')

    // Update download counts
    setFiles(prev => prev.map(f =>
      fileIds.includes(f.id) ? { ...f, downloads: f.downloads + 1 } : f
    ))
    console.log('✅ FILES HUB: Bulk download started')
  }, [])

  // Refresh files handler
  const handleRefresh = useCallback(async () => {
    console.log('🔄 FILES HUB: Refreshing file list...')
    setIsLoading(true)

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800))

      // In a real app, fetch from API
      // const response = await fetch('/api/files')
      // const data = await response.json()
      // setFiles(data.files)

      console.log('✅ FILES HUB: File list refreshed')
    } catch (error) {
      console.error('❌ FILES HUB: Refresh failed:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Search files handler
  const handleSearch = useCallback((query: string) => {
    console.log('🔍 FILES HUB: Searching for:', query)

    if (!query.trim()) {
      console.log('📁 FILES HUB: Showing all files')
      return mockFiles
    }

    const results = mockFiles.filter(file =>
      file.name.toLowerCase().includes(query.toLowerCase()) ||
      file.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
    )

    console.log('✅ FILES HUB: Found', results.length, 'matching files')
    return results
  }, [])

  // Export files handler
  const handleExport = useCallback((format: 'csv' | 'json') => {
    console.log('💾 FILES HUB: Exporting file list as', format.toUpperCase())

    const fileData = files.map(f => ({
      name: f.name,
      type: f.type,
      size: f.size,
      folder: f.folder,
      uploadedAt: f.uploadedAt,
      uploadedBy: f.uploadedBy.name,
      downloads: f.downloads,
      views: f.views,
      starred: f.starred,
      shared: f.shared
    }))

    if (format === 'json') {
      const jsonData = JSON.stringify(fileData, null, 2)
      console.log('📄 FILES HUB: JSON export data generated')
      // In real app: trigger download
      // downloadFile('files-export.json', jsonData, 'application/json')
    } else {
      console.log('📊 FILES HUB: CSV export data generated')
      // In real app: convert to CSV and trigger download
    }

    console.log('✅ FILES HUB: Export completed')
  }, [files])

  // Helper function to determine file type
  const getFileType = (filename: string): 'document' | 'image' | 'video' | 'other' => {
    const ext = filename.split('.').pop()?.toLowerCase()
    if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(ext || '')) return 'image'
    if (['mp4', 'mov', 'avi', 'mkv', 'webm'].includes(ext || '')) return 'video'
    if (['pdf', 'doc', 'docx', 'txt', 'ppt', 'pptx', 'xls', 'xlsx'].includes(ext || '')) return 'document'
    return 'other'
  }

  return (
    <div className="h-full">
      <FilesHub
        userId="current-user"
        files={files}
        onUpload={handleUploadFile}
        onDelete={handleDeleteFile}
        onDownload={handleDownloadFile}
        onShare={handleShareFile}
        onToggleStar={handleToggleStar}
        onMove={handleMoveFile}
        onRename={handleRenameFile}
        onBulkDelete={handleBulkDelete}
        onBulkDownload={handleBulkDownload}
        onRefresh={handleRefresh}
        onSearch={handleSearch}
        onExport={handleExport}
        isLoading={isLoading}
      />
    </div>
  )
}
