"use client"

import { useState } from 'react'
import {
  BentoCard,
  BentoQuickAction
} from '@/components/ui/bento-grid-advanced'
import {
  StatGrid,
  MiniKPI,
  ProgressCard,
  ActivityFeed
} from '@/components/ui/results-display'
import {
  ModernButton,
  GradientButton,
  PillButton
} from '@/components/ui/modern-buttons'
import {
  Cloud,
  Upload,
  Download,
  FolderOpen,
  FileText,
  Image,
  Video,
  Music,
  Share2,
  Lock,
  Search,
  Grid3x3,
  List,
  Clock,
  Eye,
  Trash2
} from 'lucide-react'

/**
 * Cloud Storage V2 - Groundbreaking Cloud File Management
 * Showcases cloud storage features with modern components
 */
export default function CloudStorageV2() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedFolder, setSelectedFolder] = useState<string | null>('all')

  const stats = [
    { label: 'Total Storage', value: '2.4TB', change: 25.3, icon: <Cloud className="w-5 h-5" /> },
    { label: 'Files Stored', value: '8,470', change: 18.7, icon: <FileText className="w-5 h-5" /> },
    { label: 'Shared Files', value: '342', change: 12.5, icon: <Share2 className="w-5 h-5" /> },
    { label: 'Bandwidth Used', value: '847GB', change: 32.1, icon: <Download className="w-5 h-5" /> }
  ]

  const files = [
    {
      id: '1',
      name: 'Project Proposal.pdf',
      type: 'PDF',
      size: '2.4 MB',
      modified: '2 hours ago',
      sharedWith: 5,
      thumbnail: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=200&h=200&fit=crop',
      icon: <FileText className="w-8 h-8" />
    },
    {
      id: '2',
      name: 'Design Mockups',
      type: 'Folder',
      items: 24,
      size: '124 MB',
      modified: '5 hours ago',
      sharedWith: 0,
      icon: <FolderOpen className="w-8 h-8" />
    },
    {
      id: '3',
      name: 'Product Demo.mp4',
      type: 'Video',
      size: '245 MB',
      modified: '1 day ago',
      sharedWith: 12,
      thumbnail: 'https://images.unsplash.com/photo-1492619375914-88005aa9e8fb?w=200&h=200&fit=crop',
      icon: <Video className="w-8 h-8" />
    },
    {
      id: '4',
      name: 'Brand Assets',
      type: 'Folder',
      items: 67,
      size: '342 MB',
      modified: '3 days ago',
      sharedWith: 8,
      icon: <Image className="w-8 h-8" />
    },
    {
      id: '5',
      name: 'Meeting Recording.mp3',
      type: 'Audio',
      size: '42 MB',
      modified: '1 week ago',
      sharedWith: 3,
      icon: <Music className="w-8 h-8" />
    },
    {
      id: '6',
      name: 'Financial Report.xlsx',
      type: 'Spreadsheet',
      size: '1.2 MB',
      modified: '2 weeks ago',
      sharedWith: 0,
      thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=200&h=200&fit=crop',
      icon: <FileText className="w-8 h-8" />
    }
  ]

  const recentActivity = [
    { icon: <Upload className="w-5 h-5" />, title: 'File uploaded', description: 'Project Proposal.pdf', time: '2 hours ago', status: 'success' as const },
    { icon: <Share2 className="w-5 h-5" />, title: 'File shared', description: 'Product Demo.mp4 with 12 people', time: '1 day ago', status: 'info' as const },
    { icon: <Download className="w-5 h-5" />, title: 'File downloaded', description: 'Brand Assets folder', time: '3 days ago', status: 'info' as const },
    { icon: <Lock className="w-5 h-5" />, title: 'Access granted', description: 'Sarah Johnson to Design Mockups', time: '1 week ago', status: 'success' as const }
  ]

  const storageBreakdown = [
    { type: 'Documents', size: 847, color: 'from-blue-500 to-cyan-500', icon: <FileText className="w-5 h-5" /> },
    { type: 'Images', size: 624, color: 'from-purple-500 to-pink-500', icon: <Image className="w-5 h-5" /> },
    { type: 'Videos', size: 489, color: 'from-orange-500 to-red-500', icon: <Video className="w-5 h-5" /> },
    { type: 'Audio', size: 247, color: 'from-green-500 to-emerald-500', icon: <Music className="w-5 h-5" /> }
  ]

  const getFileColor = (type: string) => {
    switch (type) {
      case 'PDF': return 'text-red-600'
      case 'Video': return 'text-purple-600'
      case 'Audio': return 'text-green-600'
      case 'Folder': return 'text-blue-600'
      default: return 'text-gray-600'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50/30 to-indigo-50/40 p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <Cloud className="w-10 h-10 text-sky-600" />
              Cloud Storage
            </h1>
            <p className="text-muted-foreground">Secure file storage and sharing</p>
          </div>
          <GradientButton from="sky" to="blue" onClick={() => console.log('Upload')}>
            <Upload className="w-5 h-5 mr-2" />
            Upload Files
          </GradientButton>
        </div>

        <StatGrid columns={4} stats={stats} />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <BentoQuickAction icon={<Upload />} title="Upload" description="New files" onClick={() => console.log('Upload')} />
          <BentoQuickAction icon={<FolderOpen />} title="New Folder" description="Organize" onClick={() => console.log('Folder')} />
          <BentoQuickAction icon={<Share2 />} title="Share" description="Collaborate" onClick={() => console.log('Share')} />
          <BentoQuickAction icon={<Download />} title="Download" description="Bulk" onClick={() => console.log('Download')} />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex-1 relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search files and folders..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <PillButton variant={viewMode === 'grid' ? 'primary' : 'ghost'} onClick={() => setViewMode('grid')}>
              <Grid3x3 className="w-4 h-4" />
            </PillButton>
            <PillButton variant={viewMode === 'list' ? 'primary' : 'ghost'} onClick={() => setViewMode('list')}>
              <List className="w-4 h-4" />
            </PillButton>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <BentoCard className="p-6">
              <h3 className="text-xl font-semibold mb-4">Files & Folders</h3>
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {files.map((file) => (
                    <div
                      key={file.id}
                      className="p-4 rounded-xl border border-border bg-background hover:bg-muted/50 transition-all cursor-pointer group"
                    >
                      <div className="space-y-3">
                        <div className="aspect-square rounded-lg bg-muted flex items-center justify-center overflow-hidden">
                          {file.thumbnail ? (
                            <img src={file.thumbnail} alt={file.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className={getFileColor(file.type)}>
                              {file.icon}
                            </div>
                          )}
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm truncate">{file.name}</h4>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                            <span>{file.type}</span>
                            <span>•</span>
                            <span>{file.size}</span>
                          </div>
                          {file.sharedWith > 0 && (
                            <div className="flex items-center gap-1 text-xs text-sky-600 mt-1">
                              <Share2 className="w-3 h-3" />
                              Shared with {file.sharedWith}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <ModernButton variant="outline" size="sm" onClick={() => console.log('View', file.id)}>
                            <Eye className="w-3 h-3" />
                          </ModernButton>
                          <ModernButton variant="outline" size="sm" onClick={() => console.log('Share', file.id)}>
                            <Share2 className="w-3 h-3" />
                          </ModernButton>
                          <ModernButton variant="outline" size="sm" onClick={() => console.log('Download', file.id)}>
                            <Download className="w-3 h-3" />
                          </ModernButton>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {files.map((file) => (
                    <div
                      key={file.id}
                      className="p-4 rounded-lg border border-border bg-background hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`${getFileColor(file.type)}`}>
                          {file.icon}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-sm">{file.name}</h4>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                            <span>{file.type}</span>
                            <span>{file.size}</span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {file.modified}
                            </span>
                            {file.sharedWith > 0 && (
                              <span className="flex items-center gap-1 text-sky-600">
                                <Share2 className="w-3 h-3" />
                                {file.sharedWith}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <ModernButton variant="outline" size="sm" onClick={() => console.log('View', file.id)}>
                            <Eye className="w-3 h-3 mr-1" />
                            View
                          </ModernButton>
                          <ModernButton variant="outline" size="sm" onClick={() => console.log('Download', file.id)}>
                            <Download className="w-3 h-3 mr-1" />
                            Download
                          </ModernButton>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </BentoCard>
          </div>

          <div className="space-y-6">
            <ProgressCard
              title="Storage Usage"
              current={2400}
              goal={5000}
              unit="GB"
              icon={<Cloud className="w-5 h-5" />}
            />

            <BentoCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">Storage by Type</h3>
              <div className="space-y-3">
                {storageBreakdown.map((item) => (
                  <div key={item.type} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${item.color} flex items-center justify-center text-white`}>
                          {item.icon}
                        </div>
                        <span className="font-medium">{item.type}</span>
                      </div>
                      <span className="font-semibold">{item.size} GB</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r ${item.color}`}
                        style={{ width: `${(item.size / 2400) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </BentoCard>

            <ActivityFeed title="Recent Activity" activities={recentActivity} />

            <BentoCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <MiniKPI label="Files Added" value="247" change={25.3} />
                <MiniKPI label="Shared Files" value="342" change={12.5} />
                <MiniKPI label="Downloads" value="1.2K" change={18.7} />
                <MiniKPI label="Collaboration" value="89" change={32.1} />
              </div>
            </BentoCard>
          </div>
        </div>
      </div>
    </div>
  )
}
