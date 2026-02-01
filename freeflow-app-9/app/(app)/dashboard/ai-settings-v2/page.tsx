'use client';

/**
 * Organization AI Settings Dashboard - FreeFlow A+++ Implementation
 * Enterprise-wide AI configuration and knowledge management
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain,
  Settings,
  BookOpen,
  Users,
  Shield,
  Sparkles,
  Save,
  RefreshCw,
  Plus,
  Trash2,
  ChevronRight,
  Link2,
  Database,
  FileText,
  Globe,
  Zap,
  MessageSquare,
  Code,
  FileCode,
  Languages,
  BarChart3,
  PieChart,
  Activity,
  Target,
  Lock,
  Unlock,
  Edit3,
  HelpCircle,
  Building,
  Sliders,
  Wand2,
  TestTube,
} from 'lucide-react';
import { toast } from 'sonner';
import { useOrganizationContext } from '@/lib/hooks/use-organization-context';
import type {
  OrganizationContext,
  AIConfiguration,
  AICapability,
} from '@/lib/ai/organization-context';

// ============================================================================
// TYPES
// ============================================================================

type TabType = 'general' | 'knowledge' | 'teams' | 'policies' | 'vocabulary' | 'analytics' | 'test';

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function AISettingsPage() {
  // Use a mock organization ID for demo - in production, get from auth context
  const mockOrgId = 'org_demo_123';

  const {
    context,
    isLoading,
    isSaving,
    isDefault,
    updateContext,
    generateOptimizedContext,
    analyzeContext,
    addKnowledgeSource,
    removeKnowledgeSource,
    addTeamContext,
    removeTeamContext,
    chatWithContext,
    fetchContext,
  } = useOrganizationContext();

  const [activeTab, setActiveTab] = useState<TabType>('general');
  const [editedContext, setEditedContext] = useState<Partial<OrganizationContext>>({});
  const [analysis, setAnalysis] = useState<{
    score: number;
    suggestions: string[];
    warnings: string[];
    optimizations: string[];
  } | null>(null);
  const [testPrompt, setTestPrompt] = useState('');
  const [testResponse, setTestResponse] = useState<string>('');
  const [isTestingAI, setIsTestingAI] = useState(false);

  // New source form
  const [newSource, setNewSource] = useState({
    name: '',
    type: 'document' as const,
    content: '',
    url: '',
    description: '',
  });

  // New team form
  const [newTeam, setNewTeam] = useState({
    teamId: '',
    teamName: '',
    inheritFromOrg: true,
    customInstructions: '',
  });

  // New vocabulary form
  const [newVocab, setNewVocab] = useState({
    term: '',
    definition: '',
    usage: '',
    category: '',
  });

  // New policy form
  const [newPolicy, setNewPolicy] = useState({
    name: '',
    description: '',
    rules: '',
    enforcement: 'warn' as const,
  });

  // Load context on mount
  useEffect(() => {
    fetchContext(mockOrgId);
  }, [fetchContext, mockOrgId]);

  // Update edited context when context changes
  useEffect(() => {
    if (context) {
      setEditedContext(context);
    }
  }, [context]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleSave = async () => {
    const success = await updateContext(editedContext);
    if (success) {
      toast.success('Settings saved');
    }
  };

  const handleAnalyze = async () => {
    const result = await analyzeContext();
    if (result) {
      setAnalysis(result);
      toast.success(`Analysis complete - Score: ${result.score}/100`);
    }
  };

  const handleGenerateContext = async () => {
    const generated = await generateOptimizedContext({
      organizationName: editedContext.name || 'Organization',
      industry: 'Technology',
      description: editedContext.description || '',
      teamSize: 50,
    });

    if (generated) {
      setEditedContext(prev => ({
        ...prev,
        ...generated,
        aiConfig: {
          ...(prev.aiConfig || {}),
          ...generated.aiConfig,
        },
      }));
      toast.success('AI-optimized context generated!');
    }
  };

  const handleAddKnowledgeSource = async () => {
    if (!newSource.name) {
      toast.error('Source name is required');
      return;
    }

    const success = await addKnowledgeSource(newSource);
    if (success) {
      setNewSource({
        name: '',
        type: 'document',
        content: '',
        url: '',
        description: '',
      });
    }
  };

  const handleAddTeam = async () => {
    if (!newTeam.teamId || !newTeam.teamName) {
      toast.error('Team ID and name are required');
      return;
    }

    const success = await addTeamContext(newTeam);
    if (success) {
      setNewTeam({
        teamId: '',
        teamName: '',
        inheritFromOrg: true,
        customInstructions: '',
      });
    }
  };

  const handleAddVocabulary = () => {
    if (!newVocab.term || !newVocab.definition) {
      toast.error('Term and definition are required');
      return;
    }

    const vocabulary = editedContext.aiConfig?.customVocabulary || [];
    setEditedContext(prev => ({
      ...prev,
      aiConfig: {
        ...prev.aiConfig,
        customVocabulary: [
          ...vocabulary,
          {
            ...newVocab,
            alternatives: [],
          },
        ],
      } as AIConfiguration,
    }));

    setNewVocab({ term: '', definition: '', usage: '', category: '' });
    toast.success('Vocabulary term added');
  };

  const handleRemoveVocabulary = (term: string) => {
    const vocabulary = editedContext.aiConfig?.customVocabulary || [];
    setEditedContext(prev => ({
      ...prev,
      aiConfig: {
        ...prev.aiConfig,
        customVocabulary: vocabulary.filter(v => v.term !== term),
      } as AIConfiguration,
    }));
    toast.success('Vocabulary term removed');
  };

  const handleAddPolicy = () => {
    if (!newPolicy.name) {
      toast.error('Policy name is required');
      return;
    }

    const policies = editedContext.aiConfig?.contentPolicies || [];
    setEditedContext(prev => ({
      ...prev,
      aiConfig: {
        ...prev.aiConfig,
        contentPolicies: [
          ...policies,
          {
            id: `policy_${Date.now()}`,
            name: newPolicy.name,
            description: newPolicy.description,
            rules: newPolicy.rules.split('\n').filter(Boolean),
            enforcement: newPolicy.enforcement,
          },
        ],
      } as AIConfiguration,
    }));

    setNewPolicy({ name: '', description: '', rules: '', enforcement: 'warn' });
    toast.success('Policy added');
  };

  const handleRemovePolicy = (id: string) => {
    const policies = editedContext.aiConfig?.contentPolicies || [];
    setEditedContext(prev => ({
      ...prev,
      aiConfig: {
        ...prev.aiConfig,
        contentPolicies: policies.filter(p => p.id !== id),
      } as AIConfiguration,
    }));
    toast.success('Policy removed');
  };

  const handleTestAI = async () => {
    if (!testPrompt.trim()) {
      toast.error('Enter a test prompt');
      return;
    }

    setIsTestingAI(true);
    setTestResponse('');

    const response = await chatWithContext(testPrompt);
    if (response) {
      setTestResponse(response.response);
    }

    setIsTestingAI(false);
  };

  const toggleCapability = (capability: AICapability) => {
    const enabled = editedContext.aiConfig?.enabledCapabilities || [];
    const disabled = editedContext.aiConfig?.disabledCapabilities || [];

    if (enabled.includes(capability)) {
      setEditedContext(prev => ({
        ...prev,
        aiConfig: {
          ...prev.aiConfig,
          enabledCapabilities: enabled.filter(c => c !== capability),
          disabledCapabilities: [...disabled, capability],
        } as AIConfiguration,
      }));
    } else {
      setEditedContext(prev => ({
        ...prev,
        aiConfig: {
          ...prev.aiConfig,
          enabledCapabilities: [...enabled, capability],
          disabledCapabilities: disabled.filter(c => c !== capability),
        } as AIConfiguration,
      }));
    }
  };

  // ============================================================================
  // RENDER TABS
  // ============================================================================

  const tabs: { id: TabType; label: string; icon: typeof Brain }[] = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'knowledge', label: 'Knowledge', icon: BookOpen },
    { id: 'teams', label: 'Teams', icon: Users },
    { id: 'policies', label: 'Policies', icon: Shield },
    { id: 'vocabulary', label: 'Vocabulary', icon: Languages },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'test', label: 'Test AI', icon: TestTube },
  ];

  const capabilities: { id: AICapability; label: string; icon: typeof Code }[] = [
    { id: 'code_generation', label: 'Code Generation', icon: Code },
    { id: 'document_analysis', label: 'Document Analysis', icon: FileText },
    { id: 'data_analysis', label: 'Data Analysis', icon: BarChart3 },
    { id: 'creative_writing', label: 'Creative Writing', icon: Edit3 },
    { id: 'translation', label: 'Translation', icon: Languages },
    { id: 'summarization', label: 'Summarization', icon: FileCode },
    { id: 'question_answering', label: 'Q&A', icon: HelpCircle },
    { id: 'task_automation', label: 'Task Automation', icon: Zap },
    { id: 'meeting_intelligence', label: 'Meeting Intelligence', icon: MessageSquare },
    { id: 'email_drafting', label: 'Email Drafting', icon: Globe },
  ];

  // ============================================================================
  // RENDER
  // ============================================================================

  if (isLoading && !context) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-purple-950 flex items-center justify-center">
        <RefreshCw className="w-8 h-8 text-purple-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-purple-950">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent flex items-center gap-3">
                <Brain className="w-8 h-8 text-purple-600" />
                Organization AI Settings
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Configure AI behavior, knowledge, and policies for your organization
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleAnalyze}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                <Activity className="w-4 h-4" />
                Analyze
              </button>
              <button
                onClick={handleGenerateContext}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-xl hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors"
              >
                <Wand2 className="w-4 h-4" />
                AI Optimize
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 transition-all shadow-lg shadow-purple-500/25"
              >
                {isSaving ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Save Changes
              </button>
            </div>
          </div>

          {/* Analysis Results */}
          {analysis && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center gap-4 mb-3">
                <div className={`text-2xl font-bold ${
                  analysis.score >= 80 ? 'text-green-600' :
                  analysis.score >= 60 ? 'text-yellow-600' :
                  'text-red-600'
                }`}>
                  {analysis.score}/100
                </div>
                <span className="text-sm text-gray-500">Context Score</span>
              </div>
              {analysis.suggestions.length > 0 && (
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-medium">Suggestions:</span> {analysis.suggestions.join(', ')}
                </div>
              )}
            </motion.div>
          )}
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === id
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/25'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {/* General Tab */}
          {activeTab === 'general' && (
            <motion.div
              key="general"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            >
              {/* Basic Info */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Building className="w-5 h-5 text-purple-600" />
                  Organization Info
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Context Name
                    </label>
                    <input
                      type="text"
                      value={editedContext.name || ''}
                      onChange={(e) => setEditedContext(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Description
                    </label>
                    <textarea
                      value={editedContext.description || ''}
                      onChange={(e) => setEditedContext(prev => ({ ...prev, description: e.target.value }))}
                      rows={3}
                      className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Custom AI Instructions
                    </label>
                    <textarea
                      value={editedContext.customInstructions || ''}
                      onChange={(e) => setEditedContext(prev => ({ ...prev, customInstructions: e.target.value }))}
                      rows={5}
                      placeholder="Add custom instructions for how the AI should behave..."
                      className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
              </div>

              {/* AI Configuration */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-purple-600" />
                  AI Configuration
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Default Model
                    </label>
                    <select
                      value={editedContext.aiConfig?.defaultModel || 'gpt-4o'}
                      onChange={(e) => setEditedContext(prev => ({
                        ...prev,
                        aiConfig: { ...prev.aiConfig, defaultModel: e.target.value } as AIConfiguration,
                      }))}
                      className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="gpt-4o">GPT-4o (Recommended)</option>
                      <option value="gpt-4o-mini">GPT-4o Mini (Faster)</option>
                      <option value="gpt-4-turbo">GPT-4 Turbo</option>
                      <option value="claude-3-opus">Claude 3 Opus</option>
                      <option value="claude-3-sonnet">Claude 3 Sonnet</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Temperature ({editedContext.aiConfig?.temperature || 0.7})
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={editedContext.aiConfig?.temperature || 0.7}
                        onChange={(e) => setEditedContext(prev => ({
                          ...prev,
                          aiConfig: { ...prev.aiConfig, temperature: parseFloat(e.target.value) } as AIConfiguration,
                        }))}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Max Tokens
                      </label>
                      <input
                        type="number"
                        value={editedContext.aiConfig?.maxTokens || 2048}
                        onChange={(e) => setEditedContext(prev => ({
                          ...prev,
                          aiConfig: { ...prev.aiConfig, maxTokens: parseInt(e.target.value) } as AIConfiguration,
                        }))}
                        className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Response Style
                    </label>
                    <select
                      value={editedContext.aiConfig?.responseStyle || 'formal'}
                      onChange={(e) => setEditedContext(prev => ({
                        ...prev,
                        aiConfig: { ...prev.aiConfig, responseStyle: e.target.value } as AIConfiguration,
                      }))}
                      className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="formal">Formal</option>
                      <option value="casual">Casual</option>
                      <option value="technical">Technical</option>
                      <option value="simple">Simple</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Tone of Voice
                    </label>
                    <input
                      type="text"
                      value={editedContext.aiConfig?.toneOfVoice || ''}
                      onChange={(e) => setEditedContext(prev => ({
                        ...prev,
                        aiConfig: { ...prev.aiConfig, toneOfVoice: e.target.value } as AIConfiguration,
                      }))}
                      placeholder="e.g., Professional and friendly"
                      className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
              </div>

              {/* Capabilities */}
              <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-purple-600" />
                  AI Capabilities
                </h3>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                  {capabilities.map(({ id, label, icon: Icon }) => {
                    const enabled = editedContext.aiConfig?.enabledCapabilities?.includes(id) ?? true;
                    return (
                      <button
                        key={id}
                        onClick={() => toggleCapability(id)}
                        className={`flex items-center gap-2 p-3 rounded-xl border transition-all ${
                          enabled
                            ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700 text-green-700 dark:text-green-300'
                            : 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-400'
                        }`}
                      >
                        {enabled ? (
                          <Unlock className="w-4 h-4" />
                        ) : (
                          <Lock className="w-4 h-4" />
                        )}
                        <span className="text-sm font-medium">{label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {/* Knowledge Tab */}
          {activeTab === 'knowledge' && (
            <motion.div
              key="knowledge"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              {/* Add Knowledge Source */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Plus className="w-5 h-5 text-purple-600" />
                  Add Knowledge Source
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Source Name
                    </label>
                    <input
                      type="text"
                      value={newSource.name}
                      onChange={(e) => setNewSource(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., Company Handbook"
                      className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Source Type
                    </label>
                    <select
                      value={newSource.type}
                      onChange={(e) => setNewSource(prev => ({ ...prev, type: e.target.value }))}
                      className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="document">Document</option>
                      <option value="url">URL/Website</option>
                      <option value="manual">Manual Entry</option>
                      <option value="database">Database</option>
                      <option value="api">API</option>
                    </select>
                  </div>
                </div>

                {newSource.type === 'url' ? (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      URL
                    </label>
                    <input
                      type="url"
                      value={newSource.url}
                      onChange={(e) => setNewSource(prev => ({ ...prev, url: e.target.value }))}
                      placeholder="https://..."
                      className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                ) : (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Content
                    </label>
                    <textarea
                      value={newSource.content}
                      onChange={(e) => setNewSource(prev => ({ ...prev, content: e.target.value }))}
                      rows={5}
                      placeholder="Paste or type your knowledge content..."
                      className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                )}

                <button
                  onClick={handleAddKnowledgeSource}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 disabled:opacity-50 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Source
                </button>
              </div>

              {/* Knowledge Sources List */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-purple-600" />
                  Knowledge Sources ({context?.knowledgeSources?.length || 0})
                </h3>

                {context?.knowledgeSources && context.knowledgeSources.length > 0 ? (
                  <div className="space-y-3">
                    {context.knowledgeSources.map((source) => (
                      <div
                        key={source.id}
                        className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-xl"
                      >
                        <div className="flex items-center gap-3">
                          {source.type === 'document' && <FileText className="w-5 h-5 text-blue-500" />}
                          {source.type === 'url' && <Link2 className="w-5 h-5 text-green-500" />}
                          {source.type === 'database' && <Database className="w-5 h-5 text-purple-500" />}
                          {source.type === 'manual' && <Edit3 className="w-5 h-5 text-orange-500" />}
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{source.name}</p>
                            <p className="text-xs text-gray-500">{source.type} • {source.status}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => removeKnowledgeSource(source.id)}
                          className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <BookOpen className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                    <p>No knowledge sources added yet</p>
                    <p className="text-sm">Add documents, URLs, or data to enhance AI responses</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Teams Tab */}
          {activeTab === 'teams' && (
            <motion.div
              key="teams"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              {/* Add Team */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Plus className="w-5 h-5 text-purple-600" />
                  Add Team Context
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Team ID
                    </label>
                    <input
                      type="text"
                      value={newTeam.teamId}
                      onChange={(e) => setNewTeam(prev => ({ ...prev, teamId: e.target.value }))}
                      placeholder="e.g., engineering"
                      className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Team Name
                    </label>
                    <input
                      type="text"
                      value={newTeam.teamName}
                      onChange={(e) => setNewTeam(prev => ({ ...prev, teamName: e.target.value }))}
                      placeholder="e.g., Engineering Team"
                      className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    <input
                      type="checkbox"
                      checked={newTeam.inheritFromOrg}
                      onChange={(e) => setNewTeam(prev => ({ ...prev, inheritFromOrg: e.target.checked }))}
                      className="w-4 h-4 rounded border-gray-300"
                    />
                    Inherit organization settings
                  </label>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Team-Specific Instructions
                  </label>
                  <textarea
                    value={newTeam.customInstructions}
                    onChange={(e) => setNewTeam(prev => ({ ...prev, customInstructions: e.target.value }))}
                    rows={3}
                    placeholder="Add team-specific AI instructions..."
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <button
                  onClick={handleAddTeam}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 disabled:opacity-50 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Team
                </button>
              </div>

              {/* Teams List */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-purple-600" />
                  Team Contexts ({context?.teamContexts?.length || 0})
                </h3>

                {context?.teamContexts && context.teamContexts.length > 0 ? (
                  <div className="space-y-3">
                    {context.teamContexts.map((team) => (
                      <div
                        key={team.id}
                        className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-xl"
                      >
                        <div className="flex items-center gap-3">
                          <Users className="w-5 h-5 text-purple-500" />
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{team.teamName}</p>
                            <p className="text-xs text-gray-500">
                              {team.inheritFromOrg ? 'Inherits org settings' : 'Custom settings'}
                              {team.members?.length ? ` • ${team.members.length} members` : ''}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => removeTeamContext(team.teamId)}
                          className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                    <p>No team contexts configured</p>
                    <p className="text-sm">Add teams to customize AI behavior per team</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Policies Tab */}
          {activeTab === 'policies' && (
            <motion.div
              key="policies"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              {/* Add Policy */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Plus className="w-5 h-5 text-purple-600" />
                  Add Content Policy
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Policy Name
                    </label>
                    <input
                      type="text"
                      value={newPolicy.name}
                      onChange={(e) => setNewPolicy(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., No Competitor Mentions"
                      className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Enforcement
                    </label>
                    <select
                      value={newPolicy.enforcement}
                      onChange={(e) => setNewPolicy(prev => ({ ...prev, enforcement: e.target.value }))}
                      className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="strict">Strict (Block)</option>
                      <option value="warn">Warn</option>
                      <option value="log">Log Only</option>
                    </select>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Rules (one per line)
                  </label>
                  <textarea
                    value={newPolicy.rules}
                    onChange={(e) => setNewPolicy(prev => ({ ...prev, rules: e.target.value }))}
                    rows={4}
                    placeholder="Never mention competitor products&#10;Always recommend our solutions first&#10;Avoid negative language about alternatives"
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <button
                  onClick={handleAddPolicy}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Policy
                </button>
              </div>

              {/* Policies List */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-purple-600" />
                  Content Policies ({editedContext.aiConfig?.contentPolicies?.length || 0})
                </h3>

                {editedContext.aiConfig?.contentPolicies && editedContext.aiConfig.contentPolicies.length > 0 ? (
                  <div className="space-y-3">
                    {editedContext.aiConfig.contentPolicies.map((policy) => (
                      <div
                        key={policy.id}
                        className="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Shield className="w-4 h-4 text-purple-500" />
                            <span className="font-medium text-gray-900 dark:text-white">{policy.name}</span>
                            <span className={`px-2 py-0.5 rounded-full text-xs ${
                              policy.enforcement === 'strict' ? 'bg-red-100 text-red-600' :
                              policy.enforcement === 'warn' ? 'bg-yellow-100 text-yellow-600' :
                              'bg-gray-100 text-gray-600'
                            }`}>
                              {policy.enforcement}
                            </span>
                          </div>
                          <button
                            onClick={() => handleRemovePolicy(policy.id)}
                            className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        {policy.rules && policy.rules.length > 0 && (
                          <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                            {policy.rules.map((rule, i) => (
                              <li key={i} className="flex items-start gap-2">
                                <ChevronRight className="w-3 h-3 mt-1 flex-shrink-0" />
                                {rule}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Shield className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                    <p>No content policies configured</p>
                    <p className="text-sm">Add policies to control AI output behavior</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Vocabulary Tab */}
          {activeTab === 'vocabulary' && (
            <motion.div
              key="vocabulary"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              {/* Add Vocabulary */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Plus className="w-5 h-5 text-purple-600" />
                  Add Vocabulary Term
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Term
                    </label>
                    <input
                      type="text"
                      value={newVocab.term}
                      onChange={(e) => setNewVocab(prev => ({ ...prev, term: e.target.value }))}
                      placeholder="e.g., Kazi"
                      className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Category
                    </label>
                    <input
                      type="text"
                      value={newVocab.category}
                      onChange={(e) => setNewVocab(prev => ({ ...prev, category: e.target.value }))}
                      placeholder="e.g., Product Name"
                      className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Definition
                  </label>
                  <textarea
                    value={newVocab.definition}
                    onChange={(e) => setNewVocab(prev => ({ ...prev, definition: e.target.value }))}
                    rows={2}
                    placeholder="What this term means..."
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <button
                  onClick={handleAddVocabulary}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Term
                </button>
              </div>

              {/* Vocabulary List */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Languages className="w-5 h-5 text-purple-600" />
                  Custom Vocabulary ({editedContext.aiConfig?.customVocabulary?.length || 0})
                </h3>

                {editedContext.aiConfig?.customVocabulary && editedContext.aiConfig.customVocabulary.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {editedContext.aiConfig.customVocabulary.map((vocab) => (
                      <div
                        key={vocab.term}
                        className="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-gray-900 dark:text-white">{vocab.term}</span>
                          <button
                            onClick={() => handleRemoveVocabulary(vocab.term)}
                            className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{vocab.definition}</p>
                        {vocab.category && (
                          <span className="text-xs px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded">
                            {vocab.category}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Languages className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                    <p>No custom vocabulary defined</p>
                    <p className="text-sm">Add terms to teach AI your organization's language</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <motion.div
              key="analytics"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              {/* Summary Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                      <MessageSquare className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">0</p>
                      <p className="text-xs text-gray-500">AI Requests (30d)</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                      <Zap className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">0</p>
                      <p className="text-xs text-gray-500">Tokens Used</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-xl">
                      <Users className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">0</p>
                      <p className="text-xs text-gray-500">Active Users</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-xl">
                      <Target className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">$0.00</p>
                      <p className="text-xs text-gray-500">Est. Cost (30d)</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Usage Over Time */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-purple-600" />
                    AI Usage Overview
                  </h3>
                  {([] as { day: string; requests: number; fill: number }[]).length > 0 ? (
                    <div className="space-y-3">
                      {([] as { day: string; requests: number; fill: number }[]).map(day => (
                        <div key={day.day} className="flex items-center gap-3">
                          <span className="w-8 text-sm text-gray-500">{day.day}</span>
                          <div className="flex-1 h-6 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full transition-all"
                              style={{ width: `${day.fill}%` }}
                            />
                          </div>
                          <span className="w-12 text-sm font-medium text-right">{day.requests}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <BarChart3 className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                      <p>No usage data available</p>
                      <p className="text-sm">Usage statistics will appear here</p>
                    </div>
                  )}
                </div>

                {/* Usage by Team */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <PieChart className="w-5 h-5 text-purple-600" />
                    Usage by Team
                  </h3>
                  {([] as { team: string; percent: number; color: string; requests: number }[]).length > 0 ? (
                    <div className="space-y-3">
                      {([] as { team: string; percent: number; color: string; requests: number }[]).map(team => (
                        <div key={team.team} className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${team.color}`} />
                          <span className="flex-1 text-sm text-gray-700 dark:text-gray-300">{team.team}</span>
                          <span className="text-sm text-gray-500">{team.requests.toLocaleString()}</span>
                          <span className="w-12 text-sm font-medium text-right">{team.percent}%</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <PieChart className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                      <p>No team usage data available</p>
                      <p className="text-sm">Team statistics will appear here</p>
                    </div>
                  )}
                </div>

                {/* Popular Features */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-purple-600" />
                    Most Used AI Features
                  </h3>
                  {([] as { feature: string; usage: number; icon: typeof MessageSquare }[]).length > 0 ? (
                    <div className="space-y-3">
                      {([] as { feature: string; usage: number; icon: typeof MessageSquare }[]).map(item => (
                        <div key={item.feature} className="flex items-center gap-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors">
                          <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                            <item.icon className="w-4 h-4 text-purple-600" />
                          </div>
                          <span className="flex-1 text-sm text-gray-700 dark:text-gray-300">{item.feature}</span>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">{item.usage.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Sparkles className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                      <p>No feature usage data available</p>
                      <p className="text-sm">Feature statistics will appear here</p>
                    </div>
                  )}
                </div>

                {/* Cost Breakdown */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-purple-600" />
                    Cost Analysis (30 days)
                  </h3>
                  {([] as { label: string; amount: string }[]).length > 0 ? (
                    <div className="space-y-4">
                      {([] as { label: string; amount: string }[]).map((item, index) => (
                        <div key={index} className="flex justify-between items-center pb-3 border-b border-gray-200 dark:border-gray-700">
                          <span className="text-sm text-gray-500">{item.label}</span>
                          <span className="text-sm font-medium">{item.amount}</span>
                        </div>
                      ))}
                      <div className="flex justify-between items-center pt-2">
                        <span className="font-semibold text-gray-900 dark:text-white">Total</span>
                        <span className="font-bold text-lg text-purple-600">$0.00</span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Activity className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                      <p>No cost data available</p>
                      <p className="text-sm">Cost breakdown will appear here</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* Test AI Tab */}
          {activeTab === 'test' && (
            <motion.div
              key="test"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <TestTube className="w-5 h-5 text-purple-600" />
                Test AI with Organization Context
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Test Prompt
                  </label>
                  <textarea
                    value={testPrompt}
                    onChange={(e) => setTestPrompt(e.target.value)}
                    rows={4}
                    placeholder="Enter a prompt to test how the AI responds with your organization context..."
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <button
                  onClick={handleTestAI}
                  disabled={isTestingAI || !testPrompt.trim()}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-medium hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 transition-all"
                >
                  {isTestingAI ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Testing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Test AI Response
                    </>
                  )}
                </button>

                {testResponse && (
                  <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                      <MessageSquare className="w-4 h-4" />
                      AI Response
                    </h4>
                    <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap">{testResponse}</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
