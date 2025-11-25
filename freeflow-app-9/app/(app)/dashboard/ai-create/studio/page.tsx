"use client"

import { AICreate } from '@/components/ai/ai-create'
import { Card } from '@/components/ui/card'

export default function StudioPage() {
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
