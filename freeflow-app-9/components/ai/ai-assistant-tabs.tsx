"use client"

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  MessageSquare, 
  Search,
  Wand2,
  History,
  Send,
  Trash2,
  Download,
  Settings,
  Loader2,
  PlayCircle,
  PauseCircle,
  CheckCircle,
  AlertCircle
} from 'lucide-react'

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

interface Analysis {
  type: string
  content: string
  suggestions: string[]
  timestamp: string
}

export function AIAssistantTabs() {
  const [activeTab, setActiveTab] = useState('chat')
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [chatHistory, setChatHistory] = useState<Message[]>([])
  const [analyses, setAnalyses] = useState<Analysis[]>([])
  const [automations, setAutomations] = useState<string[]>([])

  const handleAnalyze = async () => {
    if (!message.trim()) return
    
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      const newAnalysis: Analysis = {
        type: 'Content Analysis',
        content: message,
        suggestions: [
          'Consider using more engaging visuals',
          'Add clear call-to-action buttons',
          'Optimize for mobile devices'
        ],
        timestamp: new Date().toISOString()
      }
      
      setAnalyses(prev => [newAnalysis, ...prev])
      setMessage('')
    } catch (error) {
      console.error('Analysis failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleChat = async () => {
    if (!message.trim()) return
    
    const userMessage: Message = {
      role: 'user',
      content: message,
      timestamp: new Date().toISOString()
    }
    
    setChatHistory(prev => [...prev, userMessage])
    setIsLoading(true)
    
    try {
      // Simulate AI chat response
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const response: Message = {
        role: 'assistant',
        content: `I understand you're asking about "${message}". Here's my analysis and recommendations:

🎯 **Key Insights:**
• This aligns with modern freelance business optimization strategies
• Consider implementing systematic approaches for better results
• Focus on measurable outcomes and client satisfaction

💡 **Action Items:**
• Set up tracking for project metrics
• Implement regular client feedback loops
• Consider automation opportunities
• Develop standardized processes

Would you like me to dive deeper into any of these areas?`,
        timestamp: new Date().toISOString()
      }
      
      setChatHistory(prev => [...prev, response])
      setMessage('')
    } catch (error) {
      console.error('Chat failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGenerate = async () => {
    if (!message.trim()) return
    
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const response = {
        role: 'assistant' as const,
        content: 'Here is a generated response based on your input...',
        timestamp: new Date().toISOString()
      }
      
      setChatHistory(prev => [...prev, {
        role: 'user',
        content: message,
        timestamp: new Date().toISOString()
      }, response])
      
      setMessage('')
    } catch (error) {
      console.error('Generation failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSetupAutomation = async () => {
    if (!message.trim()) return
    
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setAutomations(prev => [...prev, message])
      setMessage('')
    } catch (error) {
      console.error('Automation setup failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="chat" data-testid="chat-tab">
          <MessageSquare className="w-4 h-4 mr-2" />
          Chat
        </TabsTrigger>
        <TabsTrigger value="analyze" data-testid="analyze-tab">
          <Search className="w-4 h-4 mr-2" />
          Analyze
        </TabsTrigger>
        <TabsTrigger value="generate" data-testid="generate-tab">
          <Wand2 className="w-4 h-4 mr-2" />
          Generate
        </TabsTrigger>
        <TabsTrigger value="history" data-testid="history-tab">
          <History className="w-4 h-4 mr-2" />
          History
        </TabsTrigger>
      </TabsList>

      <TabsContent value="chat" className="space-y-4">
        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <MessageSquare className="w-5 h-5 text-blue-600" />
              <h3 className="font-medium">AI Business Assistant</h3>
            </div>
            <Textarea
              placeholder="Ask me about business optimization, project management, client relationships, or any freelance question..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="min-h-[100px]"
              data-testid="chat-input"
            />
            <div className="flex justify-end gap-2">
              <Button
                onClick={handleChat}
                disabled={isLoading || !message.trim()}
                data-testid="chat-button"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Thinking...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Send Message
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        <ScrollArea className="h-[400px]">
          {chatHistory.map((msg, index) => (
            <div
              key={index}
              className={`flex gap-2 mb-4 ${
                msg.role === 'assistant' ? 'justify-start' : 'justify-end'
              }`}
            >
              <Card className={`max-w-[80%] ${
                msg.role === 'assistant' ? 'bg-blue-50 border-blue-200' : 'bg-primary text-primary-foreground'
              }`}>
                <CardContent className="p-3">
                  <div className="flex items-center gap-2 mb-2">
                    {msg.role === 'assistant' ? (
                      <MessageSquare className="w-4 h-4 text-blue-600" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    <span className="text-xs font-medium">
                      {msg.role === 'assistant' ? 'AI Assistant' : 'You'}
                    </span>
                  </div>
                  <p>{msg.content}</p>
                  <span className="text-xs opacity-70 mt-2 block">
                    {new Date(msg.timestamp).toLocaleString()}
                  </span>
                </CardContent>
              </Card>
            </div>
          ))}
        </ScrollArea>
      </TabsContent>

      <TabsContent value="analyze" className="space-y-4">
        <Card>
          <CardContent className="p-4 space-y-4">
            <Textarea
              placeholder="Enter content to analyze..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="min-h-[100px]"
              data-testid="analyze-input"
            />
            <div className="flex justify-end gap-2">
              <Button
                onClick={handleAnalyze}
                disabled={isLoading || !message.trim()}
                data-testid="analyze-button"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4 mr-2" />
                    Analyze
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        <ScrollArea className="h-[400px]">
          {analyses.map((analysis, index) => (
            <Card key={index} className="mb-4">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{analysis.type}</span>
                  <span className="text-sm text-muted-foreground">
                    {new Date(analysis.timestamp).toLocaleString()}
                  </span>
                </div>
                <p className="mb-4">{analysis.content}</p>
                <div className="space-y-2">
                  {analysis.suggestions.map((suggestion, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>{suggestion}</span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <Button variant="outline" size="sm" data-testid="take-action-button">
                    Take Action
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </ScrollArea>
      </TabsContent>

      <TabsContent value="generate" className="space-y-4">
        <Card>
          <CardContent className="p-4 space-y-4">
            <Textarea
              placeholder="Enter prompt for generation..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="min-h-[100px]"
              data-testid="generate-input"
            />
            <div className="flex justify-end gap-2">
              <Button
                onClick={handleGenerate}
                disabled={isLoading || !message.trim()}
                data-testid="generate-button"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4 mr-2" />
                    Generate
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        <ScrollArea className="h-[400px]">
          {chatHistory.map((msg, index) => (
            <div
              key={index}
              className={`flex gap-2 mb-4 ${
                msg.role === 'assistant' ? 'justify-start' : 'justify-end'
              }`}
            >
              <Card className={`max-w-[80%] ${
                msg.role === 'assistant' ? 'bg-secondary' : 'bg-primary text-primary-foreground'
              }`}>
                <CardContent className="p-3">
                  <p>{msg.content}</p>
                  <span className="text-xs opacity-70 mt-2 block">
                    {new Date(msg.timestamp).toLocaleString()}
                  </span>
                </CardContent>
              </Card>
            </div>
          ))}
        </ScrollArea>
      </TabsContent>

      <TabsContent value="history" className="space-y-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <Input
                placeholder="Search history..."
                className="flex-1"
                data-testid="history-search"
              />
              <Button variant="outline">
                <Search className="w-4 h-4" />
              </Button>
            </div>

            <ScrollArea className="h-[400px]">
              {[...analyses, ...chatHistory].sort((a, b) => 
                new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
              ).map((item, index) => (
                <Card key={index} className="mb-4">
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">
                        {'type' in item ? 'Analysis' : `${item.role.charAt(0).toUpperCase() + item.role.slice(1)} Message`}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {new Date(item.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <p>{'type' in item ? item.content : item.content}</p>
                  </CardContent>
                </Card>
              ))}
            </ScrollArea>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
} 