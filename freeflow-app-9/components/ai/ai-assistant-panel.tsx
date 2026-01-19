'use client'

/**
 * AI Assistant Panel
 *
 * Contextual AI assistant that can be embedded anywhere:
 * - Sidebar panel with multiple modes
 * - Context-aware assistance
 * - Quick actions and shortcuts
 * - Document/code analysis
 * - Task automation
 * - Multi-agent support
 */

import React, { useState, useCallback, useMemo } from 'react'
import {
  Bot,
  Sparkles,
  FileText,
  Code,
  Lightbulb,
  Zap,
  MessageSquare,
  Search,
  Brain,
  Wand2,
  Settings,
  History,
  Star,
  BookOpen,
  PenTool,
  RefreshCw,
  ChevronRight,
  ChevronDown,
  X,
  Plus,
  ExternalLink,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Copy,
  Maximize2,
  Minimize2
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Progress } from '@/components/ui/progress'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'

// Types
export type AssistantMode = 'chat' | 'analyze' | 'generate' | 'automate' | 'learn'

export interface QuickAction {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  category: string
  handler?: () => void | Promise<void>
}

export interface Suggestion {
  id: string
  type: 'improvement' | 'fix' | 'optimization' | 'warning' | 'info'
  title: string
  description: string
  impact: 'high' | 'medium' | 'low'
  autoApply?: boolean
  applyAction?: () => void | Promise<void>
}

export interface TaskProgress {
  id: string
  name: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  progress: number
  message?: string
}

export interface HistoryItem {
  id: string
  type: 'query' | 'action' | 'analysis'
  title: string
  timestamp: Date
  result?: any
}

export interface AIAssistantPanelProps {
  // Configuration
  title?: string
  defaultMode?: AssistantMode
  context?: Record<string, any>

  // Features
  enableChat?: boolean
  enableAnalysis?: boolean
  enableGeneration?: boolean
  enableAutomation?: boolean
  enableLearning?: boolean

  // Data
  quickActions?: QuickAction[]
  suggestions?: Suggestion[]
  history?: HistoryItem[]
  currentTasks?: TaskProgress[]

  // Styling
  className?: string
  collapsed?: boolean
  position?: 'left' | 'right'

  // Callbacks
  onModeChange?: (mode: AssistantMode) => void
  onQuery?: (query: string, mode: AssistantMode) => Promise<string>
  onActionExecute?: (actionId: string) => Promise<void>
  onSuggestionApply?: (suggestionId: string) => Promise<void>
  onContextAnalyze?: (context: any) => Promise<Suggestion[]>
  onClose?: () => void
  onExpand?: () => void
}

const DEFAULT_QUICK_ACTIONS: QuickAction[] = [
  {
    id: 'summarize',
    name: 'Summarize',
    description: 'Summarize selected content',
    icon: <FileText className="h-4 w-4" />,
    category: 'Content'
  },
  {
    id: 'explain',
    name: 'Explain Code',
    description: 'Explain selected code',
    icon: <Code className="h-4 w-4" />,
    category: 'Code'
  },
  {
    id: 'improve',
    name: 'Improve Writing',
    description: 'Enhance text quality',
    icon: <PenTool className="h-4 w-4" />,
    category: 'Content'
  },
  {
    id: 'generate',
    name: 'Generate Ideas',
    description: 'Brainstorm new ideas',
    icon: <Lightbulb className="h-4 w-4" />,
    category: 'Creative'
  },
  {
    id: 'fix',
    name: 'Fix Issues',
    description: 'Auto-fix detected problems',
    icon: <Wand2 className="h-4 w-4" />,
    category: 'Code'
  },
  {
    id: 'automate',
    name: 'Create Workflow',
    description: 'Automate repetitive tasks',
    icon: <Zap className="h-4 w-4" />,
    category: 'Automation'
  }
]

