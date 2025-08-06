"use client";

import {
  Brain,
  Settings as SettingsIcon,
  ArrowRight
} from 'lucide-react'

import { AICreate } from '@/components/ai/ai-create'

export default function AICreatePage() {
  return (
    <div className="container py-8 kazi-bg-light dark:kazi-bg-dark min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="flex items-center gap-2 text-3xl font-bold kazi-text-dark dark:kazi-text-light kazi-headline">
            <Brain className="h-6 w-6 kazi-text-primary" />
            AI Create Settings
          </h1>
          <p className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mt-2">
            <SettingsIcon className="h-4 w-4 flex-shrink-0" />
            Configure your AI provider settings and API keys
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 relative">
          {/* Decorative arrow icon in corner */}
          <ArrowRight className="absolute top-4 right-4 h-5 w-5 text-muted-foreground" />
          <AICreate onSaveKeys={(keys) => {
            console.log('Saving keys:', keys)
          }} />
        </div>
      </div>
    </div>
  )
}
