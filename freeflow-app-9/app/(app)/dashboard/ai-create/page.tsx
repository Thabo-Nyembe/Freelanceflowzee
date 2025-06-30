"use client";

import { AICreate } from '@/components/ai/ai-create'

export default function AICreatePage() {
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">AI Create Settings</h1>
      <AICreate onSaveKeys={(keys) => {
        // Handle saving keys to backend
        console.log('Saving keys:', keys)
      }} />
    </div>
  )
}
