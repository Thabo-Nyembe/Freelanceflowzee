"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Upload, 
  FileText, 
  FolderOpen, 
  Download, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Clock,
  Cloud,
  Database,
  Link,
  Trash2,
  RefreshCw,
  Eye,
  Settings
} from 'lucide-react'

export default function ProjectImportPage() {
  const [importStatus, setImportStatus] = useState<any>('idle') // idle, importing, success, error
  const [selectedFiles, setSelectedFiles] = useState<any>([])
  const [importProgress, setImportProgress] = useState<any>(0)

  // Mock import history data
  const importHistory = [
    {
      id: 1,
      name: 'Brand Identity Project',
      source: 'Figma',
      date: '2024-01-15',
      status: 'success',
      filesCount: 24,
      size: '45.2 MB',
      type: 'design'
    },
    {
      id: 2,
      name: 'Website Assets',
      source: 'Google Drive',
      date: '2024-01-12',
      status: 'success',
      filesCount: 156,
      size: '128.7 MB',
      type: 'web'
    },
    {
      id: 3,
      name: 'Client Feedback',
      source: 'Dropbox',
      date: '2024-01-10',
      status: 'failed',
      filesCount: 8,
      size: '12.3 MB',
      type: 'documents'
    },
    {
      id: 4,
      name: 'Video Assets',
      source: 'OneDrive',
      date: '2024-01-08',
      status: 'processing',
      filesCount: 12,
      size: '2.1 GB',
      type: 'video'
    }
  ]

  const importSources = [
    {
      id: 'figma',
      name: 'Figma',
      icon: '🎨',
      description: 'Import designs and prototypes from Figma',
      connected: true
    },
    {
      id: 'google-drive',
      name: 'Google Drive',
      icon: '📁',
      description: 'Import files from Google Drive',
      connected: true
    },
    {
      id: 'dropbox',
      name: 'Dropbox',
      icon: '📦',
      description: 'Import files from Dropbox',
      connected: false
    },
    {
      id: 'onedrive',
      name: 'OneDrive',
      icon: '☁️',
      description: 'Import files from Microsoft OneDrive',
      connected: true
    },
    {
      id: 'github',
      name: 'GitHub',
      icon: '🐙',
      description: 'Import code repositories from GitHub',
      connected: false
    },
    {
      id: 'trello',
      name: 'Trello',
      icon: '📋',
      description: 'Import boards and cards from Trello',
      connected: false
    }
  ]

  const getStatusColor = (status) => {
    switch (status) {
      case 'success': return 'bg-green-100 text-green-800'
      case 'failed': return 'bg-red-100 text-red-800'
      case 'processing': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-4 w-4" />
      case 'failed': return <XCircle className="h-4 w-4" />
      case 'processing': return <Clock className="h-4 w-4" />
      default: return <AlertCircle className="h-4 w-4" />
    }
  }

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files)
    setSelectedFiles(files)
  }

  const simulateImport = () => {
    setImportStatus('importing')
    setImportProgress(0)
    
    const interval = setInterval(() => {
      setImportProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          setImportStatus('success')
          return 100
        }
        return prev + 10
      })
    }, 500)
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold kazi-text-dark dark:kazi-text-light">Import Projects</h1>
          <p className="text-gray-600 dark:text-gray-300">Import projects and files from various sources</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          <Button size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Import Methods */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* File Upload */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload Files
            </CardTitle>
            <CardDescription>Upload files directly from your device</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600 mb-2">Drag and drop files here, or click to browse</p>
                <input
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <Button 
                  variant="outline" 
                  onClick={() => document.getElementById('file-upload').click()}
                >
                  Choose Files
                </Button>
              </div>
              
              {selectedFiles.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Selected Files:</p>
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm">{file.name}</span>
                      <span className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                    </div>
                  ))}
                  <Button onClick={simulateImport} className="w-full">
                    Import Files
                  </Button>
                </div>
              )}
              
              {importStatus === 'importing' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Importing...</span>
                    <span>{importProgress}%</span>
                  </div>
                  <Progress value={importProgress} className="w-full" />
                </div>
              )}
              
              {importStatus === 'success' && (
                <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-green-800">Files imported successfully!</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Cloud Import */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cloud className="h-5 w-5" />
              Cloud Import
            </CardTitle>
            <CardDescription>Import from connected cloud services</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {importSources.map((source) => (
                <div key={source.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{source.icon}</div>
                    <div>
                      <h3 className="font-medium">{source.name}</h3>
                      <p className="text-sm text-gray-600">{source.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {source.connected ? (
                      <>
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          Connected
                        </Badge>
                        <Button size="sm">
                          Import
                        </Button>
                      </>
                    ) : (
                      <Button size="sm" variant="outline">
                        Connect
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Import History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Import History
          </CardTitle>
          <CardDescription>View and manage your import history</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {importHistory.map((item) => (
              <Card key={item.id} className="kazi-card">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-blue-50 rounded-lg">
                        <FolderOpen className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{item.name}</h3>
                          <Badge className={getStatusColor(item.status)}>
                            {getStatusIcon(item.status)}
                            <span className="ml-1 capitalize">{item.status}</span>
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <p>Source: {item.source}</p>
                          <p>Date: {item.date}</p>
                          <p>{item.filesCount} files • {item.size}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Download className="h-4 w-4" />
                      </Button>
                      {item.status === 'failed' && (
                        <Button size="sm" variant="outline">
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                      )}
                      <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
