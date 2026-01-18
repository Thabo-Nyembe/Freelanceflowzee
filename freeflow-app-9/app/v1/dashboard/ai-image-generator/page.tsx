'use client';

// MIGRATED: Batch #20 - Verified clean component with no mock data or hooks

export const dynamic = 'force-dynamic';

import AIImageGenerator from '@/components/ai/ai-image-generator'

// Note: metadata removed - not allowed in 'use client' components

export default function AIImageGeneratorPage() {
  return <AIImageGenerator />
}
