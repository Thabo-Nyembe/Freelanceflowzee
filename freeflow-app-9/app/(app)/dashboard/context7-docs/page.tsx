'use client'

import { useState } from 'react'
import { Context7Helper } from '@/components/dev/context7-helper'
import { BookOpen } from 'lucide-react'

export default function Context7DocsPage() {
  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-gradient-to-r from-violet-500 to-purple-500">
          <BookOpen className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Context7 Documentation</h1>
          <p className="text-sm text-muted-foreground">
            Access up-to-date library documentation for your development needs
          </p>
        </div>
      </div>

      <div className="flex-1 relative">
        <Context7Helper isVisible={true} />
      </div>
    </div>
  )
}
