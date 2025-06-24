import { Metadata } from 'next'
import { AIAssistantView } from '@/components/ai/ai-assistant-view'

export const metadata: Metadata = {
  title: 'AI Assistant',
  description: 'Intelligent assistance for your creative workflow',
}

export default function AIAssistantPage() {
  return (
    <div className="flex-1 flex flex-col gap-4 p-4 md:gap-8 md:p-6">
      <div className="flex items-center justify-between">
        <h1 className="font-semibold text-lg md:text-2xl">AI Assistant</h1>
      </div>
      <AIAssistantView />
    </div>
  )
}