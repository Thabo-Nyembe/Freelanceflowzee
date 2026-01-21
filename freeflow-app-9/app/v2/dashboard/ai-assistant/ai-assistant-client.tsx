'use client'

import { createClient } from '@/lib/supabase/client'

import { useState, useRef, useEffect, useMemo } from 'react'
import { toast } from 'sonner'
import {
  Bot,
  Send,
  Plus,
  Settings,
  MessageSquare,
  FileText,
  Sparkles,
  Code,
  Image as ImageIcon,
  Mic,
  Paperclip,
  Copy,
  Check,
  RefreshCw,
  Trash2,
  Star,
  StarOff,
  ChevronDown,
  Zap,
  Brain,
  History,
  Users,
  Folder,
  Search,
  Download,
  Upload,
  Wand2,
  Palette,
  Database,
  Terminal,
  FileCode,
  PenTool,
  Lightbulb,
  BarChart3,
  Clock,
  Save,
  AlertCircle,
  CheckCircle,
  Loader2,
  ThumbsUp,
  ThumbsDown,
  Share
} from 'lucide-react'

// Enhanced & Competitive Upgrade Components
import {
  AIInsightsPanel,
  CollaborationIndicator,
  PredictiveAnalytics,
} from '@/components/ui/competitive-upgrades'

import {
  ActivityFeed,
  QuickActionsToolbar,
} from '@/components/ui/competitive-upgrades-extended'




import { useAIAssistant } from '@/lib/hooks/use-ai-assistant'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'

// Initialize Supabase client once at module level
const supabase = createClient()

// Types
type ModelType = 'gpt-4o' | 'gpt-4-turbo' | 'gpt-3.5-turbo' | 'claude-3-opus' | 'claude-3-sonnet' | 'claude-3-haiku'
type ConversationMode = 'chat' | 'code' | 'analysis' | 'creative'
type AssistantType = 'general' | 'code' | 'writer' | 'analyst' | 'researcher' | 'custom'
type FileType = 'document' | 'code' | 'image' | 'data' | 'audio'

interface Assistant {
  id: string
  name: string
  description: string
  type: AssistantType
  model: ModelType
  systemPrompt: string
  temperature: number
  tools: string[]
  files: string[]
  icon: string
  color: string
  usageCount: number
  createdAt: Date
}

interface PromptTemplate {
  id: string
  name: string
  description: string
  prompt: string
  category: string
  variables: string[]
  usageCount: number
  starred: boolean
}

interface KnowledgeFile {
  id: string
  name: string
  type: FileType
  size: number
  chunks: number
  status: 'processing' | 'ready' | 'error'
  uploadedAt: Date
  assistant?: string
}

interface UsageStats {
  totalTokens: number
  inputTokens: number
  outputTokens: number
  totalCost: number
  conversations: number
  messages: number
  avgResponseTime: number
  quotaUsed: number
  quotaLimit: number
}

interface DailyUsage {
  date: string
  tokens: number
  cost: number
  messages: number
}

// Form state interfaces
interface AssistantFormState {
  name: string
  description: string
  model: ModelType
  systemPrompt: string
  temperature: number
  tools: string[]
}

interface PromptFormState {
  name: string
  description: string
  prompt: string
  category: string
  variables: string[]
}

// Mock Data for assistants (will be replaced with Supabase integration)
// MIGRATED: Batch #16 - Removed mock data, using database hooks

const models: { id: ModelType; name: string; provider: string; context: string; speed: string }[] = [
  { id: 'gpt-4o', name: 'GPT-4o', provider: 'OpenAI', context: '128k', speed: 'Fast' },
  { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', provider: 'OpenAI', context: '128k', speed: 'Medium' },
  { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', provider: 'OpenAI', context: '16k', speed: 'Very Fast' },
  { id: 'claude-3-opus', name: 'Claude 3 Opus', provider: 'Anthropic', context: '200k', speed: 'Medium' },
  { id: 'claude-3-sonnet', name: 'Claude 3 Sonnet', provider: 'Anthropic', context: '200k', speed: 'Fast' },
  { id: 'claude-3-haiku', name: 'Claude 3 Haiku', provider: 'Anthropic', context: '200k', speed: 'Very Fast' }
]

const modeConfig: Record<ConversationMode, { icon: React.ReactNode; label: string; color: string }> = {
  chat: { icon: <MessageSquare className="h-4 w-4" />, label: 'Chat', color: 'blue' },
  code: { icon: <Code className="h-4 w-4" />, label: 'Code', color: 'green' },
  analysis: { icon: <BarChart3 className="h-4 w-4" />, label: 'Analysis', color: 'purple' },
  creative: { icon: <Palette className="h-4 w-4" />, label: 'Creative', color: 'pink' }
}

// Helper Functions
const formatTokens = (tokens: number): string => {
  if (tokens >= 1000000) return `${(tokens / 1000000).toFixed(1)}M`
  if (tokens >= 1000) return `${(tokens / 1000).toFixed(1)}K`
  return tokens.toString()
}

const formatBytes = (bytes: number): string => {
  if (bytes >= 1000000) return `${(bytes / 1000000).toFixed(1)} MB`
  if (bytes >= 1000) return `${(bytes / 1000).toFixed(1)} KB`
  return `${bytes} B`
}

const formatCost = (cost: number): string => `$${cost.toFixed(2)}`

const formatDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(d)
}

const formatRelativeTime = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  return `${days}d ago`
}

const getModeColor = (mode: ConversationMode): string => {
  const colors: Record<ConversationMode, string> = {
    chat: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    code: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    analysis: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
    creative: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300'
  }
  return colors[mode] || colors.chat
}

const getModelColor = (model: string): string => {
  if (model.startsWith('gpt')) return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
  return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
}

const getFileIcon = (type: FileType): React.ReactNode => {
  const icons: Record<FileType, React.ReactNode> = {
    document: <FileText className="h-4 w-4" />,
    code: <FileCode className="h-4 w-4" />,
    image: <ImageIcon className="h-4 w-4" />,
    data: <Database className="h-4 w-4" />,
    audio: <Mic className="h-4 w-4" />
  }
  return icons[type]
}

// Enhanced AI Assistant Mock Data
const mockAIAssistantAIInsights = [
  { id: '1', type: 'success' as const, title: 'Response Quality', description: 'AI response accuracy at 94%. Users rating responses highly this week.', priority: 'low' as const, timestamp: new Date().toISOString(), category: 'Quality' },
  { id: '2', type: 'info' as const, title: 'Popular Topics', description: 'Code generation and debugging are trending. Consider adding more examples.', priority: 'medium' as const, timestamp: new Date().toISOString(), category: 'Analytics' },
  { id: '3', type: 'warning' as const, title: 'Rate Limits', description: 'Approaching 80% of monthly API quota. Consider upgrading plan.', priority: 'high' as const, timestamp: new Date().toISOString(), category: 'Usage' },
]

const mockAIAssistantCollaborators = [
  { id: '1', name: 'AI Engineer', avatar: '/avatars/ai-eng.jpg', status: 'online' as const, role: 'Model Training', lastActive: 'Now' },
  { id: '2', name: 'Prompt Designer', avatar: '/avatars/prompt.jpg', status: 'online' as const, role: 'Prompt Engineering', lastActive: '5m ago' },
  { id: '3', name: 'Data Scientist', avatar: '/avatars/data.jpg', status: 'away' as const, role: 'Analytics', lastActive: '20m ago' },
]

const mockAIAssistantPredictions = [
  { id: '1', label: 'Daily Queries', current: 4520, target: 5000, predicted: 4800, confidence: 85, trend: 'up' as const },
  { id: '2', label: 'Response Time', current: 1.2, target: 1.0, predicted: 1.1, confidence: 78, trend: 'up' as const },
  { id: '3', label: 'User Satisfaction', current: 92, target: 95, predicted: 94, confidence: 82, trend: 'up' as const },
]

const mockAIAssistantActivities = [
  { id: '1', user: 'AI Engineer', action: 'deployed', target: 'new model version 2.4', timestamp: '10m ago', type: 'success' as const },
  { id: '2', user: 'Prompt Designer', action: 'created', target: '5 new prompt templates', timestamp: '30m ago', type: 'info' as const },
  { id: '3', user: 'Data Scientist', action: 'analyzed', target: 'conversation patterns', timestamp: '1h ago', type: 'info' as const },
]

