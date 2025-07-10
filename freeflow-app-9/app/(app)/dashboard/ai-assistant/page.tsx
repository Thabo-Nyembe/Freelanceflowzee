'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Bot,
  Send,
  Sparkles,
  Brain,
  Lightbulb,
  TrendingUp,
  BarChart3,
  Target,
  Clock,
  CheckCircle,
  AlertCircle,
  MessageSquare,
  Settings,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Users,
  DollarSign,
  Eye,
  Bookmark,
  Copy,
  Zap,
  Star
} from 'lucide-react'

interface Message {
  id: string
  content: string
  type: 'user' | 'assistant'
  timestamp: Date
  isLoading?: boolean
  suggestions?: string[]
  attachments?: string[]
  rating?: 'up' | 'down' | null
}

interface Conversation {
  id: string
  title: string
  preview: string
  timestamp: Date
  tags: string[]
  messageCount: number
}

interface AIInsight {
  id: string
  title: string
  description: string
  category: 'productivity' | 'business' | 'optimization' | 'opportunity'
  priority: 'high' | 'medium' | 'low'
  action: string
  icon: React.ComponentType<{ className?: string }>
}

interface ProjectAnalysis {
  projectName: string
  status: string
  completion: number
  insights: string[]
  recommendations: string[]
  nextActions: string[]
}

