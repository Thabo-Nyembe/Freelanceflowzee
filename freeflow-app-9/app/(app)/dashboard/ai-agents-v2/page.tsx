'use client';

export const dynamic = 'force-dynamic';

/**
 * AI Agents Builder - FreeFlow A+++ Implementation
 *
 * Create custom AI agents with:
 * - Visual agent builder (no-code)
 * - Custom system prompts
 * - Tool/capability configuration
 * - Knowledge base integration
 * - Workflow automation
 * - Agent marketplace
 *
 * Competitors: Custom GPTs (OpenAI), Claude Projects, Notion AI
 */

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import {
  Bot, Plus, Settings, Play, Pause, Trash2, Copy, Edit2, Save,
  Sparkles, Brain, Wand2, Code, FileText, Database, Zap,
  MessageSquare, Search, Filter, MoreVertical, ChevronRight,
  BookOpen, Globe, Lock, Users, Star, TrendingUp, Clock,
  CheckCircle, AlertCircle, Loader2, Download, Upload, Share2,
  Wrench, Puzzle, BarChart3, Terminal, Mic, Eye, ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { LiquidGlassCard } from '@/components/ui/liquid-glass-card';
import { TextShimmer } from '@/components/ui/text-shimmer';
import { toast } from 'sonner';
import { createFeatureLogger } from '@/lib/logger';
import type { AgentRole } from '@/lib/ai/agent-orchestrator';

const logger = createFeatureLogger('AIAgents-Page');

// Types
interface CustomAgent {
  id: string;
  name: string;
  description: string;
  avatar?: string;
  role: AgentRole;
  systemPrompt: string;
  capabilities: AgentCapability[];
  tools: string[];
  knowledgeBases: string[];
  settings: AgentSettings;
  status: 'draft' | 'active' | 'paused' | 'error';
  isPublic: boolean;
  usageCount: number;
  rating: number;
  createdAt: string;
  updatedAt: string;
}

interface AgentCapability {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
}

interface AgentSettings {
  model: string;
  temperature: number;
  maxTokens: number;
  topP: number;
  frequencyPenalty: number;
  presencePenalty: number;
  responseFormat: 'text' | 'json' | 'markdown';
}

interface AgentTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  role: AgentRole;
  systemPrompt: string;
  capabilities: string[];
  category: string;
  popularity: number;
}

// Default capabilities
const DEFAULT_CAPABILITIES: AgentCapability[] = [
  { id: 'web-search', name: 'Web Search', description: 'Search the internet for information', enabled: false },
  { id: 'code-execution', name: 'Code Execution', description: 'Execute code in a sandbox', enabled: false },
  { id: 'file-analysis', name: 'File Analysis', description: 'Analyze uploaded files', enabled: true },
  { id: 'image-generation', name: 'Image Generation', description: 'Generate images with DALL-E', enabled: false },
  { id: 'voice-interaction', name: 'Voice Interaction', description: 'Speak and listen to users', enabled: false },
  { id: 'data-visualization', name: 'Data Visualization', description: 'Create charts and graphs', enabled: false },
  { id: 'email-integration', name: 'Email Integration', description: 'Send and receive emails', enabled: false },
  { id: 'calendar-access', name: 'Calendar Access', description: 'Manage calendar events', enabled: false },
];

// Available tools
const AVAILABLE_TOOLS = [
  { id: 'calculator', name: 'Calculator', icon: '🧮', description: 'Perform mathematical calculations' },
  { id: 'translator', name: 'Translator', icon: '🌐', description: 'Translate between languages' },
  { id: 'summarizer', name: 'Summarizer', icon: '📝', description: 'Summarize long content' },
  { id: 'code-analyzer', name: 'Code Analyzer', icon: '🔍', description: 'Analyze and review code' },
  { id: 'database-query', name: 'Database Query', icon: '💾', description: 'Query connected databases' },
  { id: 'api-caller', name: 'API Caller', icon: '🔗', description: 'Make HTTP requests' },
  { id: 'file-processor', name: 'File Processor', icon: '📁', description: 'Process various file formats' },
  { id: 'scheduler', name: 'Scheduler', icon: '📅', description: 'Schedule tasks and reminders' },
];

