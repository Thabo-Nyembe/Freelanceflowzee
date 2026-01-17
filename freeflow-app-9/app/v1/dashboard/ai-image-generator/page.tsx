'use client';

// MIGRATED: Batch #20 - Verified clean component with no mock data or hooks

export const dynamic = 'force-dynamic';

import AIImageGenerator from '@/components/ai/ai-image-generator'

export const metadata = {
  title: 'AI Image Generator | Kazi Platform',
  description: 'Create stunning images with Nano Banana AI - Google\'s latest image generation technology'
}

export default function AIImageGeneratorPage() {
  return <AIImageGenerator />
}
