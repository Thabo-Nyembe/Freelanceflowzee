'use client'

import React from 'react'
import { EnhancedLoading } from '@/components/ui/enhanced-loading-states'
import { GlowEffect } from '@/components/ui/glow-effect'

export function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center relative">
      {/* Premium Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 -z-10" />
      <div className="absolute top-1/4 -left-4 w-96 h-96 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
      <div className="absolute top-1/3 -right-4 w-96 h-96 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-1000"></div>

      <div className="relative">
        <GlowEffect className="absolute -inset-10 bg-gradient-to-r from-purple-500/30 to-blue-500/30 rounded-full blur-xl opacity-50" />
        <EnhancedLoading
          variant="pulse"
          size="lg"
          message="Loading KAZI Platform..."
          submessage="Preparing your workspace"
          showTime={true}
        />
      </div>
    </div>
  )
}