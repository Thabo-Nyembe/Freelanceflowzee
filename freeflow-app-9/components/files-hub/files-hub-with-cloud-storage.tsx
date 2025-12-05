'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { HardDrive, Cloud } from 'lucide-react'
import { StorageProvidersCard } from '@/components/storage/storage-providers-card'
import { UnifiedFileBrowser } from '@/components/storage/unified-file-browser'
import { StorageQuotaCard } from '@/components/storage/storage-quota-card'
import { StorageActivityLog } from '@/components/storage/storage-activity-log'
import { ScrollReveal } from '@/components/ui/scroll-reveal'

interface FilesHubWithCloudStorageProps {
  localFilesContent: React.ReactNode
}

export function FilesHubWithCloudStorage({ localFilesContent }: FilesHubWithCloudStorageProps) {
  return (
    <Tabs defaultValue="local" className="w-full">
      <div className="relative p-6 space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="local" className="gap-2">
            <HardDrive className="w-4 h-4" />
            Local Files
          </TabsTrigger>
          <TabsTrigger value="cloud" className="gap-2">
            <Cloud className="w-4 h-4" />
            Cloud Storage
          </TabsTrigger>
        </TabsList>

        <TabsContent value="local" className="mt-0">
          {localFilesContent}
        </TabsContent>

        <TabsContent value="cloud" className="space-y-6">
          {/* Cloud Storage Header */}
          <ScrollReveal>
            <div className="flex flex-col gap-2">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Cloud className="w-6 h-6 text-blue-500" />
                Cloud Storage Integration
              </h2>
              <p className="text-muted-foreground">
                Access files from Google Drive, Dropbox, OneDrive, and more in one unified interface
              </p>
            </div>
          </ScrollReveal>

          {/* Storage Overview Cards */}
          <ScrollReveal delay={0.1}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <StorageProvidersCard />
              </div>
              <div>
                <StorageQuotaCard />
              </div>
            </div>
          </ScrollReveal>

          {/* Unified File Browser */}
          <ScrollReveal delay={0.2}>
            <UnifiedFileBrowser />
          </ScrollReveal>

          {/* Activity Log */}
          <ScrollReveal delay={0.3}>
            <StorageActivityLog />
          </ScrollReveal>
        </TabsContent>
      </div>
    </Tabs>
  )
}
