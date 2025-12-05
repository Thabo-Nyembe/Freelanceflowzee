'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Search,
  Grid,
  List,
  Download,
  Eye,
  Folder,
  File,
  FileText,
  Image,
  Video,
  Music,
  FileArchive,
  Code,
  Loader2,
  RefreshCw
} from 'lucide-react'
import { StorageFile } from '@/lib/storage/providers'
import { useStorageData } from '@/lib/hooks/use-storage-data'
import { toast } from 'sonner'
import { formatDistanceToNow } from 'date-fns'

export function UnifiedFileBrowser() {
  const { files, connections, loading, error, refresh } = useStorageData()
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [filteredFiles, setFilteredFiles] = useState<StorageFile[]>([])

  useEffect(() => {
    if (searchQuery) {
      const filtered = files.filter(file =>
        file.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setFilteredFiles(filtered)
    } else {
      setFilteredFiles(files)
    }
  }, [files, searchQuery])

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
  }

  const getFileIcon = (file: StorageFile) => {
    if (file.isFolder) return <Folder className="w-5 h-5 text-blue-500" />

    const mimeType = file.mimeType.toLowerCase()

    if (mimeType.includes('image')) return <Image className="w-5 h-5 text-green-500" />
    if (mimeType.includes('video')) return <Video className="w-5 h-5 text-purple-500" />
    if (mimeType.includes('audio')) return <Music className="w-5 h-5 text-pink-500" />
    if (mimeType.includes('zip') || mimeType.includes('archive')) return <FileArchive className="w-5 h-5 text-orange-500" />
    if (mimeType.includes('code') || mimeType.includes('javascript') || mimeType.includes('typescript')) return <Code className="w-5 h-5 text-blue-600" />
    if (mimeType.includes('text') || mimeType.includes('document')) return <FileText className="w-5 h-5 text-gray-600" />

    return <File className="w-5 h-5 text-gray-500" />
  }

  const getProviderBadge = (provider: string) => {
    const colors: Record<string, string> = {
      'google-drive': 'bg-blue-100 text-blue-700',
      'dropbox': 'bg-blue-200 text-blue-800',
      'onedrive': 'bg-blue-300 text-blue-900',
      'box': 'bg-purple-100 text-purple-700',
      'icloud': 'bg-gray-100 text-gray-700'
    }

    return colors[provider] || 'bg-gray-100 text-gray-700'
  }

  const handleDownload = async (file: StorageFile) => {
    try {
      if (file.downloadUrl) {
        window.open(file.downloadUrl, '_blank')
        toast.success(`Downloading ${file.name}`)
      } else {
        toast.error('Download URL not available')
      }
    } catch (error) {
      console.error('Download error:', error)
      toast.error('Failed to download file')
    }
  }

  const handlePreview = (file: StorageFile) => {
    if (file.webViewUrl) {
      window.open(file.webViewUrl, '_blank')
    } else {
      toast.info('Preview not available for this file')
    }
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="text-center py-12">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={refresh}>Try Again</Button>
        </div>
      </Card>
    )
  }

  if (connections.length === 0 && !loading) {
    return (
      <Card className="p-6">
        <div className="text-center py-12">
          <Folder className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Storage Connected</h3>
          <p className="text-sm text-gray-500">
            Connect a storage provider to see your files here
          </p>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      {/* Header with Search and Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search files across all providers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="flex border rounded-lg">
            <Button
              size="sm"
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              onClick={() => setViewMode('grid')}
              className="rounded-r-none"
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              onClick={() => setViewMode('list')}
              className="rounded-l-none"
            >
              <List className="w-4 h-4" />
            </Button>
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={refresh}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Files Display */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          <p className="ml-3 text-sm text-muted-foreground">Loading files...</p>
        </div>
      ) : filteredFiles.length === 0 ? (
        <div className="text-center py-12">
          <File className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchQuery ? 'No files found' : 'No files yet'}
          </h3>
          <p className="text-sm text-gray-500">
            {searchQuery
              ? `No files match "${searchQuery}"`
              : 'Upload files to your connected storage providers'}
          </p>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-muted-foreground">
              {filteredFiles.length} {filteredFiles.length === 1 ? 'file' : 'files'}
              {searchQuery && ` matching "${searchQuery}"`}
            </p>
          </div>

          {viewMode === 'grid' ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {filteredFiles.map((file) => (
                <div
                  key={file.id}
                  className="group border rounded-lg p-4 hover:shadow-md transition-all cursor-pointer"
                  onClick={() => handlePreview(file)}
                >
                  <div className="flex flex-col items-center text-center">
                    {file.thumbnail ? (
                      <img
                        src={file.thumbnail}
                        alt={file.name}
                        className="w-16 h-16 object-cover rounded mb-2"
                      />
                    ) : (
                      <div className="w-16 h-16 flex items-center justify-center mb-2">
                        {getFileIcon(file)}
                      </div>
                    )}

                    <p className="text-sm font-medium line-clamp-2 mb-1">{file.name}</p>
                    <p className="text-xs text-muted-foreground">{formatBytes(file.size)}</p>

                    <Badge className={`mt-2 text-xs ${getProviderBadge(file.provider)}`}>
                      {file.provider}
                    </Badge>

                    <div className="flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation()
                          handlePreview(file)
                        }}
                      >
                        <Eye className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDownload(file)
                        }}
                      >
                        <Download className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredFiles.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:shadow-md transition-all cursor-pointer"
                  onClick={() => handlePreview(file)}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {getFileIcon(file)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatBytes(file.size)} • Modified{' '}
                        {formatDistanceToNow(new Date(file.modifiedAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge className={`text-xs ${getProviderBadge(file.provider)}`}>
                      {file.provider}
                    </Badge>

                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation()
                        handlePreview(file)
                      }}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDownload(file)
                      }}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </Card>
  )
}