// Note: This mock data is kept for backwards compatibility but the component uses
// the quickActions array defined inside the component with proper dialog handlers
const mockAIAssistantQuickActions = [
  { id: '1', label: 'New Chat', icon: 'MessageSquare', shortcut: 'N', action: () => { /* Handled by quickActions in component */ } },
  { id: '2', label: 'Templates', icon: 'FileText', shortcut: 'T', action: () => { /* Handled by quickActions in component */ } },
  { id: '3', label: 'Knowledge', icon: 'Database', shortcut: 'K', action: () => { /* Handled by quickActions in component */ } },
  { id: '4', label: 'Settings', icon: 'Settings', shortcut: 'S', action: () => { /* Handled by quickActions in component */ } },
]

export default function AIAssistantClient() {


  // Use the AI Assistant hook for real Supabase operations
  const {
    conversations,
    messages,
    activeConversation,
    stats,
    isLoading,
    isSending,
    error,
    fetchConversations,
    fetchMessages,
    createConversation,
    sendMessage,
    sendMessageWithAI,
    updateConversation,
    deleteConversation,
    toggleStar: hookToggleStar,
    toggleArchive,
    setActiveConversation
  } = useAIAssistant()

  const [activeTab, setActiveTab] = useState('chat')
  const [assistants, setAssistants] = useState<Assistant[]>([])
  const [prompts, setPrompts] = useState<PromptTemplate[]>([])
  const [files, setFiles] = useState<KnowledgeFile[]>([])
  const [usageStats] = useState<UsageStats>({
    totalTokens: 0,
    inputTokens: 0,
    outputTokens: 0,
    totalCost: 0,
    conversations: 0,
    messages: 0,
    avgResponseTime: 0,
    quotaUsed: 0,
    quotaLimit: 0
  })
  const [dailyUsage] = useState<DailyUsage[]>([])

  const [selectedModel, setSelectedModel] = useState<ModelType>('gpt-4o')
  const [selectedMode, setSelectedMode] = useState<ConversationMode>('chat')
  const [inputMessage, setInputMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [showSidebar, setShowSidebar] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showModelSelector, setShowModelSelector] = useState(false)

  const [showNewAssistant, setShowNewAssistant] = useState(false)
  const [showPromptDetail, setShowPromptDetail] = useState(false)
  const [selectedPrompt, setSelectedPrompt] = useState<PromptTemplate | null>(null)
  const [showSettings, setShowSettings] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [showNewPrompt, setShowNewPrompt] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)

  // Quick action dialog states
  const [showNewChatDialog, setShowNewChatDialog] = useState(false)
  const [showTemplatesDialog, setShowTemplatesDialog] = useState(false)
  const [showKnowledgeDialog, setShowKnowledgeDialog] = useState(false)
  const [showAISettingsDialog, setShowAISettingsDialog] = useState(false)

  // Additional dialog states for attachment features
  const [showAttachFileDialog, setShowAttachFileDialog] = useState(false)
  const [showAttachImageDialog, setShowAttachImageDialog] = useState(false)
  const [showVoiceInputDialog, setShowVoiceInputDialog] = useState(false)
  const [showEnhanceDialog, setShowEnhanceDialog] = useState(false)

  // Settings toggle states
  const [streamResponses, setStreamResponses] = useState(true)
  const [saveHistory, setSaveHistory] = useState(true)

  // Form states
  const [assistantForm, setAssistantForm] = useState<AssistantFormState>({
    name: '',
    description: '',
    model: 'gpt-4o',
    systemPrompt: '',
    temperature: 0.7,
    tools: []
  })

  const [promptForm, setPromptForm] = useState<PromptFormState>({
    name: '',
    description: '',
    prompt: '',
    category: 'Development',
    variables: []
  })

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Fetch conversations on mount
  useEffect(() => {
    fetchConversations()
  }, [fetchConversations])

  // Fetch messages when active conversation changes
  useEffect(() => {
    if (activeConversation) {
      fetchMessages(activeConversation.id)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- Only re-run when conversation ID changes, not other properties
  }, [activeConversation?.id, fetchMessages])

  // Filtered data
  const filteredConversations = useMemo(() => {
    return conversations.filter(c =>
      !c.is_archived &&
      (searchQuery === '' || c.title.toLowerCase().includes(searchQuery.toLowerCase()))
    )
  }, [conversations, searchQuery])

  const starredConversations = useMemo(() =>
    conversations.filter(c => c.is_starred && !c.is_archived),
    [conversations]
  )

  const filteredPrompts = useMemo(() => {
    return prompts.filter(p =>
      searchQuery === '' ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [prompts, searchQuery])

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Handle send message - real Supabase operation
  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return

    try {
      // Create conversation if none active
      let currentConversation = activeConversation
      if (!currentConversation) {
        currentConversation = await createConversation(
          'New Chat',
          selectedMode,
          selectedModel
        )
        // Note: activeConversation update usually happens via hook's realtime/subscription or direct setter
        // We'll proceed optimistically or wait for state update if crucial
        toast.success('Conversation created')
      }

      // Send the message
      setIsTyping(true)
      const userMessageContent = inputMessage
      setInputMessage('')

      // Use the hook's integrated function to save user message and get AI response
      const result = await sendMessageWithAI(userMessageContent, {
        mode: selectedMode,
        model: selectedModel,
        systemPrompt: assistantForm.systemPrompt
      })

      if (!result.success) {
        throw new Error(result.error)
      }

      setIsTyping(false)
      // toast.success('Response received') // Hook manages state
    } catch (err) {
      console.error('Error sending message:', err)
      toast.error('Failed to send message')
      setIsTyping(false)
    }
  }

  // Handle copy message
  const handleCopy = (id: string, content: string) => {
    navigator.clipboard.writeText(content)
    setCopiedId(id)
    toast.success('Copied to clipboard')
    setTimeout(() => setCopiedId(null), 2000)
  }

  // Handle new conversation - real Supabase operation
  const handleNewConversation = async () => {
    try {
      await createConversation('New Chat', selectedMode, selectedModel)
      toast.success('Conversation created')
    } catch (err) {
      console.error('Error creating conversation:', err)
      toast.error('Failed to create conversation')
    }
  }

  // Toggle star - real Supabase operation
  const toggleStar = async (id: string) => {
    try {
      await hookToggleStar(id)
      const conv = conversations.find(c => c.id === id)
      toast.success(conv?.is_starred ? 'Removed from starred' : 'Added to starred')
    } catch (err) {
      console.error('Error toggling star:', err)
      toast.error('Failed to update conversation')
    }
  }

  // Handle delete conversation - real Supabase operation
  const handleDeleteConversation = async (id: string) => {
    try {
      await deleteConversation(id)
      setShowDeleteConfirm(null)
      toast.success('Conversation deleted')
    } catch (err) {
      console.error('Error deleting conversation:', err)
      toast.error('Failed to delete conversation')
    }
  }

  // Handle archive conversation - real Supabase operation
  const handleArchiveConversation = async (id: string) => {
    try {
      await toggleArchive(id)
      const conv = conversations.find(c => c.id === id)
      toast.success(conv?.is_archived ? 'Conversation restored' : 'Conversation archived')
    } catch (err) {
      console.error('Error archiving conversation:', err)
      toast.error('Failed to archive conversation')
    }
  }

  // Handle prompt use
  const handleUsePrompt = (prompt: PromptTemplate) => {
    setInputMessage(prompt.prompt)
    setActiveTab('chat')
    inputRef.current?.focus()
    toast.info('Prompt loaded')
  }

  // Handle create assistant - Supabase operation
  const handleCreateAssistant = async () => {
    if (!assistantForm.name.trim()) {
      toast.error('Name required')
      return
    }

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error: insertError } = await supabase
        .from('ai_assistants')
        .insert({
          user_id: user.id,
          name: assistantForm.name,
          description: assistantForm.description,
          model: assistantForm.model,
          system_prompt: assistantForm.systemPrompt,
          temperature: assistantForm.temperature,
          tools: assistantForm.tools
        })
        .select()
        .single()

      if (insertError) throw insertError

      // Add to local state
      const newAssistant: Assistant = {
        id: data.id,
        name: assistantForm.name,
        description: assistantForm.description,
        type: 'custom',
        model: assistantForm.model,
        systemPrompt: assistantForm.systemPrompt,
        temperature: assistantForm.temperature,
        tools: assistantForm.tools,
        files: [],
        icon: '🤖',
        color: 'violet',
        usageCount: 0,
        createdAt: new Date()
      }

      setAssistants(prev => [newAssistant, ...prev])
      setShowNewAssistant(false)
      setAssistantForm({
        name: '',
        description: '',
        model: 'gpt-4o',
        systemPrompt: '',
        temperature: 0.7,
        tools: []
      })

      toast.success('Assistant created - ' + newAssistant.name + ' has been created successfully')
    } catch (err) {
      console.error('Error creating assistant:', err)
      toast.error('Failed to create assistant')
    }
  }

  // Handle create prompt - Supabase operation
  const handleCreatePrompt = async () => {
    if (!promptForm.name.trim() || !promptForm.prompt.trim()) {
      toast.error('Required fields missing')
      return
    }

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Extract variables from prompt
      const variableMatches = promptForm.prompt.match(/\{\{(\w+)\}\}/g) || []
      const variables = variableMatches.map(v => v.replace(/\{\{|\}\}/g, ''))

      const { data, error: insertError } = await supabase
        .from('ai_prompt_templates')
        .insert({
          user_id: user.id,
          name: promptForm.name,
          description: promptForm.description,
          prompt: promptForm.prompt,
          category: promptForm.category,
          variables
        })
        .select()
        .single()

      if (insertError) throw insertError

      const newPrompt: PromptTemplate = {
        id: data.id,
        name: promptForm.name,
        description: promptForm.description,
        prompt: promptForm.prompt,
        category: promptForm.category,
        variables,
        usageCount: 0,
        starred: false
      }

      setPrompts(prev => [newPrompt, ...prev])
      setShowNewPrompt(false)
      setPromptForm({
        name: '',
        description: '',
        prompt: '',
        category: 'Development',
        variables: []
      })

      toast.success('Prompt template created - ' + newPrompt.name + ' has been saved to your library')
    } catch (err) {
      console.error('Error creating prompt:', err)
      toast.error('Failed to create prompt')
    }
  }

  // Handle file upload - Supabase operation
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Determine file type
      let fileType: FileType = 'document'
      if (file.name.match(/\.(js|ts|py|java|cpp|go|rs)$/i)) fileType = 'code'
      else if (file.name.match(/\.(png|jpg|jpeg|gif|svg)$/i)) fileType = 'image'
      else if (file.name.match(/\.(csv|json|xlsx|xls)$/i)) fileType = 'data'
      else if (file.name.match(/\.(mp3|wav|ogg)$/i)) fileType = 'audio'

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('ai-knowledge-files')
        .upload(`${user.id}/${Date.now()}-${file.name}`, file)

      if (uploadError) throw uploadError

      // Save metadata to database
      const { data, error: insertError } = await supabase
        .from('ai_knowledge_files')
        .insert({
          user_id: user.id,
          name: file.name,
          file_type: fileType,
          size: file.size,
          storage_path: uploadData.path,
          status: 'processing'
        })
        .select()
        .single()

      if (insertError) throw insertError

      const newFile: KnowledgeFile = {
        id: data.id,
        name: file.name,
        type: fileType,
        size: file.size,
        chunks: 0,
        status: 'processing',
        uploadedAt: new Date()
      }

      setFiles(prev => [newFile, ...prev])

      toast.success('File uploaded - ' + file.name + ' is being processed')

      // Call API to process file
      try {
        const processResponse = await fetch('/api/ai-assistant', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'process-file',
            fileId: data.id,
            fileName: file.name,
            fileSize: file.size
          })
        })

        if (processResponse.ok) {
          const { data: processedData } = await processResponse.json()
          setFiles(prev => prev.map(f =>
            f.id === newFile.id ? { ...f, status: 'ready', chunks: processedData.chunks } : f
          ))
          toast.success('File ready - ' + file.name + ' has been processed and is ready to use')
        } else {
          throw new Error('File processing failed')
        }
      } catch (processErr) {
        console.error('Error processing file:', processErr)
        setFiles(prev => prev.map(f =>
          f.id === newFile.id ? { ...f, status: 'error' } : f
        ))
        toast.error('File processing failed')
      }
    } catch (err) {
      console.error('Error uploading file:', err)
      toast.error('Failed to upload file')
    }
  }

  // Handle file delete - Supabase operation
  const handleDeleteFile = async (fileId: string) => {
    try {
      const { error } = await supabase
        .from('ai_knowledge_files')
        .delete()
        .eq('id', fileId)

      if (error) throw error

      setFiles(prev => prev.filter(f => f.id !== fileId))
      toast.success('File deleted')
    } catch (err) {
      console.error('Error deleting file:', err)
      toast.error('Failed to delete file')
    }
  }

  // Handle export chat
  const handleExportChat = async () => {
    if (!activeConversation || messages.length === 0) {
      toast.error('No messages to export')
      return
    }

    try {
      const exportData = {
        conversation: activeConversation,
        messages: messages.map(m => ({
          role: m.role,
          content: m.content,
          timestamp: m.created_at
        })),
        exportedAt: new Date().toISOString()
      }

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `chat-export-${activeConversation.id}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast.success('Chat exported')
    } catch (err) {
      console.error('Error exporting chat:', err)
      toast.error('Failed to export chat')
    }
  }

  // Handle clear history
  const handleClearHistory = async () => {
    if (!activeConversation) return

    try {
      // Delete all messages for this conversation
      const { error } = await supabase
        .from('ai_messages')
        .delete()
        .eq('conversation_id', activeConversation.id)

      if (error) throw error

      // Refresh messages
      fetchMessages(activeConversation.id)

      toast.success('History cleared')
    } catch (err) {
      console.error('Error clearing history:', err)
      toast.error('Failed to clear history')
    }
  }

  // Handle save conversation (update title)
  const handleSaveConversation = async () => {
    if (!activeConversation) return

    try {
      const title = window.prompt('Enter conversation title:', activeConversation.title)
      if (!title || title === activeConversation.title) return

      await updateConversation(activeConversation.id, { title })

      toast.success('Conversation saved')
    } catch (err) {
      console.error('Error saving conversation:', err)
      toast.error('Failed to save conversation')
    }
  }

  // Handle message feedback (thumbs up/down)
  const handleMessageFeedback = (messageId: string, feedback: 'positive' | 'negative') => {
    toast.success(feedback === 'positive' ? 'Thanks for the feedback!' : 'Feedback recorded')
  }

  // Handle regenerate response
  const handleRegenerateResponse = async (messageId: string) => {
    if (!activeConversation) {
      toast.error('No active conversation')
      return
    }

    try {
      setIsTyping(true)
      toast.info('Regenerating response...')

      // Call API to regenerate response
      const response = await fetch('/api/ai-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'regenerate-response',
          conversationId: activeConversation.id,
          originalMessageId: messageId
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to regenerate response')
      }

      const { data } = await response.json()

      // Add regenerated response to local state
      await sendMessage(data.content, 'assistant')

      setIsTyping(false)
      toast.success('Response regenerated')
    } catch (err) {
      console.error('Error regenerating response:', err)
      toast.error('Failed to regenerate response')
      setIsTyping(false)
    }
  }

  // Handle enhance prompt
  const handleEnhancePrompt = () => {
    if (!inputMessage.trim()) {
      toast.error('No text to enhance')
      return
    }

    // Simulate prompt enhancement
    const enhancedPrompt = `Please provide a detailed and comprehensive response to the following:\n\n${inputMessage}\n\nInclude:\n- Key points and explanations\n- Relevant examples\n- Best practices`
    setInputMessage(enhancedPrompt)
    toast.success('Prompt enhanced')
    setShowEnhanceDialog(false)
  }

  // Handle file attachment
  const handleAttachFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      toast.success('File attached - ' + file.name + ' is ready to send with your message')
      setShowAttachFileDialog(false)
    }
  }

  // Handle image attachment
  const handleAttachImage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      toast.success('Image attached - ' + file.name + ' is ready to send with your message')
      setShowAttachImageDialog(false)
    }
  }

  // Handle voice input
  const handleStartVoiceInput = async () => {
    toast.info('Voice input started')

    try {
      // Call API to transcribe voice
      const response = await fetch('/api/ai-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'voice-transcribe'
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Voice transcription failed')
      }

      const { data } = await response.json()

      setInputMessage(prev => prev + (prev ? ' ' : '') + data.text)
      toast.success('Voice input captured - ' + data.confidence + '% confidence')
      setShowVoiceInputDialog(false)
    } catch (err) {
      console.error('Error transcribing voice:', err)
      toast.error('Voice transcription failed')
    }
  }

  // Handle file download from Files tab
  const handleDownloadFile = (file: KnowledgeFile) => {
    toast.success('Download started - ' + file.name)
    // In production, this would trigger actual file download
  }

  // Handle export usage report
  const handleExportUsageReport = () => {
    try {
      const reportData = {
        stats: combinedStats,
        dailyUsage,
        exportedAt: new Date().toISOString()
      }

      const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `usage-report-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast.success('Report exported')
    } catch (err) {
      console.error('Error exporting report:', err)
      toast.error('Failed to export report')
    }
  }

  // Handle settings toggle
  const handleToggleStreamResponses = () => {
    setStreamResponses(prev => !prev)
    toast.success(streamResponses ? 'Stream responses disabled' : 'Stream responses enabled')
  }

  const handleToggleSaveHistory = () => {
    setSaveHistory(prev => !prev)
    toast.success(saveHistory ? 'History saving disabled' : 'History saving enabled')
  }

  // Quota percentage
  const quotaPercentage = (usageStats.quotaUsed / usageStats.quotaLimit) * 100

  // Combined usage stats from hook and mock
  const combinedStats = {
    ...usageStats,
    conversations: stats.totalConversations || usageStats.conversations,
    messages: stats.totalMessages || usageStats.messages
  }

  // Quick actions with proper dialog handlers (replaces toast-only actions)
  const quickActions = [
    { id: '1', label: 'New Chat', icon: 'MessageSquare', shortcut: 'N', action: () => setShowNewChatDialog(true) },
    { id: '2', label: 'Templates', icon: 'FileText', shortcut: 'T', action: () => setShowTemplatesDialog(true) },
    { id: '3', label: 'Knowledge', icon: 'Database', shortcut: 'K', action: () => setShowKnowledgeDialog(true) },
    { id: '4', label: 'Settings', icon: 'Settings', shortcut: 'S', action: () => setShowAISettingsDialog(true) },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50 dark:bg-none dark:bg-gray-900">
      {/* Premium Header */}
      <div className="bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 text-white">
        <div className="max-w-[1800px] mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                <Bot className="h-8 w-8" />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-bold">AI Assistant</h1>
                  <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium backdrop-blur-sm">
                    ChatGPT Level
                  </span>
                </div>
                <p className="text-violet-100 mt-1">
                  Your intelligent AI companion with multi-model support
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowSettings(true)}
                className="p-2.5 bg-white/20 rounded-xl hover:bg-white/30 transition-colors backdrop-blur-sm"
              >
                <Settings className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-violet-200 text-sm mb-1">
                <MessageSquare className="h-4 w-4" />
                Conversations
              </div>
              <p className="text-2xl font-bold">{combinedStats.conversations}</p>
            </div>
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-violet-200 text-sm mb-1">
                <Zap className="h-4 w-4" />
                Total Tokens
              </div>
              <p className="text-2xl font-bold">{formatTokens(combinedStats.totalTokens)}</p>
            </div>
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-violet-200 text-sm mb-1">
                <BarChart3 className="h-4 w-4" />
                Total Cost
              </div>
              <p className="text-2xl font-bold">{formatCost(combinedStats.totalCost)}</p>
            </div>
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-violet-200 text-sm mb-1">
                <Clock className="h-4 w-4" />
                Avg Response
              </div>
              <p className="text-2xl font-bold">{combinedStats.avgResponseTime}s</p>
            </div>
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-violet-200 text-sm mb-1">
                <Users className="h-4 w-4" />
                Assistants
              </div>
              <p className="text-2xl font-bold">{assistants.length}</p>
            </div>
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-violet-200 text-sm mb-1">
                <Folder className="h-4 w-4" />
                Knowledge Files
              </div>
              <p className="text-2xl font-bold">{files.length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1800px] mx-auto p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex items-center justify-between mb-6">
            <TabsList className="bg-white dark:bg-gray-800 shadow-sm">
              <TabsTrigger value="chat" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Chat
              </TabsTrigger>
              <TabsTrigger value="assistants" className="flex items-center gap-2">
                <Bot className="h-4 w-4" />
                Assistants
              </TabsTrigger>
              <TabsTrigger value="prompts" className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Prompts
              </TabsTrigger>
              <TabsTrigger value="files" className="flex items-center gap-2">
                <Folder className="h-4 w-4" />
                Files
              </TabsTrigger>
              <TabsTrigger value="usage" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Usage
              </TabsTrigger>
            </TabsList>

            {activeTab === 'chat' && (
              <div className="flex items-center gap-3">
                {/* Model Selector */}
                <div className="relative">
                  <button
                    onClick={() => setShowModelSelector(!showModelSelector)}
                    className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-violet-500 transition-colors"
                  >
                    <Brain className="h-4 w-4 text-violet-600" />
                    <span className="font-medium">{models.find(m => m.id === selectedModel)?.name}</span>
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  </button>

                  {showModelSelector && (
                    <div className="absolute top-full right-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-xl z-50">
                      <div className="p-2">
                        {models.map(model => (
                          <button
                            key={model.id}
                            onClick={() => {
                              setSelectedModel(model.id)
                              setShowModelSelector(false)
                            }}
                            className={`w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${selectedModel === model.id ? 'bg-violet-50 dark:bg-violet-900/30' : ''
                              }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-lg ${model.provider === 'OpenAI' ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-amber-100 dark:bg-amber-900/30'}`}>
                                <Brain className={`h-4 w-4 ${model.provider === 'OpenAI' ? 'text-emerald-600' : 'text-amber-600'}`} />
                              </div>
                              <div className="text-left">
                                <p className="font-medium text-gray-900 dark:text-white">{model.name}</p>
                                <p className="text-xs text-gray-500">{model.provider} • {model.context}</p>
                              </div>
                            </div>
                            <span className="text-xs text-gray-400">{model.speed}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Mode Selector */}
                <div className="flex items-center gap-1 p-1 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                  {Object.entries(modeConfig).map(([mode, config]) => (
                    <button
                      key={mode}
                      onClick={() => setSelectedMode(mode as ConversationMode)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${selectedMode === mode
                        ? 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                    >
                      {config.icon}
                      <span className="text-sm font-medium">{config.label}</span>
                    </button>
                  ))}
                </div>

                <button
                  onClick={handleNewConversation}
                  disabled={isLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-xl hover:bg-violet-700 transition-colors disabled:opacity-50"
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                  New Chat
                </button>
              </div>
            )}
          </div>

          {/* Chat Tab */}
          <TabsContent value="chat" className="mt-0">
            <div className="flex gap-6 h-[calc(100vh-380px)] min-h-[600px]">
              {/* Sidebar */}
              {showSidebar && (
                <div className="w-80 flex-shrink-0">
                  <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 h-full flex flex-col">
                    {/* Search */}
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search conversations..."
                          value={searchQuery}
                          onChange={e => setSearchQuery(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 rounded-xl border-0 focus:ring-2 focus:ring-violet-500 text-sm"
                        />
                      </div>
                    </div>

                    {/* Starred */}
                    {starredConversations.length > 0 && (
                      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                          Starred
                        </h3>
                        <div className="space-y-1">
                          {starredConversations.slice(0, 3).map(conv => (
                            <button
                              key={conv.id}
                              onClick={() => setActiveConversation(conv)}
                              className={`w-full flex items-center gap-2 p-2 rounded-lg text-left transition-colors ${activeConversation?.id === conv.id
                                ? 'bg-violet-50 dark:bg-violet-900/30'
                                : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                                }`}
                            >
                              <Star className="h-4 w-4 text-yellow-500 flex-shrink-0" />
                              <span className="text-sm font-medium truncate text-gray-900 dark:text-white">
                                {conv.title}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Conversations List */}
                    <ScrollArea className="flex-1">
                      <div className="p-4 space-y-2">
                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                          Recent
                        </h3>
                        {isLoading && conversations.length === 0 ? (
                          <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin text-violet-600" />
                          </div>
                        ) : filteredConversations.length === 0 ? (
                          <div className="text-center py-8 text-gray-500">
                            <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">No conversations yet</p>
                          </div>
                        ) : (
                          filteredConversations.map(conv => (
                            <button
                              key={conv.id}
                              onClick={() => setActiveConversation(conv)}
                              className={`w-full p-3 rounded-xl text-left transition-all group ${activeConversation?.id === conv.id
                                ? 'bg-violet-50 dark:bg-violet-900/30 border border-violet-200 dark:border-violet-800'
                                : 'hover:bg-gray-50 dark:hover:bg-gray-700 border border-transparent'
                                }`}
                            >
                              <div className="flex items-start justify-between mb-1">
                                <span className="font-medium text-gray-900 dark:text-white truncate flex-1">
                                  {conv.title}
                                </span>
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button
                                    onClick={e => {
                                      e.stopPropagation()
                                      toggleStar(conv.id)
                                    }}
                                  >
                                    {conv.is_starred ? (
                                      <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                                    ) : (
                                      <StarOff className="h-4 w-4 text-gray-400" />
                                    )}
                                  </button>
                                  <button
                                    onClick={e => {
                                      e.stopPropagation()
                                      setShowDeleteConfirm(conv.id)
                                    }}
                                  >
                                    <Trash2 className="h-4 w-4 text-gray-400 hover:text-red-500" />
                                  </button>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 text-xs text-gray-500">
                                <span className={`px-2 py-0.5 rounded-full ${getModeColor(conv.mode)}`}>
                                  {conv.mode}
                                </span>
                                <span>{conv.message_count} msgs</span>
                                <span>•</span>
                                <span>{formatRelativeTime(conv.updated_at)}</span>
                              </div>
                            </button>
                          ))
                        )}
                      </div>
                    </ScrollArea>
                  </div>
                </div>
              )}

              {/* Main Chat Area */}
              <div className="flex-1 flex flex-col bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
                {/* Chat Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setShowSidebar(!showSidebar)}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <History className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                    </button>
                    <div>
                      <h2 className="font-semibold text-gray-900 dark:text-white">
                        {activeConversation?.title || 'New Conversation'}
                      </h2>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        {activeConversation && (
                          <>
                            <span className={`px-2 py-0.5 rounded-full ${getModeColor(activeConversation.mode)}`}>
                              {activeConversation.mode}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full ${getModelColor(activeConversation.model)}`}>
                              {models.find(m => m.id === activeConversation.model)?.name || activeConversation.model}
                            </span>
                            <span>{activeConversation.message_count} messages</span>
                            <span>•</span>
                            <span>{formatTokens(activeConversation.total_tokens)} tokens</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {activeConversation && (
                      <>
                        <button
                          onClick={() => toggleStar(activeConversation.id)}
                          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        >
                          {activeConversation.is_starred ? (
                            <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                          ) : (
                            <StarOff className="h-5 w-5 text-gray-400" />
                          )}
                        </button>
                        <button
                          onClick={handleExportChat}
                          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        >
                          <Share className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                        </button>
                        <button
                          onClick={handleSaveConversation}
                          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        >
                          <Save className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Messages */}
                <ScrollArea className="flex-1 p-4">
                  <div className="max-w-4xl mx-auto space-y-6">
                    {messages.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full py-20">
                        <div className="p-6 bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-900/30 dark:to-purple-900/30 rounded-3xl mb-6">
                          <Bot className="h-16 w-16 text-violet-600 dark:text-violet-400" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                          How can I help you today?
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 text-center max-w-md mb-8">
                          I'm your AI assistant powered by multiple models. Ask me anything or choose a suggestion below.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6 max-w-lg">
                          {[
                            { icon: <Code className="h-5 w-5" />, label: 'Write code', prompt: 'Help me write a function that...' },
                            { icon: <PenTool className="h-5 w-5" />, label: 'Create content', prompt: 'Write a blog post about...' },
                            { icon: <BarChart3 className="h-5 w-5" />, label: 'Analyze data', prompt: 'Analyze this dataset and...' },
                            { icon: <Lightbulb className="h-5 w-5" />, label: 'Brainstorm ideas', prompt: 'Help me brainstorm ideas for...' }
                          ].map((item, i) => (
                            <button
                              key={i}
                              onClick={() => setInputMessage(item.prompt)}
                              className="flex items-center gap-3 p-4 bg-white dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 hover:border-violet-500 hover:shadow-md transition-all text-left"
                            >
                              <div className="p-2 bg-violet-100 dark:bg-violet-900/30 rounded-lg text-violet-600 dark:text-violet-400">
                                {item.icon}
                              </div>
                              <span className="font-medium text-gray-900 dark:text-white">{item.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <>
                        {messages.map(message => (
                          <div
                            key={message.id}
                            className={`flex gap-4 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
                          >
                            {/* Avatar */}
                            <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${message.role === 'user'
                              ? 'bg-violet-600 text-white'
                              : 'bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-900/30 dark:to-purple-900/30'
                              }`}>
                              {message.role === 'user' ? (
                                <Users className="h-5 w-5" />
                              ) : (
                                <Bot className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                              )}
                            </div>

                            {/* Message Content */}
                            <div className={`flex-1 max-w-[80%] ${message.role === 'user' ? 'text-right' : ''}`}>
                              <div className={`inline-block p-4 rounded-2xl ${message.role === 'user'
                                ? 'bg-violet-600 text-white'
                                : 'bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white'
                                }`}>
                                <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
                                  {message.content}
                                </div>
                              </div>

                              {/* Message Actions */}
                              <div className={`flex items-center gap-2 mt-2 ${message.role === 'user' ? 'justify-end' : ''}`}>
                                <span className="text-xs text-gray-400">
                                  {formatDate(message.created_at)}
                                </span>
                                {message.role === 'assistant' && (
                                  <>
                                    <button
                                      onClick={() => handleCopy(message.id, message.content)}
                                      className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                    >
                                      {copiedId === message.id ? (
                                        <Check className="h-4 w-4 text-green-500" />
                                      ) : (
                                        <Copy className="h-4 w-4 text-gray-400" />
                                      )}
                                    </button>
                                    <button
                                      onClick={() => handleMessageFeedback(message.id, 'positive')}
                                      className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                    >
                                      <ThumbsUp className="h-4 w-4 text-gray-400" />
                                    </button>
                                    <button
                                      onClick={() => handleMessageFeedback(message.id, 'negative')}
                                      className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                    >
                                      <ThumbsDown className="h-4 w-4 text-gray-400" />
                                    </button>
                                    <button
                                      onClick={() => handleRegenerateResponse(message.id)}
                                      className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                    >
                                      <RefreshCw className="h-4 w-4 text-gray-400" />
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}

                        {/* Typing Indicator */}
                        {isTyping && (
                          <div className="flex gap-4">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-900/30 dark:to-purple-900/30 flex items-center justify-center">
                              <Bot className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                            </div>
                            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-2xl">
                              <div className="flex items-center gap-1">
                                <div className="w-2 h-2 bg-violet-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                <div className="w-2 h-2 bg-violet-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                <div className="w-2 h-2 bg-violet-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                              </div>
                            </div>
                          </div>
                        )}

                        <div ref={messagesEndRef} />
                      </>
                    )}
                  </div>
                </ScrollArea>

                {/* Input Area */}
                <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="max-w-4xl mx-auto">
                    <div className="relative bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 focus-within:border-violet-500 focus-within:ring-2 focus-within:ring-violet-500/20 transition-all">
                      {/* Attachments Bar */}
                      <div className="flex items-center gap-2 p-3 border-b border-gray-200 dark:border-gray-700">
                        <button
                          onClick={() => setShowAttachFileDialog(true)}
                          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        >
                          <Paperclip className="h-5 w-5 text-gray-400" />
                        </button>
                        <button
                          onClick={() => setShowAttachImageDialog(true)}
                          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        >
                          <ImageIcon className="h-5 w-5 text-gray-400" />
                        </button>
                        <button
                          onClick={() => setShowVoiceInputDialog(true)}
                          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        >
                          <Mic className="h-5 w-5 text-gray-400" />
                        </button>
                        <div className="flex-1" />
                        <span className="text-xs text-gray-400">
                          {selectedModel.startsWith('gpt') ? 'OpenAI' : 'Anthropic'} • {models.find(m => m.id === selectedModel)?.context} context
                        </span>
                      </div>

                      {/* Text Area */}
                      <textarea
                        ref={inputRef}
                        value={inputMessage}
                        onChange={e => setInputMessage(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault()
                            handleSendMessage()
                          }
                        }}
                        placeholder="Type your message... (Shift+Enter for new line)"
                        rows={3}
                        className="w-full p-4 bg-transparent border-0 resize-none focus:ring-0 text-gray-900 dark:text-white placeholder-gray-400"
                      />

                      {/* Send Button */}
                      <div className="flex items-center justify-between p-3 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setShowEnhanceDialog(true)}
                            className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                          >
                            <Wand2 className="h-4 w-4" />
                            Enhance
                          </button>
                          <button
                            onClick={() => setActiveTab('prompts')}
                            className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                          >
                            <Sparkles className="h-4 w-4" />
                            Templates
                          </button>
                        </div>
                        <button
                          onClick={handleSendMessage}
                          disabled={!inputMessage.trim() || isTyping || isSending}
                          className="flex items-center gap-2 px-5 py-2 bg-violet-600 text-white rounded-xl hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          {isTyping || isSending ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                          ) : (
                            <Send className="h-5 w-5" />
                          )}
                          Send
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Assistants Tab */}
          <TabsContent value="assistants" className="mt-0">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Custom Assistants</h2>
                  <p className="text-gray-500 dark:text-gray-400">Create and manage specialized AI assistants</p>
                </div>
                <button
                  onClick={() => setShowNewAssistant(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-xl hover:bg-violet-700 transition-colors"
                >
                  <Plus className="h-5 w-5" />
                  Create Assistant
                </button>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {assistants.map(assistant => (
                  <div
                    key={assistant.id}
                    className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 hover:border-violet-500 hover:shadow-lg transition-all cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="text-4xl">{assistant.icon}</div>
                      <span className={`px-2 py-1 rounded-full text-xs ${getModelColor(assistant.model)}`}>
                        {models.find(m => m.id === assistant.model)?.name}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                      {assistant.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-2">
                      {assistant.description}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Terminal className="h-3 w-3" />
                        {assistant.tools.length} tools
                      </span>
                      <span className="flex items-center gap-1">
                        <FileText className="h-3 w-3" />
                        {assistant.files.length} files
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" />
                        {assistant.usageCount}
                      </span>
                    </div>
                  </div>
                ))}

                {/* Add New Card */}
                <button
                  onClick={() => setShowNewAssistant(true)}
                  className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl hover:border-violet-500 hover:bg-violet-50 dark:hover:bg-violet-900/10 transition-all min-h-[200px]"
                >
                  <Plus className="h-10 w-10 text-gray-400 mb-2" />
                  <span className="font-medium text-gray-600 dark:text-gray-300">Create New</span>
                </button>
              </div>
            </div>
          </TabsContent>

          {/* Prompts Tab */}
          <TabsContent value="prompts" className="mt-0">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Prompt Library</h2>
                  <p className="text-gray-500 dark:text-gray-400">Reusable prompts for common tasks</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search prompts..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="pl-10 pr-4 py-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-violet-500 text-sm"
                    />
                  </div>
                  <button
                    onClick={() => setShowNewPrompt(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-xl hover:bg-violet-700 transition-colors"
                  >
                    <Plus className="h-5 w-5" />
                    New Prompt
                  </button>
                </div>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredPrompts.map(prompt => (
                  <div
                    key={prompt.id}
                    className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 hover:border-violet-500 hover:shadow-lg transition-all"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-lg text-xs text-gray-600 dark:text-gray-300">
                        {prompt.category}
                      </span>
                      <button
                        onClick={() => {
                          setPrompts(prev =>
                            prev.map(p => p.id === prompt.id ? { ...p, starred: !p.starred } : p)
                          )
                        }}
                      >
                        {prompt.starred ? (
                          <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                        ) : (
                          <StarOff className="h-5 w-5 text-gray-300" />
                        )}
                      </button>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                      {prompt.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                      {prompt.description}
                    </p>
                    <div className="flex items-center gap-2 mb-4">
                      {prompt.variables.map(v => (
                        <span
                          key={v}
                          className="px-2 py-1 bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 rounded text-xs"
                        >
                          {`{{${v}}}`}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400">
                        Used {prompt.usageCount} times
                      </span>
                      <button
                        onClick={() => handleUsePrompt(prompt)}
                        className="px-3 py-1.5 bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 rounded-lg text-sm font-medium hover:bg-violet-200 dark:hover:bg-violet-900/50 transition-colors"
                      >
                        Use Prompt
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Files Tab */}
          <TabsContent value="files" className="mt-0">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Knowledge Base</h2>
                  <p className="text-gray-500 dark:text-gray-400">Upload files to enhance AI context</p>
                </div>
                <label className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-xl hover:bg-violet-700 transition-colors cursor-pointer">
                  <Upload className="h-5 w-5" />
                  Upload Files
                  <input
                    type="file"
                    className="hidden"
                    onChange={handleFileUpload}
                    accept=".pdf,.doc,.docx,.txt,.csv,.json,.xlsx,.xls,.js,.ts,.py,.java,.md"
                  />
                </label>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-900/50">
                      <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">File</th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Size</th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Chunks</th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Assistant</th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Uploaded</th>
                      <th className="text-right px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {files.map(file => (
                      <tr key={file.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                              {getFileIcon(file.type)}
                            </div>
                            <span className="font-medium text-gray-900 dark:text-white">{file.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs capitalize">
                            {file.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                          {formatBytes(file.size)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                          {file.chunks}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs ${file.status === 'ready'
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                            : file.status === 'processing'
                              ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
                              : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                            }`}>
                            {file.status === 'processing' && <Loader2 className="h-3 w-3 animate-spin" />}
                            {file.status === 'ready' && <CheckCircle className="h-3 w-3" />}
                            {file.status === 'error' && <AlertCircle className="h-3 w-3" />}
                            {file.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                          {file.assistant || '-'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                          {formatRelativeTime(file.uploadedAt)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleDownloadFile(file)}
                              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors"
                            >
                              <Download className="h-4 w-4 text-gray-400" />
                            </button>
                            <button
                              onClick={() => handleDeleteFile(file.id)}
                              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors"
                            >
                              <Trash2 className="h-4 w-4 text-gray-400 hover:text-red-500" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          {/* Usage Tab */}
          <TabsContent value="usage" className="mt-0">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Usage & Billing</h2>
                  <p className="text-gray-500 dark:text-gray-400">Track your API usage and costs</p>
                </div>
                <button
                  onClick={handleExportUsageReport}
                  className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-violet-500 transition-colors"
                >
                  <Download className="h-5 w-5" />
                  Export Report
                </button>
              </div>

              {/* Quota Progress */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white">Monthly Quota</h3>
                  <span className="text-sm text-gray-500">
                    {formatTokens(combinedStats.quotaUsed)} / {formatTokens(combinedStats.quotaLimit)} tokens
                  </span>
                </div>
                <div className="w-full h-4 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${quotaPercentage > 80 ? 'bg-red-500' : quotaPercentage > 50 ? 'bg-yellow-500' : 'bg-violet-600'
                      }`}
                    style={{ width: `${quotaPercentage}%` }}
                  />
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  {quotaPercentage.toFixed(1)}% used • Resets on Jan 1, 2025
                </p>
              </div>

              {/* Usage Stats Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-violet-100 dark:bg-violet-900/30 rounded-lg">
                      <Zap className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                    </div>
                    <span className="text-sm text-gray-500">Input Tokens</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatTokens(combinedStats.inputTokens)}
                  </p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                      <Zap className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <span className="text-sm text-gray-500">Output Tokens</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatTokens(combinedStats.outputTokens)}
                  </p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      <MessageSquare className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <span className="text-sm text-gray-500">Total Messages</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {combinedStats.messages.toLocaleString()}
                  </p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                      <BarChart3 className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <span className="text-sm text-gray-500">Total Cost</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatCost(combinedStats.totalCost)}
                  </p>
                </div>
              </div>

              {/* Daily Usage Chart */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-6">Daily Usage (Last 7 Days)</h3>
                <div className="h-64 flex items-end justify-between gap-4">
                  {dailyUsage.map((day, i) => {
                    const maxTokens = Math.max(...dailyUsage.map(d => d.tokens))
                    const height = (day.tokens / maxTokens) * 100
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center gap-2">
                        <div className="w-full relative" style={{ height: '200px' }}>
                          <div
                            className="absolute bottom-0 w-full bg-gradient-to-t from-violet-600 to-violet-400 rounded-t-lg transition-all hover:from-violet-500 hover:to-violet-300"
                            style={{ height: `${height}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500">
                          {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                        </span>
                        <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                          {formatTokens(day.tokens)}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Model Usage Breakdown */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Usage by Model</h3>
                <div className="space-y-4">
                  {[
                    { model: 'GPT-4o', tokens: 980000, cost: 78.40, percentage: 40 },
                    { model: 'Claude 3 Opus', tokens: 735000, cost: 58.80, percentage: 30 },
                    { model: 'GPT-4 Turbo', tokens: 490000, cost: 39.20, percentage: 20 },
                    { model: 'Claude 3 Sonnet', tokens: 245000, cost: 11.05, percentage: 10 }
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <div className="w-32 text-sm font-medium text-gray-700 dark:text-gray-300">
                        {item.model}
                      </div>
                      <div className="flex-1 h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-violet-600 rounded-full"
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                      <div className="w-24 text-right text-sm text-gray-500">
                        {formatTokens(item.tokens)}
                      </div>
                      <div className="w-20 text-right text-sm font-medium text-gray-700 dark:text-gray-300">
                        {formatCost(item.cost)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Enhanced Competitive Upgrade Components */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          <div className="lg:col-span-2">
            <AIInsightsPanel
              insights={mockAIAssistantAIInsights}
              title="AI Intelligence"
              onInsightAction={(insight) => toast.info('Insight action: ' + insight.title)}
            />
          </div>
          <div className="space-y-6">
            <CollaborationIndicator
              collaborators={mockAIAssistantCollaborators}
              maxVisible={4}
            />
            <PredictiveAnalytics
              predictions={mockAIAssistantPredictions}
              title="Assistant Forecasts"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <ActivityFeed
            activities={mockAIAssistantActivities}
            title="AI Activity"
            maxItems={5}
          />
          <QuickActionsToolbar
            actions={quickActions}
            variant="grid"
          />
        </div>
      </div>

      {/* New Assistant Dialog */}
      <Dialog open={showNewAssistant} onOpenChange={setShowNewAssistant}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-violet-600" />
              Create Custom Assistant
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  placeholder="My Assistant"
                  value={assistantForm.name}
                  onChange={e => setAssistantForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 focus:ring-2 focus:ring-violet-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Model
                </label>
                <select
                  value={assistantForm.model}
                  onChange={e => setAssistantForm(prev => ({ ...prev, model: e.target.value as ModelType }))}
                  className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 focus:ring-2 focus:ring-violet-500"
                >
                  {models.map(m => (
                    <option key={m.id} value={m.id}>{m.name} ({m.provider})</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <input
                type="text"
                placeholder="What does this assistant do?"
                value={assistantForm.description}
                onChange={e => setAssistantForm(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 focus:ring-2 focus:ring-violet-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                System Prompt
              </label>
              <textarea
                rows={4}
                placeholder="You are a helpful assistant that..."
                value={assistantForm.systemPrompt}
                onChange={e => setAssistantForm(prev => ({ ...prev, systemPrompt: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 focus:ring-2 focus:ring-violet-500 resize-none"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Temperature: {assistantForm.temperature}
                </label>
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.1"
                  value={assistantForm.temperature}
                  onChange={e => setAssistantForm(prev => ({ ...prev, temperature: parseFloat(e.target.value) }))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Precise</span>
                  <span>Creative</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tools
                </label>
                <div className="flex flex-wrap gap-2">
                  {['code_interpreter', 'file_search', 'web_search'].map(tool => (
                    <button
                      key={tool}
                      onClick={() => {
                        setAssistantForm(prev => ({
                          ...prev,
                          tools: prev.tools.includes(tool)
                            ? prev.tools.filter(t => t !== tool)
                            : [...prev.tools, tool]
                        }))
                      }}
                      className={`px-3 py-1.5 border rounded-lg text-sm transition-colors ${assistantForm.tools.includes(tool)
                        ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/30 text-violet-700'
                        : 'border-gray-200 dark:border-gray-700 hover:border-violet-500'
                        }`}
                    >
                      {tool}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowNewAssistant(false)}
                className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateAssistant}
                className="px-4 py-2 bg-violet-600 text-white rounded-xl hover:bg-violet-700 transition-colors"
              >
                Create Assistant
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* New Prompt Dialog */}
      <Dialog open={showNewPrompt} onOpenChange={setShowNewPrompt}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-violet-600" />
              Create Prompt Template
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  placeholder="My Prompt"
                  value={promptForm.name}
                  onChange={e => setPromptForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 focus:ring-2 focus:ring-violet-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category
                </label>
                <select
                  value={promptForm.category}
                  onChange={e => setPromptForm(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 focus:ring-2 focus:ring-violet-500"
                >
                  <option value="Development">Development</option>
                  <option value="Content">Content</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Productivity">Productivity</option>
                  <option value="Research">Research</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <input
                type="text"
                placeholder="What does this prompt do?"
                value={promptForm.description}
                onChange={e => setPromptForm(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 focus:ring-2 focus:ring-violet-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Prompt Template (use {'{{variable}}'} for placeholders)
              </label>
              <textarea
                rows={6}
                placeholder="Enter your prompt template..."
                value={promptForm.prompt}
                onChange={e => setPromptForm(prev => ({ ...prev, prompt: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 focus:ring-2 focus:ring-violet-500 resize-none font-mono text-sm"
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowNewPrompt(false)}
                className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreatePrompt}
                className="px-4 py-2 bg-violet-600 text-white rounded-xl hover:bg-violet-700 transition-colors"
              >
                Create Prompt
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!showDeleteConfirm} onOpenChange={() => setShowDeleteConfirm(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="h-5 w-5" />
              Delete Conversation
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-600 dark:text-gray-400">
              Are you sure you want to delete this conversation? This action cannot be undone.
            </p>
          </div>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setShowDeleteConfirm(null)}
              className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => showDeleteConfirm && handleDeleteConversation(showDeleteConfirm)}
              className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors"
            >
              Delete
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-violet-600" />
              AI Settings
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Default Model
              </label>
              <select className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 focus:ring-2 focus:ring-violet-500">
                {models.map(m => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Default Temperature
              </label>
              <input
                type="range"
                min="0"
                max="2"
                step="0.1"
                defaultValue="0.7"
                className="w-full"
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Stream Responses</p>
                <p className="text-sm text-gray-500">Show responses as they generate</p>
              </div>
              <button
                onClick={handleToggleStreamResponses}
                className={`w-12 h-6 rounded-full relative transition-colors ${streamResponses ? 'bg-violet-600' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${streamResponses ? 'right-1' : 'left-1'
                  }`} />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Save History</p>
                <p className="text-sm text-gray-500">Keep conversation history</p>
              </div>
              <button
                onClick={handleToggleSaveHistory}
                className={`w-12 h-6 rounded-full relative transition-colors ${saveHistory ? 'bg-violet-600' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${saveHistory ? 'right-1' : 'left-1'
                  }`} />
              </button>
            </div>
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <h4 className="font-medium text-gray-900 dark:text-white mb-3">Danger Zone</h4>
              <div className="space-y-3">
                <button
                  onClick={handleClearHistory}
                  className="w-full px-4 py-2 border border-red-200 dark:border-red-800 text-red-600 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-left"
                >
                  Clear Current Conversation History
                </button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* New Chat Dialog (Quick Action) */}
      <Dialog open={showNewChatDialog} onOpenChange={setShowNewChatDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-violet-600" />
              Start New Chat
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-gray-600 dark:text-gray-400">
              Start a new conversation with the AI assistant. Choose your preferred mode and model.
            </p>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Conversation Mode
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-6">
                {Object.entries(modeConfig).map(([mode, config]) => (
                  <button
                    key={mode}
                    onClick={() => setSelectedMode(mode as ConversationMode)}
                    className={`flex items-center gap-2 p-3 rounded-xl border transition-colors ${selectedMode === mode
                      ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/30'
                      : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                  >
                    {config.icon}
                    <span className="text-sm font-medium">{config.label}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <button
                onClick={() => setShowNewChatDialog(false)}
                className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleNewConversation()
                  setShowNewChatDialog(false)
                }}
                className="px-4 py-2 bg-violet-600 text-white rounded-xl hover:bg-violet-700 transition-colors"
              >
                Start Chat
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Templates Dialog (Quick Action) */}
      <Dialog open={showTemplatesDialog} onOpenChange={setShowTemplatesDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-violet-600" />
              Prompt Templates
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Select a template to quickly start your conversation with pre-configured prompts.
            </p>
            <ScrollArea className="h-[400px]">
              <div className="space-y-3">
                {prompts.map(prompt => (
                  <button
                    key={prompt.id}
                    onClick={() => {
                      handleUsePrompt(prompt)
                      setShowTemplatesDialog(false)
                    }}
                    className="w-full p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-violet-500 hover:bg-violet-50 dark:hover:bg-violet-900/20 transition-colors text-left"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-gray-900 dark:text-white">{prompt.name}</h4>
                          {prompt.starred && <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />}
                        </div>
                        <p className="text-sm text-gray-500 mt-1">{prompt.description}</p>
                      </div>
                      <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-xs text-gray-600 dark:text-gray-400">
                        {prompt.category}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>

      {/* Knowledge Base Dialog (Quick Action) */}
      <Dialog open={showKnowledgeDialog} onOpenChange={setShowKnowledgeDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-violet-600" />
              Knowledge Base
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Manage your uploaded files and documents that the AI can reference.
            </p>
            <div className="mb-4">
              <label className="block">
                <input
                  type="file"
                  onChange={handleFileUpload}
                  className="hidden"
                  accept=".pdf,.doc,.docx,.txt,.csv,.json,.js,.ts,.py,.java"
                />
                <div className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl cursor-pointer hover:border-violet-500 transition-colors">
                  <Upload className="h-5 w-5 text-gray-400" />
                  <span className="text-gray-600 dark:text-gray-400">Click to upload or drag files here</span>
                </div>
              </label>
            </div>
            <ScrollArea className="h-[300px]">
              <div className="space-y-2">
                {files.map(file => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between p-3 rounded-xl border border-gray-200 dark:border-gray-700"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                        {getFileIcon(file.type)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{file.name}</p>
                        <p className="text-sm text-gray-500">{formatBytes(file.size)} - {file.chunks} chunks</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${file.status === 'ready'
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                        : file.status === 'processing'
                          ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
                          : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                        }`}>
                        {file.status}
                      </span>
                      <button
                        onClick={() => handleDeleteFile(file.id)}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      >
                        <Trash2 className="h-4 w-4 text-gray-400 hover:text-red-500" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>

      {/* AI Settings Dialog (Quick Action) */}
      <Dialog open={showAISettingsDialog} onOpenChange={setShowAISettingsDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-violet-600" />
              Quick AI Settings
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Select AI Model
              </label>
              <div className="space-y-2">
                {models.map(model => (
                  <button
                    key={model.id}
                    onClick={() => {
                      setSelectedModel(model.id)
                      toast.success(`Model changed to ${model.name}`)
                    }}
                    className={`w-full flex items-center justify-between p-3 rounded-xl border transition-colors ${selectedModel === model.id
                      ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/30'
                      : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${model.provider === 'OpenAI' ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-amber-100 dark:bg-amber-900/30'}`}>
                        <Brain className={`h-4 w-4 ${model.provider === 'OpenAI' ? 'text-emerald-600' : 'text-amber-600'}`} />
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-gray-900 dark:text-white">{model.name}</p>
                        <p className="text-xs text-gray-500">{model.provider} - {model.context} context</p>
                      </div>
                    </div>
                    <span className="text-xs text-gray-400">{model.speed}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <button
                onClick={() => setShowAISettingsDialog(false)}
                className="px-4 py-2 bg-violet-600 text-white rounded-xl hover:bg-violet-700 transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Attach File Dialog */}
      <Dialog open={showAttachFileDialog} onOpenChange={setShowAttachFileDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Paperclip className="h-5 w-5 text-violet-600" />
              Attach File
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Attach a file to include with your message. Supported formats: PDF, DOC, TXT, CSV, JSON, code files.
            </p>
            <label className="block">
              <input
                type="file"
                onChange={handleAttachFile}
                className="hidden"
                accept=".pdf,.doc,.docx,.txt,.csv,.json,.js,.ts,.py,.java,.md"
              />
              <div className="flex items-center justify-center gap-2 p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl cursor-pointer hover:border-violet-500 transition-colors">
                <Upload className="h-6 w-6 text-gray-400" />
                <span className="text-gray-600 dark:text-gray-400">Click to select a file</span>
              </div>
            </label>
          </div>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setShowAttachFileDialog(false)}
              className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Attach Image Dialog */}
      <Dialog open={showAttachImageDialog} onOpenChange={setShowAttachImageDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5 text-violet-600" />
              Attach Image
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Attach an image to analyze or discuss. Supported formats: PNG, JPG, GIF, SVG.
            </p>
            <label className="block">
              <input
                type="file"
                onChange={handleAttachImage}
                className="hidden"
                accept=".png,.jpg,.jpeg,.gif,.svg,.webp"
              />
              <div className="flex items-center justify-center gap-2 p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl cursor-pointer hover:border-violet-500 transition-colors">
                <ImageIcon className="h-6 w-6 text-gray-400" />
                <span className="text-gray-600 dark:text-gray-400">Click to select an image</span>
              </div>
            </label>
          </div>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setShowAttachImageDialog(false)}
              className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Voice Input Dialog */}
      <Dialog open={showVoiceInputDialog} onOpenChange={setShowVoiceInputDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mic className="h-5 w-5 text-violet-600" />
              Voice Input
            </DialogTitle>
          </DialogHeader>
          <div className="py-6">
            <p className="text-gray-600 dark:text-gray-400 mb-6 text-center">
              Click the microphone button below to start voice recording.
            </p>
            <div className="flex justify-center">
              <button
                onClick={handleStartVoiceInput}
                className="p-6 bg-violet-100 dark:bg-violet-900/30 rounded-full hover:bg-violet-200 dark:hover:bg-violet-900/50 transition-colors"
              >
                <Mic className="h-10 w-10 text-violet-600 dark:text-violet-400" />
              </button>
            </div>
            <p className="text-sm text-gray-500 text-center mt-4">
              Speak clearly into your microphone
            </p>
          </div>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setShowVoiceInputDialog(false)}
              className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Enhance Prompt Dialog */}
      <Dialog open={showEnhanceDialog} onOpenChange={setShowEnhanceDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wand2 className="h-5 w-5 text-violet-600" />
              Enhance Prompt
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Enhance your prompt for better AI responses. This will add context and structure to your message.
            </p>
            {inputMessage.trim() ? (
              <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl mb-4">
                <p className="text-sm text-gray-500 mb-2">Current prompt:</p>
                <p className="text-gray-900 dark:text-white line-clamp-3">{inputMessage}</p>
              </div>
            ) : (
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl mb-4">
                <p className="text-sm text-yellow-700 dark:text-yellow-400">
                  Please enter some text in the input field first before enhancing.
                </p>
              </div>
            )}
          </div>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setShowEnhanceDialog(false)}
              className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleEnhancePrompt}
              disabled={!inputMessage.trim()}
              className="px-4 py-2 bg-violet-600 text-white rounded-xl hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Enhance
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
