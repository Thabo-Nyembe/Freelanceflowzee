'use client'

import React from 'react'
import { Loader2 } from 'lucide-react'

export function DashboardLoading() {
  return (
    <div className= "flex items-center justify-center min-h-[400px]">
      <div className= "flex flex-col items-center space-y-4">
        <Loader2 className= "w-8 h-8 animate-spin text-indigo-600" />
        <p className= "text-sm text-gray-600">Loading dashboard...</p>
      </div>
    </div>
  )
} 