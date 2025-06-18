'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { useEnhancedAI } from '@/lib/ai/enhanced-ai-service'
import { 
  Sparkles,
  Bot,
  Send,
  Lightbulb,
  TrendingUp,
  Clock,
  DollarSign,
  Target,
  AlertCircle,
  CheckCircle2,
  User,
  Zap,
  Brain,
  Wand2,
  Star,
  ThumbsUp,
  ThumbsDown,
  Copy,
  Download,
  Share2,
  Settings,
  Mic,
  Pause,
  Play,
  RefreshCw,
  BookOpen,
  FileText,
  BarChart3,
  PieChart,
  Calendar,
  Users,
  MessageSquare,
  ChevronRight,
  Plus,
  Trash2
} from 'lucide-react'

interface ChatMessage {
  id: string
  type: 'user' | 'assistant'
  content: string
  timestamp: Date
  suggestions?: string[]
  actionItems?: Array<{
    title: string
    action: string
    priority: 'high' | 'medium' | 'low'
  }>
}

interface AIInsight {
  id: string
  type: 'optimization' | 'recommendation' | 'alert' | 'opportunity'
  title: string
  description: string
  impact: 'high' | 'medium' | 'low'
  category: 'revenue' | 'efficiency' | 'client' | 'project'
  actionable: boolean
  estimatedValue?: string
  timeToImplement?: string
}

interface AutomationSuggestion {
  id: string
  title: string
  description: string
  category: 'invoicing' | 'time-tracking' | 'client-communication' | 'project-management'
  complexity: 'simple' | 'moderate' | 'advanced'
  timeSaved: string
  setupTime: string
  enabled: boolean
}