export function AIAssistantPanel({
  title = 'AI Assistant',
  defaultMode = 'chat',
  context,
  enableChat = true,
  enableAnalysis = true,
  enableGeneration = true,
  enableAutomation = true,
  enableLearning = true,
  quickActions = DEFAULT_QUICK_ACTIONS,
  suggestions = [],
  history = [],
  currentTasks = [],
  className,
  collapsed = false,
  position = 'right',
  onModeChange,
  onQuery,
  onActionExecute,
  onSuggestionApply,
  onContextAnalyze,
  onClose,
  onExpand
}: AIAssistantPanelProps) {
  // State
  const [mode, setMode] = useState<AssistantMode>(defaultMode)
  const [query, setQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [response, setResponse] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('actions')
  const [isExpanded, setIsExpanded] = useState(false)
  const [localSuggestions, setLocalSuggestions] = useState<Suggestion[]>(suggestions)
  const [selectedAgent, setSelectedAgent] = useState('general')

  // Derived state
  const activeTasks = useMemo(() =>
    currentTasks.filter(t => t.status === 'running'),
    [currentTasks]
  )

  const pendingTasks = useMemo(() =>
    currentTasks.filter(t => t.status === 'pending'),
    [currentTasks]
  )

  // Handle mode change
  const handleModeChange = useCallback((newMode: AssistantMode) => {
    setMode(newMode)
    setResponse(null)
    onModeChange?.(newMode)
  }, [onModeChange])

  // Handle query submit
  const handleSubmit = useCallback(async () => {
    if (!query.trim() || !onQuery) return

    setIsLoading(true)
    setResponse(null)

    try {
      const result = await onQuery(query, mode)
      setResponse(result)
    } catch (error) {
      setResponse('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }, [query, mode, onQuery])

  // Handle action execution
  const handleActionExecute = useCallback(async (action: QuickAction) => {
    setIsLoading(true)

    try {
      if (action.handler) {
        await action.handler()
      } else if (onActionExecute) {
        await onActionExecute(action.id)
      }
    } finally {
      setIsLoading(false)
    }
  }, [onActionExecute])

  // Handle suggestion apply
  const handleSuggestionApply = useCallback(async (suggestion: Suggestion) => {
    if (suggestion.applyAction) {
      await suggestion.applyAction()
    } else if (onSuggestionApply) {
      await onSuggestionApply(suggestion.id)
    }

    // Remove applied suggestion from local state
    setLocalSuggestions(prev => prev.filter(s => s.id !== suggestion.id))
  }, [onSuggestionApply])

  // Analyze context
  const handleAnalyzeContext = useCallback(async () => {
    if (!onContextAnalyze || !context) return

    setIsLoading(true)

    try {
      const newSuggestions = await onContextAnalyze(context)
      setLocalSuggestions(prev => [...prev, ...newSuggestions])
    } finally {
      setIsLoading(false)
    }
  }, [context, onContextAnalyze])

  // Get icon for suggestion type
  const getSuggestionIcon = (type: Suggestion['type']) => {
    switch (type) {
      case 'improvement':
        return <Sparkles className="h-4 w-4 text-blue-500" />
      case 'fix':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case 'optimization':
        return <Zap className="h-4 w-4 text-yellow-500" />
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-orange-500" />
      case 'info':
        return <Lightbulb className="h-4 w-4 text-purple-500" />
      default:
        return <Lightbulb className="h-4 w-4" />
    }
  }

  // Get impact badge color
  const getImpactColor = (impact: Suggestion['impact']) => {
    switch (impact) {
      case 'high':
        return 'destructive'
      case 'medium':
        return 'default'
      case 'low':
        return 'secondary'
      default:
        return 'outline'
    }
  }

  // Group actions by category
  const actionsByCategory = useMemo(() => {
    const grouped = new Map<string, QuickAction[]>()
    quickActions.forEach(action => {
      const category = action.category || 'General'
      if (!grouped.has(category)) {
        grouped.set(category, [])
      }
      grouped.get(category)!.push(action)
    })
    return grouped
  }, [quickActions])

  if (collapsed) {
    return (
      <TooltipProvider>
        <div className={cn('w-12 bg-background border-l flex flex-col items-center py-4 gap-2', className)}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={() => handleModeChange('chat')}>
                <MessageSquare className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">Chat</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={() => handleModeChange('analyze')}>
                <Search className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">Analyze</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={() => handleModeChange('generate')}>
                <Wand2 className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">Generate</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={() => handleModeChange('automate')}>
                <Zap className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">Automate</TooltipContent>
          </Tooltip>
          <div className="flex-1" />
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={onExpand}>
                <ChevronRight className={cn('h-5 w-5', position === 'right' && 'rotate-180')} />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">Expand</TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>
    )
  }

  return (
    <TooltipProvider>
      <div
        className={cn(
          'flex flex-col bg-background border-l',
          isExpanded ? 'w-96' : 'w-80',
          className
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Bot className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold text-sm">{title}</h2>
              <p className="text-xs text-muted-foreground">
                {mode === 'chat' && 'Ask me anything'}
                {mode === 'analyze' && 'Analyzing context'}
                {mode === 'generate' && 'Creating content'}
                {mode === 'automate' && 'Building workflows'}
                {mode === 'learn' && 'Learning mode'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
            {onClose && (
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Mode Selector */}
        <div className="px-4 py-2 border-b">
          <div className="flex items-center gap-1 p-1 bg-muted rounded-lg">
            {enableChat && (
              <Button
                variant={mode === 'chat' ? 'default' : 'ghost'}
                size="sm"
                className="flex-1 text-xs"
                onClick={() => handleModeChange('chat')}
              >
                <MessageSquare className="h-3 w-3 mr-1" />
                Chat
              </Button>
            )}
            {enableAnalysis && (
              <Button
                variant={mode === 'analyze' ? 'default' : 'ghost'}
                size="sm"
                className="flex-1 text-xs"
                onClick={() => handleModeChange('analyze')}
              >
                <Search className="h-3 w-3 mr-1" />
                Analyze
              </Button>
            )}
            {enableGeneration && (
              <Button
                variant={mode === 'generate' ? 'default' : 'ghost'}
                size="sm"
                className="flex-1 text-xs"
                onClick={() => handleModeChange('generate')}
              >
                <Wand2 className="h-3 w-3 mr-1" />
                Generate
              </Button>
            )}
            {enableAutomation && (
              <Button
                variant={mode === 'automate' ? 'default' : 'ghost'}
                size="sm"
                className="flex-1 text-xs"
                onClick={() => handleModeChange('automate')}
              >
                <Zap className="h-3 w-3 mr-1" />
                Auto
              </Button>
            )}
          </div>
        </div>

        {/* Agent Selector */}
        <div className="px-4 py-2 border-b">
          <Select value={selectedAgent} onValueChange={setSelectedAgent}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="Select agent" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="general">
                <div className="flex items-center gap-2">
                  <Bot className="h-4 w-4" />
                  General Assistant
                </div>
              </SelectItem>
              <SelectItem value="planner">
                <div className="flex items-center gap-2">
                  <Brain className="h-4 w-4" />
                  Strategic Planner
                </div>
              </SelectItem>
              <SelectItem value="coder">
                <div className="flex items-center gap-2">
                  <Code className="h-4 w-4" />
                  Code Assistant
                </div>
              </SelectItem>
              <SelectItem value="writer">
                <div className="flex items-center gap-2">
                  <PenTool className="h-4 w-4" />
                  Content Writer
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Active Tasks */}
        {activeTasks.length > 0 && (
          <div className="px-4 py-2 border-b bg-muted/30">
            <p className="text-xs font-medium mb-2">Active Tasks</p>
            {activeTasks.map(task => (
              <div key={task.id} className="mb-2">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="truncate">{task.name}</span>
                  <span className="text-muted-foreground">{task.progress}%</span>
                </div>
                <Progress value={task.progress} className="h-1" />
              </div>
            ))}
          </div>
        )}

        {/* Content Area */}
        <ScrollArea className="flex-1">
          <div className="p-4">
            {/* Query Input */}
            <div className="mb-4">
              <Textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={
                  mode === 'chat' ? 'Ask me anything...' :
                  mode === 'analyze' ? 'What would you like to analyze?' :
                  mode === 'generate' ? 'What would you like me to create?' :
                  mode === 'automate' ? 'Describe the workflow...' :
                  'What would you like to learn about?'
                }
                className="min-h-[80px] resize-none text-sm"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSubmit()
                  }
                }}
              />
              <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-muted-foreground">
                  Press Enter to send
                </p>
                <Button
                  size="sm"
                  disabled={!query.trim() || isLoading}
                  onClick={handleSubmit}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-1" />
                  ) : (
                    <Sparkles className="h-4 w-4 mr-1" />
                  )}
                  {mode === 'chat' ? 'Ask' : mode === 'analyze' ? 'Analyze' : mode === 'generate' ? 'Generate' : 'Run'}
                </Button>
              </div>
            </div>

            {/* Response */}
            {response && (
              <Card className="mb-4">
                <CardContent className="p-3">
                  <div className="flex items-start justify-between mb-2">
                    <Badge variant="secondary" className="text-xs">
                      <Bot className="h-3 w-3 mr-1" />
                      AI Response
                    </Badge>
                    <Button variant="ghost" size="icon" className="h-6 w-6">
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                  <p className="text-sm whitespace-pre-wrap">{response}</p>
                </CardContent>
              </Card>
            )}

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full">
                <TabsTrigger value="actions" className="flex-1 text-xs">
                  <Zap className="h-3 w-3 mr-1" />
                  Actions
                </TabsTrigger>
                <TabsTrigger value="suggestions" className="flex-1 text-xs">
                  <Lightbulb className="h-3 w-3 mr-1" />
                  Suggestions
                  {localSuggestions.length > 0 && (
                    <Badge variant="secondary" className="ml-1 h-4 w-4 p-0 text-[10px]">
                      {localSuggestions.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="history" className="flex-1 text-xs">
                  <History className="h-3 w-3 mr-1" />
                  History
                </TabsTrigger>
              </TabsList>

              {/* Actions Tab */}
              <TabsContent value="actions" className="mt-3">
                <Accordion type="multiple" className="w-full">
                  {Array.from(actionsByCategory.entries()).map(([category, actions]) => (
                    <AccordionItem key={category} value={category}>
                      <AccordionTrigger className="text-sm py-2">
                        {category}
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-2">
                          {actions.map(action => (
                            <Button
                              key={action.id}
                              variant="outline"
                              size="sm"
                              className="w-full justify-start text-xs h-auto py-2"
                              onClick={() => handleActionExecute(action)}
                              disabled={isLoading}
                            >
                              <div className="flex items-start gap-2">
                                <div className="shrink-0 mt-0.5">{action.icon}</div>
                                <div className="text-left">
                                  <p className="font-medium">{action.name}</p>
                                  <p className="text-muted-foreground font-normal">
                                    {action.description}
                                  </p>
                                </div>
                              </div>
                            </Button>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </TabsContent>

              {/* Suggestions Tab */}
              <TabsContent value="suggestions" className="mt-3 space-y-3">
                {onContextAnalyze && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs"
                    onClick={handleAnalyzeContext}
                    disabled={isLoading}
                  >
                    <RefreshCw className={cn('h-3 w-3 mr-2', isLoading && 'animate-spin')} />
                    Refresh Analysis
                  </Button>
                )}

                {localSuggestions.length === 0 ? (
                  <div className="text-center py-6">
                    <Lightbulb className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No suggestions available</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Run an analysis to get AI-powered suggestions
                    </p>
                  </div>
                ) : (
                  localSuggestions.map(suggestion => (
                    <Card key={suggestion.id}>
                      <CardContent className="p-3">
                        <div className="flex items-start gap-2">
                          <div className="shrink-0 mt-0.5">
                            {getSuggestionIcon(suggestion.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-medium text-sm truncate">{suggestion.title}</p>
                              <Badge
                                variant={getImpactColor(suggestion.impact) as any}
                                className="text-[10px] shrink-0"
                              >
                                {suggestion.impact}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mb-2">
                              {suggestion.description}
                            </p>
                            <Button
                              size="sm"
                              variant="secondary"
                              className="h-7 text-xs"
                              onClick={() => handleSuggestionApply(suggestion)}
                            >
                              <Wand2 className="h-3 w-3 mr-1" />
                              {suggestion.autoApply ? 'Auto Apply' : 'Apply'}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>

              {/* History Tab */}
              <TabsContent value="history" className="mt-3">
                {history.length === 0 ? (
                  <div className="text-center py-6">
                    <History className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No history yet</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Your AI interactions will appear here
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {history.map(item => (
                      <div
                        key={item.id}
                        className="flex items-start gap-2 p-2 rounded-lg hover:bg-muted/50 cursor-pointer"
                      >
                        <div className="shrink-0 mt-0.5">
                          {item.type === 'query' && <MessageSquare className="h-4 w-4 text-blue-500" />}
                          {item.type === 'action' && <Zap className="h-4 w-4 text-yellow-500" />}
                          {item.type === 'analysis' && <Search className="h-4 w-4 text-purple-500" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm truncate">{item.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {item.timestamp.toLocaleString()}
                          </p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="px-4 py-2 border-t bg-muted/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <Settings className="h-3.5 w-3.5" />
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <BookOpen className="h-3.5 w-3.5" />
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <Star className="h-3.5 w-3.5" />
              </Button>
            </div>
            <p className="text-[10px] text-muted-foreground">
              Powered by FreeFlow AI
            </p>
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}

export default AIAssistantPanel
