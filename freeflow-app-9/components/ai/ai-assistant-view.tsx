import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { MessageCircle, Send, Sparkles, Wrench } from 'lucide-react'

export function AIAssistantView() {
  const [message, setMessage] = useState('')
  const [activeTab, setActiveTab] = useState('chat')

  const handleSendMessage = () => {
    if (!message.trim()) return
    // TODO: Implement message sending logic
    setMessage('')
  }

  return (
    <Card className="flex flex-col h-[calc(100vh-12rem)]">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col flex-1">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="chat" className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4" />
            Chat
          </TabsTrigger>
          <TabsTrigger value="tools" className="flex items-center gap-2">
            <Wrench className="h-4 w-4" />
            Tools
          </TabsTrigger>
        </TabsList>
        <TabsContent value="chat" className="flex-1 flex flex-col">
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-primary/10 p-2">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <p className="text-sm">Hi! I'm your AI assistant. How can I help you today?</p>
                </div>
              </div>
              {/* Message history will be rendered here */}
            </div>
          </ScrollArea>
          <div className="p-4 border-t">
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleSendMessage()
              }}
              className="flex gap-2"
            >
              <Input
                placeholder="Type your message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
              <Button type="submit" size="icon">
                <Send className="h-4 w-4" />
                <span className="sr-only">Send message</span>
              </Button>
            </form>
          </div>
        </TabsContent>
        <TabsContent value="tools" className="flex-1">
          <ScrollArea className="h-full p-4">
            <div className="grid gap-4">
              <Card className="p-4">
                <h3 className="font-semibold mb-2">Image Generation</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Generate images from text descriptions
                </p>
                <Button variant="outline" className="w-full">
                  Open Tool
                </Button>
              </Card>
              <Card className="p-4">
                <h3 className="font-semibold mb-2">Code Assistant</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Get help with coding and development
                </p>
                <Button variant="outline" className="w-full">
                  Open Tool
                </Button>
              </Card>
              <Card className="p-4">
                <h3 className="font-semibold mb-2">Content Writer</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Generate and edit written content
                </p>
                <Button variant="outline" className="w-full">
                  Open Tool
                </Button>
              </Card>
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </Card>
  )
} 