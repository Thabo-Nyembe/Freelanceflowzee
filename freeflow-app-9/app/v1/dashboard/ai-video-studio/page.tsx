// MIGRATED: Batch #21 - Verified database hook integration
export const dynamic = 'force-dynamic';

import { AIVideoStudio } from '@/components/ai/ai-video-studio'

export const metadata = {
  title: 'AI Video Studio | FreeFlow',
  description: 'Create stunning videos with Veo 3, Kling, and more AI models'
}

export default function AIVideoStudioPage() {
  return <AIVideoStudio />
}