// Agent templates
const AGENT_TEMPLATES: AgentTemplate[] = [
  {
    id: 'research-assistant',
    name: 'Research Assistant',
    description: 'Expert at finding, analyzing, and synthesizing information',
    icon: '🔬',
    role: 'researcher',
    systemPrompt: 'You are a research assistant. Help users find accurate information, verify facts, and synthesize complex topics into clear summaries.',
    capabilities: ['web-search', 'file-analysis', 'data-visualization'],
    category: 'Productivity',
    popularity: 95,
  },
  {
    id: 'code-helper',
    name: 'Code Helper',
    description: 'Programming assistant for debugging and development',
    icon: '💻',
    role: 'coder',
    systemPrompt: 'You are an expert programmer. Help users write, debug, and optimize code across multiple languages. Explain concepts clearly.',
    capabilities: ['code-execution', 'file-analysis'],
    category: 'Development',
    popularity: 98,
  },
  {
    id: 'writing-coach',
    name: 'Writing Coach',
    description: 'Improve writing with feedback and suggestions',
    icon: '✍️',
    role: 'reviewer',
    systemPrompt: 'You are a writing coach. Help users improve their writing with constructive feedback, grammar corrections, and style suggestions.',
    capabilities: ['file-analysis'],
    category: 'Creative',
    popularity: 87,
  },
  {
    id: 'data-analyst',
    name: 'Data Analyst',
    description: 'Analyze data and create visualizations',
    icon: '📊',
    role: 'analyst',
    systemPrompt: 'You are a data analyst. Help users understand their data, perform statistical analysis, and create meaningful visualizations.',
    capabilities: ['file-analysis', 'code-execution', 'data-visualization'],
    category: 'Analytics',
    popularity: 92,
  },
  {
    id: 'project-planner',
    name: 'Project Planner',
    description: 'Plan and organize complex projects',
    icon: '📋',
    role: 'planner',
    systemPrompt: 'You are a project planner. Help users break down complex projects into manageable tasks, create timelines, and track progress.',
    capabilities: ['calendar-access', 'file-analysis'],
    category: 'Productivity',
    popularity: 85,
  },
  {
    id: 'creative-writer',
    name: 'Creative Writer',
    description: 'Generate creative content and stories',
    icon: '🎭',
    role: 'executor',
    systemPrompt: 'You are a creative writer. Help users craft engaging stories, poems, scripts, and other creative content with vivid imagination.',
    capabilities: ['image-generation'],
    category: 'Creative',
    popularity: 89,
  },
];

// Default agent settings
const DEFAULT_SETTINGS: AgentSettings = {
  model: 'gpt-4o',
  temperature: 0.7,
  maxTokens: 4096,
  topP: 1,
  frequencyPenalty: 0,
  presencePenalty: 0,
  responseFormat: 'markdown',
};