export default function AIAssistantPage() {
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'assistant',
      content: 'Hello! I\'m your AI assistant. I\'ve analyzed your recent activity and have some insights to share. How can I help you optimize your freelance business today?',
      timestamp: new Date(),
      suggestions: [
        'Show me revenue optimization tips',
        'Analyze my project performance',
        'Suggest workflow improvements',
        'Help me plan next week'
      ]
    }
  ])
  const [currentInput, setCurrentInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [activeTab, setActiveTab] = useState('chat')
  const chatEndRef = useRef<HTMLDivElement>(null)

  const aiInsights: AIInsight[] = [
    {
      id: '1',
      type: 'optimization',
      title: 'Increase Your Hourly Rate',
      description: 'Based on your portfolio quality and client feedback (4.8/5), you could increase your rate by 15-20% for new projects.',
      impact: 'high',
      category: 'revenue',
      actionable: true,
      estimatedValue: '+$2,400/month',
      timeToImplement: '1 week'
    },
    {
      id: '2',
      type: 'alert',
      title: 'Project Deadline Risk',
      description: 'The E-commerce Website project is at risk of missing its deadline. Consider adjusting scope or timeline.',
      impact: 'high',
      category: 'project',
      actionable: true,
      timeToImplement: 'Immediate'
    },
    {
      id: '3',
      type: 'opportunity',
      title: 'Upsell Opportunity',
      description: 'TechCorp Solutions has requested similar services 3 times. Consider offering a monthly retainer package.',
      impact: 'medium',
      category: 'client',
      actionable: true,
      estimatedValue: '+$4,000/month',
      timeToImplement: '2 weeks'
    },
    {
      id: '4',
      type: 'recommendation',
      title: 'Time Block Optimization',
      description: 'Your most productive hours are 9-11 AM. Schedule complex tasks during this window for 23% better efficiency.',
      impact: 'medium',
      category: 'efficiency',
      actionable: true,
      timeToImplement: '1 day'
    }
  ]

  const automationSuggestions: AutomationSuggestion[] = [
    {
      id: '1',
      title: 'Automatic Invoice Generation',
      description: 'Generate and send invoices automatically when projects reach completion milestones',
      category: 'invoicing',
      complexity: 'simple',
      timeSaved: '2 hours/week',
      setupTime: '15 minutes',
      enabled: false
    },
    {
      id: '2',
      title: 'Smart Time Tracking Reminders',
      description: 'Get intelligent reminders to start/stop time tracking based on your calendar and work patterns',
      category: 'time-tracking',
      complexity: 'moderate',
      timeSaved: '30 minutes/day',
      setupTime: '30 minutes',
      enabled: true
    },
    {
      id: '3',
      title: 'Client Check-in Automation',
      description: 'Automatically send project updates and check-ins to clients at optimal times',
      category: 'client-communication',
      complexity: 'moderate',
      timeSaved: '1.5 hours/week',
      setupTime: '45 minutes',
      enabled: false
    },
    {
      id: '4',
      title: 'Project Health Monitoring',
      description: 'Get AI-powered alerts about project risks, budget overruns, and scope creep',
      category: 'project-management',
      complexity: 'advanced',
      timeSaved: '3 hours/week',
      setupTime: '2 hours',
      enabled: true
    }
  ]

  const handleSendMessage = async () => {
    if (!currentInput.trim()) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: currentInput,
      timestamp: new Date()
    }

    setChatMessages(prev => [...prev, userMessage])
    const inputToProcess = currentInput
    setCurrentInput('')
    setIsTyping(true)

    try {
      // Use the working AI API endpoint
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputToProcess,
          context: {
            userId: 'demo-user',
            sessionId: Date.now().toString(),
            projectData: null,
            clientData: null,
            performanceMetrics: null,
            preferences: null
          }
        })
      })

      if (!response.ok) {
        throw new Error('API request failed')
      }

      const data = await response.json()
      
      if (data.success && data.response) {
        const aiResponse: ChatMessage = {
          id: (Date.now() + 1).toString(),
          type: 'assistant',
          content: data.response.content,
          timestamp: new Date(),
          suggestions: data.response.suggestions,
          actionItems: data.response.actionItems
        }
        
        setChatMessages(prev => [...prev, aiResponse])
      } else {
        throw new Error('Invalid API response')
      }
    } catch (error) {
      console.error('AI response error:', error)
      // Fallback to basic response
      const aiResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: getAIResponse(inputToProcess),
        timestamp: new Date(),
        actionItems: getActionItems(inputToProcess)
      }
      setChatMessages(prev => [...prev, aiResponse])
    } finally {
      setIsTyping(false)
    }
  }

  const getAIResponse = (input: string): string => {
    const lowercaseInput = input.toLowerCase()
    
    if (lowercaseInput.includes('revenue') || lowercaseInput.includes('money') || lowercaseInput.includes('income')) {
      return 'Based on your current performance, I recommend three revenue optimization strategies: 1) Increase your hourly rate by 15% for new clients (your 4.8/5 rating justifies this), 2) Offer retainer packages to your top 3 clients, and 3) Add value-based pricing for design projects. This could increase your monthly revenue by $3,200.'
    }
    
    if (lowercaseInput.includes('project') || lowercaseInput.includes('deadline') || lowercaseInput.includes('management')) {
      return 'I\'ve analyzed your project data and found that your E-commerce Website project needs attention. You\'re 12% behind schedule, but the client satisfaction is high. I suggest: 1) Prioritize the homepage completion, 2) Delegate UI polishing to a team member, and 3) Communicate timeline adjustment to maintain trust.'
    }
    
    if (lowercaseInput.includes('time') || lowercaseInput.includes('productivity') || lowercaseInput.includes('efficient')) {
      return 'Your productivity patterns show peak performance between 9-11 AM (23% higher output). I recommend: 1) Schedule complex development work during this window, 2) Batch similar tasks together, and 3) Use the Pomodoro technique for afternoon sessions. This could save you 5-8 hours per week.'
    }
    
    if (lowercaseInput.includes('client') || lowercaseInput.includes('communication') || lowercaseInput.includes('relationship')) {
      return 'Your client relationships are strong with a 4.8/5 satisfaction rate. To leverage this: 1) Request testimonials from your top 3 clients, 2) Create case studies from recent successes, and 3) Implement a referral program offering 10% commission. This could bring 2-3 new clients monthly.'
    }
    
    return 'I\'m here to help optimize your freelance business! I can provide insights on revenue growth, project management, time optimization, client relationships, and workflow automation. What specific area would you like to focus on?'
  }

  const getActionItems = (input: string) => {
    const lowercaseInput = input.toLowerCase()
    
    if (lowercaseInput.includes('revenue')) {
      return [
        { title: 'Update pricing for new clients', action: 'increase_rates', priority: 'high' as const },
        { title: 'Create retainer proposal template', action: 'create_template', priority: 'medium' as const }
      ]
    }
    
    if (lowercaseInput.includes('project')) {
      return [
        { title: 'Review E-commerce project timeline', action: 'review_timeline', priority: 'high' as const },
        { title: 'Send client update email', action: 'send_update', priority: 'medium' as const }
      ]
    }
    
    return []
  }

  const handleSuggestionClick = (suggestion: string) => {
    setCurrentInput(suggestion)
  }

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [chatMessages])

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'optimization': return TrendingUp
      case 'alert': return AlertCircle
      case 'opportunity': return Lightbulb
      case 'recommendation': return Target
      default: return Sparkles
    }
  }

  const getInsightColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'border-red-200 bg-red-50'
      case 'medium': return 'border-yellow-200 bg-yellow-50'
      case 'low': return 'border-blue-200 bg-blue-50'
      default: return 'border-gray-200 bg-gray-50'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'invoicing': return FileText
      case 'time-tracking': return Clock
      case 'client-communication': return MessageSquare
      case 'project-management': return BarChart3
      default: return Settings
    }
  }

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'simple': return 'bg-green-100 text-green-800'
      case 'moderate': return 'bg-yellow-100 text-yellow-800'
      case 'advanced': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50/30">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 text-white">
              <Sparkles className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                AI Assistant
              </h1>
              <p className="text-gray-600 mt-2 text-lg">
                Your intelligent business optimization companion
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Badge className="bg-green-100 text-green-800 px-3 py-1">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
              AI Active
            </Badge>
            <Button variant="outline" className="border-gray-300">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-700 text-sm font-medium">Insights Generated</p>
                  <p className="text-2xl font-bold text-blue-900">24</p>
                </div>
                <Brain className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-700 text-sm font-medium">Time Saved</p>
                  <p className="text-2xl font-bold text-green-900">12.5h</p>
                </div>
                <Clock className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-700 text-sm font-medium">Revenue Impact</p>
                  <p className="text-2xl font-bold text-purple-900">+$4.2K</p>
                </div>
                <DollarSign className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-700 text-sm font-medium">Actions Completed</p>
                  <p className="text-2xl font-bold text-orange-900">18</p>
                </div>
                <CheckCircle2 className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-white shadow-sm">
            <TabsTrigger 
              value="chat" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Chat
            </TabsTrigger>
            <TabsTrigger 
              value="analyze" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white"
            >
              <Lightbulb className="h-4 w-4 mr-2" />
              Analyze
            </TabsTrigger>
            <TabsTrigger 
              value="generate" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white"
            >
              <Zap className="h-4 w-4 mr-2" />
              Generate
            </TabsTrigger>
            <TabsTrigger 
              value="history" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              History
            </TabsTrigger>
          </TabsList>

          {/* AI Chat Tab */}
          <TabsContent value="chat" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card className="h-[600px] flex flex-col">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center">
                        <Bot className="h-5 w-5 mr-2 text-purple-600" />
                        AI Assistant Chat
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Button
                          data-testid="clear-chat-btn"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            console.log('Clearing chat history');
                            setChatMessages([]);
                            alert('Chat history cleared!');
                          }}
                          className="text-gray-600 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Clear
                        </Button>
                        <Badge className="bg-purple-100 text-purple-800">
                          Smart Mode
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="flex-1 flex flex-col p-4">
                    {/* Chat Messages */}
                    <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                      {chatMessages.map((message) => (
                        <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[80%] ${
                            message.type === 'user' 
                              ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' 
                              : 'bg-white border border-gray-200'
                          } rounded-2xl p-4 shadow-sm`}>
                            {message.type === 'assistant' && (
                              <div className="flex items-center mb-2">
                                <Avatar className="h-6 w-6 mr-2">
                                  <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs">
                                    AI
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-sm font-medium text-gray-700">AI Assistant</span>
                              </div>
                            )}
                            <p className={message.type === 'user' ? 'text-white' : 'text-gray-800'}>
                              {message.content}
                            </p>
                            
                            {message.suggestions && (
                              <div className="mt-3 space-y-2">
                                <p className="text-sm text-gray-600 font-medium">Quick suggestions:</p>
                                {message.suggestions.map((suggestion, index) => (
                                  <Button
                                    key={index}
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleSuggestionClick(suggestion)}
                                    className="mr-2 mb-2 text-xs border-purple-200 hover:bg-purple-50"
                                  >
                                    {suggestion}
                                  </Button>
                                ))}
                              </div>
                            )}
                            
                            {message.actionItems && message.actionItems.length > 0 && (
                              <div className="mt-3 space-y-2">
                                <p className="text-sm text-gray-600 font-medium">Action items:</p>
                                {message.actionItems.map((item, index) => (
                                  <div key={index} className="flex items-center justify-between bg-gray-50 rounded-lg p-2">
                                    <span className="text-sm">{item.title}</span>
                                    <Badge className={
                                      item.priority === 'high' ? 'bg-red-100 text-red-800' :
                                      item.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                      'bg-green-100 text-green-800'
                                    }>
                                      {item.priority}
                                    </Badge>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                      
                      {isTyping && (
                        <div className="flex justify-start">
                          <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
                            <div className="flex items-center space-x-2">
                              <div className="flex space-x-1">
                                <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" />
                                <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce delay-100" />
                                <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce delay-200" />
                              </div>
                              <span className="text-sm text-gray-500">AI is thinking...</span>
                            </div>
                          </div>
                        </div>
                      )}
                      <div ref={chatEndRef} />
                    </div>
                    
                    {/* Chat Input */}
                    <div className="flex items-center space-x-2">
                      <Input
                        value={currentInput}
                        onChange={(e) => setCurrentInput(e.target.value)}
                        placeholder="Ask me anything about your business..."
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        className="flex-1"
                      />
                      <Button
                        data-testid="send-message-btn"
                        onClick={handleSendMessage}
                        disabled={!currentInput.trim() || isTyping}
                        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Quick Actions Sidebar */}
              <div className="space-y-4">
                <Card className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Quick Actions</h3>
                  <div className="space-y-2">
                    {[
                      { title: 'Analyze Revenue', icon: DollarSign, action: 'revenue analysis' },
                      { title: 'Project Health Check', icon: BarChart3, action: 'project analysis' },
                      { title: 'Time Optimization', icon: Clock, action: 'time optimization tips' },
                      { title: 'Client Insights', icon: Users, action: 'client relationship insights' }
                    ].map((action, index) => (
                      <Button
                        key={index}
                        data-testid={index === 0 ? "quick-action-btn" : `quick-action-${action.title.toLowerCase().replace(/\s+/g, '-')}-btn`}
                        variant="ghost"
                        onClick={() => handleSuggestionClick(action.action)}
                        className="w-full justify-start hover:bg-purple-50"
                      >
                        <action.icon className="h-4 w-4 mr-3 text-purple-600" />
                        {action.title}
                      </Button>
                    ))}
                  </div>
                </Card>
                
                <Card className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Recent Insights</h3>
                  <div className="space-y-3">
                    {aiInsights.slice(0, 3).map((insight) => {
                      const Icon = getInsightIcon(insight.type)
                      return (
                        <div key={insight.id} className="p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-start space-x-2">
                            <Icon className="h-4 w-4 text-purple-600 mt-1" />
                            <div>
                              <h4 className="text-sm font-medium text-gray-900">{insight.title}</h4>
                              <p className="text-xs text-gray-600 mt-1">{insight.description.slice(0, 60)}...</p>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* AI Insights Tab */}
          <TabsContent value="analyze" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {aiInsights.map((insight) => {
                const Icon = getInsightIcon(insight.type)
                return (
                  <Card key={insight.id} className={`p-6 hover:shadow-lg transition-all duration-300 border-l-4 ${getInsightColor(insight.impact)}`}>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 rounded-lg bg-white shadow-sm">
                          <Icon className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{insight.title}</h3>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge className={`text-xs ${
                              insight.impact === 'high' ? 'bg-red-100 text-red-800' :
                              insight.impact === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-blue-100 text-blue-800'
                            }`}>
                              {insight.impact} impact
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {insight.category}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-gray-700 mb-4">{insight.description}</p>
                    
                    {insight.estimatedValue && (
                      <div className="flex items-center justify-between text-sm mb-4">
                        <span className="text-gray-600">Estimated Value:</span>
                        <span className="font-semibold text-green-600">{insight.estimatedValue}</span>
                      </div>
                    )}
                    
                    {insight.timeToImplement && (
                      <div className="flex items-center justify-between text-sm mb-4">
                        <span className="text-gray-600">Time to Implement:</span>
                        <span className="font-semibold">{insight.timeToImplement}</span>
                      </div>
                    )}
                    
                    {insight.actionable && (
                      <Button 
                        data-testid="take-action-btn"
                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                        onClick={() => {
                          console.log('Take action clicked for insight:', insight.title);
                          alert(`Taking action for: ${insight.title}`);
                        }}
                      >
                        Take Action
                        <ChevronRight className="h-4 w-4 ml-2" />
                      </Button>
                    )}
                  </Card>
                )
              })}
            </div>
          </TabsContent>

          {/* Automation Tab */}
          <TabsContent value="generate" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {automationSuggestions.map((automation) => {
                const Icon = getCategoryIcon(automation.category)
                return (
                  <Card key={automation.id} className="p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50">
                          <Icon className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{automation.title}</h3>
                          <Badge className={getComplexityColor(automation.complexity)}>
                            {automation.complexity}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button 
                          variant={automation.enabled ? "default" : "outline"}
                          size="sm"
                          className={automation.enabled ? "bg-green-600 hover:bg-green-700" : ""}
                        >
                          {automation.enabled ? "Enabled" : "Enable"}
                        </Button>
                      </div>
                    </div>
                    
                    <p className="text-gray-700 mb-4">{automation.description}</p>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Time Saved:</span>
                        <p className="font-semibold text-green-600">{automation.timeSaved}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Setup Time:</span>
                        <p className="font-semibold">{automation.setupTime}</p>
                      </div>
                    </div>
                    
                    {!automation.enabled && (
                      <Button variant="outline" className="w-full mt-4 border-purple-200 hover:bg-purple-50">
                        <Plus className="h-4 w-4 mr-2" />
                        Set Up Automation
                      </Button>
                    )}
                  </Card>
                )
              })}
            </div>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="history" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="p-6">
                <h3 className="font-semibold text-gray-900 mb-4">AI Performance Impact</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-600">Revenue Optimization</span>
                      <span className="text-sm font-semibold">+18.5%</span>
                    </div>
                    <Progress value={85} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-600">Time Efficiency</span>
                      <span className="text-sm font-semibold">+23.2%</span>
                    </div>
                    <Progress value={92} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-600">Client Satisfaction</span>
                      <span className="text-sm font-semibold">+12.1%</span>
                    </div>
                    <Progress value={76} className="h-2" />
                  </div>
                </div>
              </Card>
              
              <Card className="p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Weekly AI Summary</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Insights Generated</span>
                    <span className="font-semibold">8</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Actions Taken</span>
                    <span className="font-semibold">6</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Time Saved</span>
                    <span className="font-semibold">4.2h</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Revenue Impact</span>
                    <span className="font-semibold text-green-600">+$1,240</span>
                  </div>
                </div>
              </Card>
              
              <Card className="p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Automation Status</h3>
                <div className="space-y-3">
                  {automationSuggestions.map((auto, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{auto.title}</span>
                      <Badge className={auto.enabled ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                        {auto.enabled ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
} 