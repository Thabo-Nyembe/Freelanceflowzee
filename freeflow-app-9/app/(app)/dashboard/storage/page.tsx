'use client'

import React from 'react'
import { EnhancedFileStorage } from '@/components/storage/enhanced-file-storage'

export default function StoragePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50 to-blue-50 p-6">
      <EnhancedFileStorage 
        showAnalytics={true}
        allowUpload={true}
        mode="personal"
        className="max-w-7xl mx-auto"
      />
    </div>
  )
} 