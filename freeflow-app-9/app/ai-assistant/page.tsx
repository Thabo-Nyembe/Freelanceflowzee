'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import EnhancedAIChat from '@/components/ai/enhanced-ai-chat'
import SimpleAIChat from '@/components/ai/simple-ai-chat'
import { AICreateStudio } from '@/components/ai/ai-create-studio'

export default function AIAssistantPage() {
  const [activeTab, setActiveTab] = useState('chat')

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">AI Assistant</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="chat">Chat</TabsTrigger>
          <TabsTrigger value="create">Create</TabsTrigger>
          <TabsTrigger value="analyze">Analyze</TabsTrigger>
        </TabsList>

        <TabsContent value="chat">
          <Card>
            <CardHeader>
              <CardTitle>AI Chat Assistant</CardTitle>
            </CardHeader>
            <CardContent>
              <EnhancedAIChat />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="create">
          <Card>
            <CardHeader>
              <CardTitle>AI Content Creation</CardTitle>
            </CardHeader>
            <CardContent>
              <AICreateStudio
                onGenerate={(result) => {
                  console.log('Generated content:', result)
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analyze">
          <Card>
            <CardHeader>
              <CardTitle>AI Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <SimpleAIChat />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 