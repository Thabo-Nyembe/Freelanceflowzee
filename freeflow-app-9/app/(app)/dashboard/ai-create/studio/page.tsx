"use client"

import { AICreate } from '@/components/ai/ai-create'
import { Card } from '@/components/ui/card'

// A+++ UTILITIES
import { useCurrentUser } from '@/hooks/use-ai-data'
import { useAnnouncer } from '@/lib/accessibility'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('AI-Create-Studio')

export default function StudioPage() {
  // A+++ UTILITIES
  const { userId, loading: userLoading } = useCurrentUser()
  const { announce } = useAnnouncer()
  return (
    <Card className="p-6">
      <AICreate
        onSaveKeys={() => {}}
        onTestProvider={() => {}}
        onResetProvider={() => {}}
        onViewDocs={() => {}}
        onExportSettings={() => {}}
        onImportSettings={() => {}}
        onValidateKey={() => {}}
        onGenerateKey={() => {}}
        onRevokeKey={() => {}}
        onSwitchProvider={() => {}}
        onCheckUsage={() => {}}
        onConfigureDefaults={() => {}}
        onManagePermissions={() => {}}
        onViewHistory={() => {}}
        onOptimizeSettings={() => {}}
        onBulkImport={() => {}}
        onEncryptKeys={() => {}}
        onRotateKeys={() => {}}
        onSyncSettings={() => {}}
        onCompareProviders={() => {}}
      />
    </Card>
  )
}