export default function AIAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'Hello! I\'m your AI Assistant. I can help you optimize your workflow, analyze projects, provide business insights, and answer questions about your freelance business. What would you like to explore today?',
      type: 'assistant',
      timestamp: new Date(Date.now() - 5 * 60000),
      suggestions: [
        'Analyze my current projects',
        'Suggest productivity improvements',
        'Help with client communication',
        'Review my business metrics'
      ]
    }
  ])
  
  const [inputMessage, setInputMessage] = useState<any>('')
  const [isLoading, setIsLoading] = useState<any>(false)
  const [activeTab, setActiveTab] = useState<any>('chat')
  const [selectedModel, setSelectedModel] = useState<any>('anthropic')
  const [isVoiceMode, setIsVoiceMode] = useState<any>(false)
  const [isListening, setIsListening] = useState<any>(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const [conversations] = useState<Conversation[]>([
    {
      id: '1',
      title: 'Project Optimization Strategy',
      preview: 'How can I improve my project delivery times...',
      timestamp: new Date(Date.now() - 2 * 60 * 60000),
      tags: ['productivity', 'optimization'],
      messageCount: 12
    },
    {
      id: '2',
      title: 'Client Pricing Analysis',
      preview: 'What should I charge for web development...',
      timestamp: new Date(Date.now() - 24 * 60 * 60000),
      tags: ['pricing', 'business'],
      messageCount: 8
    },
    {
      id: '3',
      title: 'Marketing Strategy Discussion',
      preview: 'Help me create a marketing plan for...',
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60000),
      tags: ['marketing', 'growth'],
      messageCount: 15
    }
  ])

  const [aiInsights] = useState<AIInsight[]>([
    {
      id: '1',
      title: 'Productivity Opportunity',
      description: 'You spend 40% more time on revisions than industry average. Consider implementing structured feedback workflows.',
      category: 'optimization',
      priority: 'high',
      action: 'Implement feedback system',
      icon: TrendingUp
    },
    {
      id: '2',
      title: 'Revenue Growth Potential',
      description: 'Your video editing projects have 23% higher profit margins. Consider expanding this service line.',
      category: 'business',
      priority: 'high',
      action: 'Expand video services',
      icon: DollarSign
    },
    {
      id: '3',
      title: 'Client Retention Insight',
      description: 'Clients who use your escrow system have 65% higher retention rates. Promote this feature more.',
      category: 'opportunity',
      priority: 'medium',
      action: 'Promote escrow system',
      icon: Users
    },
    {
      id: '4',
      title: 'Workflow Optimization',
      description: 'Your most productive hours are 9-11 AM. Schedule complex tasks during this window.',
      category: 'productivity',
      priority: 'medium',
      action: 'Adjust daily schedule',
      icon: Clock
    }
  ])

  const [projectAnalysis] = useState<ProjectAnalysis[]>([
    {
      projectName: 'E-commerce Redesign',
      status: 'In Progress',
      completion: 75,
      insights: [
        'Project is 15% ahead of original timeline',
        'Client feedback response time: 2.3 days average',
        'Design iteration efficiency: 88%'
      ],
      recommendations: [
        'Schedule final review meeting for next week',
        'Prepare comprehensive testing documentation',
        'Create handover documentation early'
      ],
      nextActions: [
        'Complete checkout flow testing',
        'Finalize mobile responsive design',
        'Prepare deployment checklist'
      ]
    },
    {
      projectName: 'Brand Identity Package',
      status: 'Review',
      completion: 90,
      insights: [
        'Client approval rate: 92% first-time approval',
        'Revision requests: 23% below average',
        'Timeline adherence: Excellent'
      ],
      recommendations: [
        'Present final brand guidelines document',
        'Offer additional brand applications',
        'Schedule brand implementation consultation'
      ],
      nextActions: [
        'Deliver final logo variations',
        'Complete brand guidelines PDF',
        'Prepare usage examples'
      ]
    }
  ])

  const quickActions = [
    { id: 'analyze-projects', label: 'Analyze My Projects', icon: BarChart3 },
    { id: 'optimize-workflow', label: 'Optimize Workflow', icon: TrendingUp },
    { id: 'pricing-help', label: 'Pricing Guidance', icon: DollarSign },
    { id: 'client-communication', label: 'Client Communication', icon: MessageSquare },
    { id: 'time-management', label: 'Time Management', icon: Clock },
    { id: 'business-insights', label: 'Business Insights', icon: Brain }
  ]

  const aiModels = [
    { id: 'anthropic', name: 'Claude (Anthropic)', description: 'Best for analysis and reasoning' },
    { id: 'openai', name: 'GPT-4 (OpenAI)', description: 'Excellent for creative tasks' },
    { id: 'google', name: 'Gemini (Google)', description: 'Great for general assistance' }
  ]

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      type: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)

    // Simulate AI response
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: generateAIResponse(inputMessage),
        type: 'assistant',
        timestamp: new Date(),
        suggestions: generateSuggestions(inputMessage)
      }
      
      setMessages(prev => [...prev, assistantMessage])
      setIsLoading(false)
    }, 1500)
  }

  const generateAIResponse = (_input: string): string => {
    const responses = [
      "Based on your current project portfolio, I can see some excellent opportunities for optimization. Your video editing projects are performing particularly well with higher profit margins. Here's what I recommend...",
      "I've analyzed your workflow patterns and found that you're most productive between 9-11 AM. Consider scheduling your most complex tasks during this window to maximize efficiency...",
      "Your client retention rate could be improved by implementing more structured communication. I suggest creating weekly progress updates and using the built-in project management tools...",
      "Looking at your pricing strategy, you might be undervaluing your services. The market rate for your skill level is typically 15-20% higher than your current rates..."
    ]
    return responses[Math.floor(Math.random() * responses.length)]
  }

  const generateSuggestions = (_input: string): string[] => {
    const suggestions = [
      ['Show me detailed project analytics', 'Help with time tracking', 'Suggest productivity tools'],
      ['Create a pricing strategy', 'Analyze competitor rates', 'Calculate project ROI'],
      ['Draft client update email', 'Schedule follow-up tasks', 'Create project timeline'],
      ['Optimize daily schedule', 'Set productivity goals', 'Track time allocation']
    ]
    return suggestions[Math.floor(Math.random() * suggestions.length)]
  }

  const handleQuickAction = (actionId: string) => {
    const actionMessages = {
      'analyze-projects': 'Can you analyze my current projects and provide insights on performance, timelines, and optimization opportunities?',
      'optimize-workflow': 'Help me optimize my daily workflow and suggest productivity improvements based on my work patterns.',
      'pricing-help': 'I need guidance on pricing my services. Can you analyze market rates and suggest optimal pricing strategies?',
      'client-communication': 'Help me improve my client communication and create templates for common scenarios.',
      'time-management': 'Analyze my time allocation and suggest better time management strategies.',
      'business-insights': 'Provide insights on my business performance and suggest growth opportunities.'
    }
    
    setInputMessage(actionMessages[actionId] || '')
  }

  const handleSuggestionClick = (suggestion: string) => {
    setInputMessage(suggestion)
  }

  const handleMessageRating = (messageId: string, rating: 'up' | 'down') => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, rating } : msg
    ))
  }

  const toggleVoiceMode = () => {
    setIsVoiceMode(!isVoiceMode)
    if (!isVoiceMode) {
      setIsListening(false)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Bot className="w-6 h-6 text-purple-600" />
              <h1 className="text-2xl font-bold text-gray-900">AI Assistant</h1>
              <Badge className="bg-gradient-to-r from-purple-500 to-violet-600 text-white">A+++</Badge>
            </div>
            <div className="flex items-center gap-2">
              <Brain className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">Powered by Advanced AI</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <select 
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="text-sm border border-gray-300 rounded px-3 py-1"
            >
              {aiModels.map(model => (
                <option key={model.id} value={model.id}>{model.name}</option>
              ))}
            </select>
            
            <Button
              variant={isVoiceMode ? "default" : "outline"}
              size="sm"
              onClick={toggleVoiceMode}
            >
              {isVoiceMode ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </Button>
            
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-88px)]">
        {/* Left Sidebar - Conversations */}
        <div className="w-80 bg-white border-r border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <Button className="w-full">
              <MessageSquare className="w-4 h-4 mr-2" />
              New Conversation
            </Button>
          </div>
          
          <ScrollArea className="h-[calc(100%-80px)]">
            <div className="p-4 space-y-3">
              {conversations.map(conversation => (
                <Card key={conversation.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-medium text-sm truncate">{conversation.title}</h3>
                      <span className="text-xs text-gray-500">{conversation.messageCount}</span>
                    </div>
                    <p className="text-xs text-gray-600 mb-2 line-clamp-2">{conversation.preview}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex gap-1">
                        {conversation.tags.map(tag => (
                          <Badge key={tag} variant="outline" className="text-xs px-1 py-0">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <span className="text-xs text-gray-400">
                        {conversation.timestamp.toLocaleDateString()}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
            <div className="border-b border-gray-200 px-4">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="chat">Chat</TabsTrigger>
                <TabsTrigger value="insights">Insights</TabsTrigger>
                <TabsTrigger value="projects">Projects</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="chat" className="flex-1 flex flex-col m-0">
              {/* Messages Area */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4 max-w-4xl mx-auto">
                  {messages.map(message => (
                    <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`flex gap-3 max-w-[80%] ${message.type === 'user' ? 'flex-row-reverse' : ''}`}>
                        <Avatar className="w-8 h-8 flex-shrink-0">
                          {message.type === 'assistant' ? (
                            <>
                              <AvatarImage src="/ai-avatar.png" alt="AI Assistant" />
                              <AvatarFallback className="bg-purple-100 text-purple-600">
                                <Bot className="w-4 h-4" />
                              </AvatarFallback>
                            </>
                          ) : (
                            <>
                              <AvatarImage src="/user-avatar.jpg" alt="User" />
                              <AvatarFallback>You</AvatarFallback>
                            </>
                          )}
                        </Avatar>
                        
                        <div className={`space-y-2 ${message.type === 'user' ? 'items-end' : 'items-start'} flex flex-col`}>
                          <div className={`rounded-lg px-4 py-3 ${
                            message.type === 'user' 
                              ? 'bg-purple-600 text-white' 
                              : 'bg-gray-100 text-gray-900'
                          }`}>
                            <p className="text-sm">{message.content}</p>
                          </div>
                          
                          {message.type === 'assistant' && (
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={() => handleMessageRating(message.id, 'up')}
                              >
                                <ThumbsUp className={`w-3 h-3 ${message.rating === 'up' ? 'text-green-600' : 'text-gray-400'}`} />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={() => handleMessageRating(message.id, 'down')}
                              >
                                <ThumbsDown className={`w-3 h-3 ${message.rating === 'down' ? 'text-red-600' : 'text-gray-400'}`} />
                              </Button>
                              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                <Copy className="w-3 h-3 text-gray-400" />
                              </Button>
                              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                <Bookmark className="w-3 h-3 text-gray-400" />
                              </Button>
                            </div>
                          )}
                          
                          {message.suggestions && (
                            <div className="flex flex-wrap gap-2 mt-2">
                              {message.suggestions.map((suggestion, index) => (
                                <Button
                                  key={index}
                                  variant="outline"
                                  size="sm"
                                  className="text-xs"
                                  onClick={() => handleSuggestionClick(suggestion)}
                                >
                                  {suggestion}
                                </Button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="flex gap-3">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="bg-purple-100 text-purple-600">
                            <Bot className="w-4 h-4" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="bg-gray-100 rounded-lg px-4 py-3">
                          <div className="flex gap-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>
              
              {/* Quick Actions */}
              <div className="p-4 border-t border-gray-200 bg-gray-50">
                <div className="max-w-4xl mx-auto">
                  <div className="flex flex-wrap gap-2 mb-4">
                    {quickActions.map(action => (
                      <Button
                        key={action.id}
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuickAction(action.id)}
                        className="text-xs"
                      >
                        <action.icon className="w-3 h-3 mr-1" />
                        {action.label}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Input Area */}
              <div className="p-4 border-t border-gray-200">
                <div className="max-w-4xl mx-auto">
                  <div className="flex gap-3">
                    <div className="flex-1 relative">
                      <Textarea
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        placeholder="Ask me anything about your business, projects, or workflow..."
                        className="min-h-[60px] pr-12 resize-none"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault()
                            handleSendMessage()
                          }
                        }}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute bottom-2 right-2"
                        onClick={() => setIsListening(!isListening)}
                        disabled={!isVoiceMode}
                      >
                        {isListening ? <MicOff className="w-4 h-4 text-red-500" /> : <Mic className="w-4 h-4" />}
                      </Button>
                    </div>
                    <Button onClick={handleSendMessage} disabled={!inputMessage.trim() || isLoading}>
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="insights" className="flex-1 p-6">
              <div className="max-w-6xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">AI Insights</h2>
                  <Button>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh Insights
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {aiInsights.map(insight => (
                    <Card key={insight.id}>
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <insight.icon className="w-5 h-5 text-purple-600" />
                            <CardTitle className="text-lg">{insight.title}</CardTitle>
                          </div>
                          <Badge className={getPriorityColor(insight.priority)}>
                            {insight.priority}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-600 mb-4">{insight.description}</p>
                        <Button size="sm" className="w-full">
                          {insight.action}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="projects" className="flex-1 p-6">
              <div className="max-w-6xl mx-auto space-y-6">
                <h2 className="text-2xl font-bold">Project Analysis</h2>
                
                <div className="space-y-4">
                  {projectAnalysis.map((project, index) => (
                    <Card key={index}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-xl">{project.projectName}</CardTitle>
                          <div className="flex items-center gap-3">
                            <Badge variant="outline">{project.status}</Badge>
                            <div className="text-sm text-gray-600">{project.completion}% Complete</div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                              <Eye className="w-4 h-4" />
                              AI Insights
                            </h4>
                            <ul className="space-y-1">
                              {project.insights.map((insight, i) => (
                                <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                                  <CheckCircle className="w-3 h-3 text-green-500 mt-1 flex-shrink-0" />
                                  {insight}
                                </li>
                              ))}
                            </ul>
                          </div>
                          
                          <div>
                            <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                              <Lightbulb className="w-4 h-4" />
                              Recommendations
                            </h4>
                            <ul className="space-y-1">
                              {project.recommendations.map((rec, i) => (
                                <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                                  <Sparkles className="w-3 h-3 text-purple-500 mt-1 flex-shrink-0" />
                                  {rec}
                                </li>
                              ))}
                            </ul>
                          </div>
                          
                          <div>
                            <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                              <Target className="w-4 h-4" />
                              Next Actions
                            </h4>
                            <ul className="space-y-1">
                              {project.nextActions.map((action, i) => (
                                <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                                  <AlertCircle className="w-3 h-3 text-orange-500 mt-1 flex-shrink-0" />
                                  {action}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="analytics" className="flex-1 p-6">
              <div className="max-w-6xl mx-auto space-y-6">
                <h2 className="text-2xl font-bold">AI-Powered Analytics</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">AI Efficiency Score</p>
                          <p className="text-2xl font-bold text-green-600">92%</p>
                        </div>
                        <TrendingUp className="w-8 h-8 text-green-600" />
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Optimization Potential</p>
                          <p className="text-2xl font-bold text-purple-600">18%</p>
                        </div>
                        <Zap className="w-8 h-8 text-purple-600" />
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Time Saved (Monthly)</p>
                          <p className="text-2xl font-bold text-blue-600">24h</p>
                        </div>
                        <Clock className="w-8 h-8 text-blue-600" />
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Revenue Impact</p>
                          <p className="text-2xl font-bold text-emerald-600">+$3.2K</p>
                        </div>
                        <DollarSign className="w-8 h-8 text-emerald-600" />
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Weekly Performance Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                          <span className="font-medium">Productivity increased by 15% this week</span>
                        </div>
                        <span className="text-sm text-green-600">Excellent</span>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Clock className="w-5 h-5 text-blue-600" />
                          <span className="font-medium">Average response time: 4.2 hours</span>
                        </div>
                        <span className="text-sm text-blue-600">Good</span>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Star className="w-5 h-5 text-purple-600" />
                          <span className="font-medium">Client satisfaction: 96%</span>
                        </div>
                        <span className="text-sm text-purple-600">Outstanding</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
