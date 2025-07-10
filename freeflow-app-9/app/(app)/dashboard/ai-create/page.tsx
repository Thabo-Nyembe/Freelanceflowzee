"use client";

import { AICreate } from '@/components/ai/ai-create'

export default function AICreatePage() {
  return (
    <div className="container py-8 kazi-bg-light dark:kazi-bg-dark min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold kazi-text-dark dark:kazi-text-light kazi-headline">AI Create Settings</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Configure your AI provider settings and API keys</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <AICreate onSaveKeys={(keys) => {
            console.log('Saving keys:', keys)
          }} />
        </div>
      </div>
    </div>
  )
}
