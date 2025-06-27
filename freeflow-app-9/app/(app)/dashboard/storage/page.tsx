
import React from 'react'
import { EnhancedFileStorage } from '@/components/storage/enhanced-file-storage'
import { StorageDashboard } from '@/components/storage/storage-dashboard'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Multi-Cloud Storage | FreeflowZee',
  description: 'Manage your files across Wasabi and Supabase with intelligent cost optimization',
}

export default function StoragePage() {
  return (
    <div className= "container mx-auto py-6">
      <StorageDashboard />
    </div>
  )
} 