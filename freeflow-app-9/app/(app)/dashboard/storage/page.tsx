'use client'

import React from 'react'
import { EnhancedFileStorage } from '@/components/storage/enhanced-file-storage'
import { StorageDashboard } from '@/components/storage/storage-dashboard'

export default function StoragePage() {
  return (
    <div className="container mx-auto py-6">
      <StorageDashboard />
    </div>
  )
} 