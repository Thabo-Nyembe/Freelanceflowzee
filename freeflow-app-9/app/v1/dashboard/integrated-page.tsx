'use client'

import React from 'react'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Cloud, HardDrive, Settings, Activity } from 'lucide-react'

// New integrated components
import { StorageProvidersCard } from '@/components/storage/storage-providers-card'
import { UnifiedFileBrowser } from '@/components/storage/unified-file-browser'
import { StorageQuotaCard } from '@/components/storage/storage-quota-card'
import { StorageActivityLog } from '@/components/storage/storage-activity-log'

// Premium Components
import { TextShimmer } from '@/components/ui/text-shimmer'
import { ScrollReveal } from '@/components/ui/scroll-reveal'

export default function IntegratedStoragePage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <ScrollReveal>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <Cloud className="w-8 h-8 text-blue-500" />
              <TextShimmer>Unified Storage</TextShimmer>
            </h1>
            <p className="text-muted-foreground mt-2">
              Access all your files from Google Drive, Dropbox, OneDrive, and more in one place
            </p>
          </div>
        </div>
      </ScrollReveal>

      {/* Storage Overview Cards */}
      <ScrollReveal>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <StorageProvidersCard />
          </div>
          <div>
            <StorageQuotaCard />
          </div>
        </div>
      </ScrollReveal>

      {/* Main Content Tabs */}
      <ScrollReveal>
        <Tabs defaultValue="files" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto">
            <TabsTrigger value="files" className="gap-2">
              <HardDrive className="w-4 h-4" />
              <span className="hidden sm:inline">All Files</span>
              <span className="sm:hidden">Files</span>
            </TabsTrigger>
            <TabsTrigger value="activity" className="gap-2">
              <Activity className="w-4 h-4" />
              <span className="hidden sm:inline">Activity</span>
              <span className="sm:hidden">Activity</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Settings</span>
              <span className="sm:hidden">Settings</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="files" className="space-y-6">
            <UnifiedFileBrowser />
          </TabsContent>

          <TabsContent value="activity" className="space-y-6">
            <StorageActivityLog />
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Storage Settings</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium">Auto-Sync Files</h3>
                    <p className="text-sm text-muted-foreground">
                      Automatically sync files from all connected providers
                    </p>
                  </div>
                  <input type="checkbox" className="toggle" defaultChecked />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium">Cache File Previews</h3>
                    <p className="text-sm text-muted-foreground">
                      Store file previews locally for faster loading
                    </p>
                  </div>
                  <input type="checkbox" className="toggle" defaultChecked />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium">Show Hidden Files</h3>
                    <p className="text-sm text-muted-foreground">
                      Display files and folders starting with a dot (.)
                    </p>
                  </div>
                  <input type="checkbox" className="toggle" />
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </ScrollReveal>
    </div>
  )
}