export default function AIAgentsPage() {
  // State
  const [agents, setAgents] = useState<CustomAgent[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<CustomAgent | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('my-agents');
  const [searchQuery, setSearchQuery] = useState('');
  const [showTestDialog, setShowTestDialog] = useState(false);
  const [testMessage, setTestMessage] = useState('');
  const [testResponse, setTestResponse] = useState('');
  const [isTesting, setIsTesting] = useState(false);

  // Form state for creating/editing
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    role: 'custom' as AgentRole,
    systemPrompt: '',
    capabilities: DEFAULT_CAPABILITIES,
    tools: [] as string[],
    knowledgeBases: [] as string[],
    settings: DEFAULT_SETTINGS,
    isPublic: false,
  });

  // Load agents
  useEffect(() => {
    // In a real app, fetch from API
    const mockAgents: CustomAgent[] = [
      {
        id: 'agent-1',
        name: 'My Research Bot',
        description: 'Helps with research and fact-checking',
        role: 'researcher',
        systemPrompt: 'You are a helpful research assistant.',
        capabilities: DEFAULT_CAPABILITIES.map(c => ({ ...c, enabled: c.id === 'web-search' || c.id === 'file-analysis' })),
        tools: ['summarizer', 'translator'],
        knowledgeBases: [],
        settings: DEFAULT_SETTINGS,
        status: 'active',
        isPublic: false,
        usageCount: 156,
        rating: 4.5,
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
    setAgents(mockAgents);
  }, []);

  // Create agent from template
  const createFromTemplate = (template: AgentTemplate) => {
    setFormData({
      name: template.name,
      description: template.description,
      role: template.role,
      systemPrompt: template.systemPrompt,
      capabilities: DEFAULT_CAPABILITIES.map(c => ({
        ...c,
        enabled: template.capabilities.includes(c.id),
      })),
      tools: [],
      knowledgeBases: [],
      settings: DEFAULT_SETTINGS,
      isPublic: false,
    });
    setIsCreating(true);
    toast.success(`Starting with "${template.name}" template`);
    logger.info('Creating agent from template', { templateId: template.id });
  };

  // Save agent
  const saveAgent = async () => {
    if (!formData.name.trim()) {
      toast.error('Agent name is required');
      return;
    }

    setIsSaving(true);
    try {
      const newAgent: CustomAgent = {
        id: isEditing && selectedAgent ? selectedAgent.id : `agent-${Date.now()}`,
        ...formData,
        status: 'draft',
        usageCount: isEditing && selectedAgent ? selectedAgent.usageCount : 0,
        rating: isEditing && selectedAgent ? selectedAgent.rating : 0,
        createdAt: isEditing && selectedAgent ? selectedAgent.createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      if (isEditing) {
        setAgents(prev => prev.map(a => a.id === newAgent.id ? newAgent : a));
        toast.success('Agent updated successfully');
      } else {
        setAgents(prev => [newAgent, ...prev]);
        toast.success('Agent created successfully');
      }

      logger.info('Agent saved', { agentId: newAgent.id, name: newAgent.name });
      setIsCreating(false);
      setIsEditing(false);
      setSelectedAgent(null);
      resetForm();
    } catch (error) {
      toast.error('Failed to save agent');
      logger.error('Save agent error', { error });
    } finally {
      setIsSaving(false);
    }
  };

  // Delete agent
  const deleteAgent = (agentId: string) => {
    setAgents(prev => prev.filter(a => a.id !== agentId));
    if (selectedAgent?.id === agentId) {
      setSelectedAgent(null);
    }
    toast.success('Agent deleted');
    logger.info('Agent deleted', { agentId });
  };

  // Toggle agent status
  const toggleAgentStatus = (agent: CustomAgent) => {
    const newStatus = agent.status === 'active' ? 'paused' : 'active';
    setAgents(prev => prev.map(a => a.id === agent.id ? { ...a, status: newStatus } : a));
    toast.success(`Agent ${newStatus === 'active' ? 'activated' : 'paused'}`);
    logger.info('Agent status toggled', { agentId: agent.id, newStatus });
  };

  // Test agent
  const testAgent = async () => {
    if (!testMessage.trim() || !selectedAgent) return;

    setIsTesting(true);
    setTestResponse('');

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      setTestResponse(`[${selectedAgent.name}]: Based on my analysis, here's what I found...\n\nThis is a simulated response demonstrating how your agent would respond to the query: "${testMessage}"\n\nThe agent uses the following capabilities:\n${selectedAgent.capabilities.filter(c => c.enabled).map(c => `- ${c.name}`).join('\n')}`);

      logger.info('Agent test completed', { agentId: selectedAgent.id, query: testMessage });
    } catch (error) {
      toast.error('Test failed');
      logger.error('Agent test error', { error });
    } finally {
      setIsTesting(false);
    }
  };

  // Edit agent
  const editAgent = (agent: CustomAgent) => {
    setSelectedAgent(agent);
    setFormData({
      name: agent.name,
      description: agent.description,
      role: agent.role,
      systemPrompt: agent.systemPrompt,
      capabilities: agent.capabilities,
      tools: agent.tools,
      knowledgeBases: agent.knowledgeBases,
      settings: agent.settings,
      isPublic: agent.isPublic,
    });
    setIsEditing(true);
    setIsCreating(true);
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      role: 'custom',
      systemPrompt: '',
      capabilities: DEFAULT_CAPABILITIES,
      tools: [],
      knowledgeBases: [],
      settings: DEFAULT_SETTINGS,
      isPublic: false,
    });
  };

  // Filter agents
  const filteredAgents = agents.filter(agent =>
    agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    agent.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get status color
  const getStatusColor = (status: CustomAgent['status']) => {
    switch (status) {
      case 'active': return 'text-green-500 bg-green-500/10';
      case 'paused': return 'text-yellow-500 bg-yellow-500/10';
      case 'draft': return 'text-gray-500 bg-gray-500/10';
      case 'error': return 'text-red-500 bg-red-500/10';
      default: return 'text-gray-500 bg-gray-500/10';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <TextShimmer className="text-3xl font-bold">
              AI Agents Studio
            </TextShimmer>
            <p className="text-muted-foreground mt-1">
              Build, customize, and deploy your own AI agents
            </p>
          </div>

          <Button onClick={() => { resetForm(); setIsCreating(true); setIsEditing(false); }}>
            <Plus className="w-4 h-4 mr-2" />
            Create Agent
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <LiquidGlassCard className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Bot className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{agents.length}</p>
                <p className="text-sm text-muted-foreground">Total Agents</p>
              </div>
            </div>
          </LiquidGlassCard>

          <LiquidGlassCard className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <CheckCircle className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{agents.filter(a => a.status === 'active').length}</p>
                <p className="text-sm text-muted-foreground">Active</p>
              </div>
            </div>
          </LiquidGlassCard>

          <LiquidGlassCard className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <Zap className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{agents.reduce((sum, a) => sum + a.usageCount, 0)}</p>
                <p className="text-sm text-muted-foreground">Total Uses</p>
              </div>
            </div>
          </LiquidGlassCard>

          <LiquidGlassCard className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-500/10">
                <Star className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {agents.length > 0 ? (agents.reduce((sum, a) => sum + a.rating, 0) / agents.length).toFixed(1) : '0'}
                </p>
                <p className="text-sm text-muted-foreground">Avg Rating</p>
              </div>
            </div>
          </LiquidGlassCard>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="my-agents" className="flex items-center gap-2">
              <Bot className="w-4 h-4" />
              My Agents
            </TabsTrigger>
            <TabsTrigger value="templates" className="flex items-center gap-2">
              <Puzzle className="w-4 h-4" />
              Templates
            </TabsTrigger>
            <TabsTrigger value="marketplace" className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              Marketplace
            </TabsTrigger>
          </TabsList>

          {/* My Agents Tab */}
          <TabsContent value="my-agents" className="space-y-4">
            {/* Search */}
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search agents..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Agent Cards */}
            {filteredAgents.length === 0 ? (
              <Card className="p-12 text-center">
                <Bot className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-medium mb-2">No agents yet</h3>
                <p className="text-muted-foreground mb-4">Create your first AI agent to get started</p>
                <Button onClick={() => { resetForm(); setIsCreating(true); }}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Agent
                </Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredAgents.map((agent) => (
                  <Card key={agent.id} className="relative overflow-hidden hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                            <Bot className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{agent.name}</CardTitle>
                            <Badge variant="outline" className={getStatusColor(agent.status)}>
                              {agent.status}
                            </Badge>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => editAgent(agent)}>
                              <Edit2 className="w-4 h-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => { setSelectedAgent(agent); setShowTestDialog(true); }}>
                              <Play className="w-4 h-4 mr-2" />
                              Test
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => toggleAgentStatus(agent)}>
                              {agent.status === 'active' ? (
                                <>
                                  <Pause className="w-4 h-4 mr-2" />
                                  Pause
                                </>
                              ) : (
                                <>
                                  <Play className="w-4 h-4 mr-2" />
                                  Activate
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => deleteAgent(agent.id)} className="text-red-600">
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {agent.description}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Zap className="w-4 h-4" />
                          {agent.usageCount} uses
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500" />
                          {agent.rating.toFixed(1)}
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="pt-0">
                      <div className="flex gap-2 w-full">
                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={() => { setSelectedAgent(agent); setShowTestDialog(true); }}
                        >
                          <MessageSquare className="w-4 h-4 mr-2" />
                          Chat
                        </Button>
                        <Button className="flex-1" onClick={() => editAgent(agent)}>
                          <Settings className="w-4 h-4 mr-2" />
                          Configure
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Templates Tab */}
          <TabsContent value="templates" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {AGENT_TEMPLATES.map((template) => (
                <Card key={template.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center text-2xl">
                        {template.icon}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{template.name}</CardTitle>
                        <Badge variant="secondary">{template.category}</Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      {template.description}
                    </p>
                    <div className="flex items-center gap-2 flex-wrap mb-4">
                      {template.capabilities.slice(0, 3).map((cap) => (
                        <Badge key={cap} variant="outline" className="text-xs">
                          {cap.replace('-', ' ')}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <TrendingUp className="w-4 h-4 text-green-500" />
                        {template.popularity}% popularity
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full" onClick={() => createFromTemplate(template)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Use Template
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Marketplace Tab */}
          <TabsContent value="marketplace" className="space-y-4">
            <Card className="p-12 text-center">
              <Globe className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-medium mb-2">Agent Marketplace</h3>
              <p className="text-muted-foreground mb-4">
                Browse and install agents created by the community
              </p>
              <Badge variant="secondary">Coming Soon</Badge>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Create/Edit Agent Dialog */}
        <Dialog open={isCreating} onOpenChange={(open) => { setIsCreating(open); if (!open) { setIsEditing(false); resetForm(); } }}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{isEditing ? 'Edit Agent' : 'Create New Agent'}</DialogTitle>
              <DialogDescription>
                Configure your AI agent&apos;s behavior, capabilities, and settings
              </DialogDescription>
            </DialogHeader>

            <Tabs defaultValue="basics" className="mt-4">
              <TabsList className="grid grid-cols-4 w-full">
                <TabsTrigger value="basics">Basics</TabsTrigger>
                <TabsTrigger value="capabilities">Capabilities</TabsTrigger>
                <TabsTrigger value="tools">Tools</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>

              {/* Basics Tab */}
              <TabsContent value="basics" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Agent Name *</Label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="My Custom Agent"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Role</Label>
                    <Select
                      value={formData.role}
                      onValueChange={(value) => setFormData({ ...formData, role: value as AgentRole })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="planner">Planner</SelectItem>
                        <SelectItem value="executor">Executor</SelectItem>
                        <SelectItem value="reviewer">Reviewer</SelectItem>
                        <SelectItem value="researcher">Researcher</SelectItem>
                        <SelectItem value="coder">Coder</SelectItem>
                        <SelectItem value="analyst">Analyst</SelectItem>
                        <SelectItem value="custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe what your agent does..."
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label>System Prompt *</Label>
                  <Textarea
                    value={formData.systemPrompt}
                    onChange={(e) => setFormData({ ...formData, systemPrompt: e.target.value })}
                    placeholder="You are a helpful assistant that..."
                    rows={6}
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    Define your agent&apos;s personality, expertise, and behavior guidelines
                  </p>
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div>
                    <Label>Public Agent</Label>
                    <p className="text-xs text-muted-foreground">
                      Allow others to discover and use this agent
                    </p>
                  </div>
                  <Switch
                    checked={formData.isPublic}
                    onCheckedChange={(checked) => setFormData({ ...formData, isPublic: checked })}
                  />
                </div>
              </TabsContent>

              {/* Capabilities Tab */}
              <TabsContent value="capabilities" className="space-y-4 mt-4">
                <p className="text-sm text-muted-foreground">
                  Enable or disable specific capabilities for your agent
                </p>
                <div className="grid gap-3">
                  {formData.capabilities.map((cap, index) => (
                    <div key={cap.id} className="flex items-center justify-between p-4 rounded-lg border">
                      <div className="flex items-center gap-3">
                        <Wrench className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{cap.name}</p>
                          <p className="text-xs text-muted-foreground">{cap.description}</p>
                        </div>
                      </div>
                      <Switch
                        checked={cap.enabled}
                        onCheckedChange={(checked) => {
                          const newCaps = [...formData.capabilities];
                          newCaps[index] = { ...cap, enabled: checked };
                          setFormData({ ...formData, capabilities: newCaps });
                        }}
                      />
                    </div>
                  ))}
                </div>
              </TabsContent>

              {/* Tools Tab */}
              <TabsContent value="tools" className="space-y-4 mt-4">
                <p className="text-sm text-muted-foreground">
                  Select tools your agent can use to complete tasks
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {AVAILABLE_TOOLS.map((tool) => {
                    const isSelected = formData.tools.includes(tool.id);
                    return (
                      <div
                        key={tool.id}
                        onClick={() => {
                          setFormData({
                            ...formData,
                            tools: isSelected
                              ? formData.tools.filter(t => t !== tool.id)
                              : [...formData.tools, tool.id]
                          });
                        }}
                        className={`
                          p-4 rounded-lg border cursor-pointer transition-all
                          ${isSelected ? 'border-blue-500 bg-blue-50 dark:bg-blue-950' : 'hover:border-gray-400'}
                        `}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{tool.icon}</span>
                          <div>
                            <p className="font-medium">{tool.name}</p>
                            <p className="text-xs text-muted-foreground">{tool.description}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </TabsContent>

              {/* Settings Tab */}
              <TabsContent value="settings" className="space-y-6 mt-4">
                <div className="space-y-2">
                  <Label>Model</Label>
                  <Select
                    value={formData.settings.model}
                    onValueChange={(value) => setFormData({
                      ...formData,
                      settings: { ...formData.settings, model: value }
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gpt-4o">GPT-4o (Recommended)</SelectItem>
                      <SelectItem value="gpt-4o-mini">GPT-4o Mini (Faster)</SelectItem>
                      <SelectItem value="claude-3-5-sonnet">Claude 3.5 Sonnet</SelectItem>
                      <SelectItem value="claude-3-opus">Claude 3 Opus</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Temperature: {formData.settings.temperature}</Label>
                    <span className="text-xs text-muted-foreground">Controls randomness</span>
                  </div>
                  <Slider
                    value={[formData.settings.temperature]}
                    onValueChange={([value]) => setFormData({
                      ...formData,
                      settings: { ...formData.settings, temperature: value }
                    })}
                    min={0}
                    max={2}
                    step={0.1}
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Max Tokens: {formData.settings.maxTokens}</Label>
                    <span className="text-xs text-muted-foreground">Maximum response length</span>
                  </div>
                  <Slider
                    value={[formData.settings.maxTokens]}
                    onValueChange={([value]) => setFormData({
                      ...formData,
                      settings: { ...formData.settings, maxTokens: value }
                    })}
                    min={256}
                    max={16384}
                    step={256}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Response Format</Label>
                  <Select
                    value={formData.settings.responseFormat}
                    onValueChange={(value) => setFormData({
                      ...formData,
                      settings: { ...formData.settings, responseFormat: value as 'text' | 'json' | 'markdown' }
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="markdown">Markdown</SelectItem>
                      <SelectItem value="text">Plain Text</SelectItem>
                      <SelectItem value="json">JSON</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </TabsContent>
            </Tabs>

            <DialogFooter className="mt-6">
              <Button variant="outline" onClick={() => setIsCreating(false)}>
                Cancel
              </Button>
              <Button onClick={saveAgent} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    {isEditing ? 'Update Agent' : 'Create Agent'}
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Test Agent Dialog */}
        <Dialog open={showTestDialog} onOpenChange={setShowTestDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Test Agent: {selectedAgent?.name}</DialogTitle>
              <DialogDescription>
                Send a message to test your agent&apos;s response
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Your Message</Label>
                <Textarea
                  value={testMessage}
                  onChange={(e) => setTestMessage(e.target.value)}
                  placeholder="Type a message to test your agent..."
                  rows={3}
                />
              </div>

              {testResponse && (
                <div className="space-y-2">
                  <Label>Agent Response</Label>
                  <div className="p-4 rounded-lg bg-muted whitespace-pre-wrap text-sm">
                    {testResponse}
                  </div>
                </div>
              )}
            </div>

            <DialogFooter className="mt-4">
              <Button variant="outline" onClick={() => { setShowTestDialog(false); setTestMessage(''); setTestResponse(''); }}>
                Close
              </Button>
              <Button onClick={testAgent} disabled={isTesting || !testMessage.trim()}>
                {isTesting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Testing...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Send Message
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
