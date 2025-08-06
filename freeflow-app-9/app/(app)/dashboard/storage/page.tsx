'use client'

import React from 'react'
import {
  Cloud,
  HardDrive,
  Database
} from 'lucide-react'
import { EnhancedFileStorage } from '@/components/storage/enhanced-file-storage'
import { StorageDashboard } from '@/components/storage/storage-dashboard'

export default function StoragePage() {
  return (
    <div className="kazi-bg-light dark:kazi-bg-dark min-h-screen py-8">
      {/* Header */}
      <div className="container mx-auto px-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-violet-bolt/10 dark:bg-violet-bolt/20">
            <Cloud className="h-6 w-6 kazi-text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold kazi-text-dark dark:kazi-text-light">
              Storage & Files
            </h1>
            <p className="text-muted-foreground text-sm">
              Multi-cloud storage with smart cost optimisation
            </p>
          </div>
        </div>
      </div>

      {/* Main Dashboard */}
      <div className="container mx-auto px-4">
        <StorageDashboard />
      </div>
    </div>
  )
} 