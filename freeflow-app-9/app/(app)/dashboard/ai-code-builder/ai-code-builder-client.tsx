'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Code2,
  Send,
  Sparkles,
  FolderTree,
  Copy,
  Download,
  Plus,
  Trash2,
  History,
  Settings,
  Loader2,
  Check,
  X,
  FileCode,
  Layout,
  Server,
  Palette,
  TestTube,
  Zap,
  Globe
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { useCodeBuilder, GeneratedFile, AgentStep } from '@/hooks/use-code-builder';

// Code syntax highlighting (simple version)
const CodeBlock = ({ code, language }: { code: string; language: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group">
      <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button size="sm" variant="ghost" onClick={handleCopy}>
          {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
        </Button>
      </div>
      <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
        <code className={`language-${language}`}>{code}</code>
      </pre>
      <div className="absolute bottom-2 left-2">
        <Badge variant="outline" className="bg-gray-800 text-gray-300 text-xs">
          {language}
        </Badge>
      </div>
    </div>
  );
};

// File tree component
const FileTree = ({ files, selectedFile, onSelect }: {
  files: GeneratedFile[];
  selectedFile: string | null;
  onSelect: (fileId: string) => void;
}) => {
  const getFileIcon = (type: string) => {
    switch (type) {
      case 'component': return <Layout className="h-4 w-4 text-blue-500" />;
      case 'page': return <FileCode className="h-4 w-4 text-green-500" />;
      case 'api': return <Server className="h-4 w-4 text-purple-500" />;
      case 'style': return <Palette className="h-4 w-4 text-pink-500" />;
      case 'test': return <TestTube className="h-4 w-4 text-yellow-500" />;
      case 'config': return <Settings className="h-4 w-4 text-gray-500" />;
      default: return <FileCode className="h-4 w-4 text-gray-400" />;
    }
  };

  return (
    <div className="space-y-1">
      {files.map(file => (
        <button
          key={file.id}
          onClick={() => onSelect(file.id)}
          className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-sm transition-colors ${
            selectedFile === file.id
              ? 'bg-primary/10 text-primary'
              : 'hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          {getFileIcon(file.file_type)}
          <span className="truncate">{file.file_name}</span>
        </button>
      ))}
    </div>
  );
};

// Step indicator
const StepIndicator = ({ step }: { step: AgentStep }) => {
  const getStepIcon = () => {
    switch (step.status) {
      case 'running': return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      case 'completed': return <Check className="h-4 w-4 text-green-500" />;
      case 'failed': return <X className="h-4 w-4 text-red-500" />;
      default: return <div className="h-4 w-4 rounded-full border-2 border-gray-300" />;
    }
  };

  return (
    <div className="flex items-center gap-3 p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50">
      {getStepIcon()}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{step.action}</p>
        <p className="text-xs text-muted-foreground">Tool: {step.tool}</p>
      </div>
      {step.duration_ms && (
        <Badge variant="outline" className="text-xs">
          {(step.duration_ms / 1000).toFixed(1)}s
        </Badge>
      )}
    </div>
  );
};

// Template card
const TemplateCard = ({ template, onSelect }: {
  template: { id: string; name: string; description: string; category: string; framework: string };
  onSelect: () => void;
}) => {
  const getCategoryIcon = () => {
    switch (template.category) {
      case 'web_app': return <Globe className="h-5 w-5" />;
      case 'api': return <Server className="h-5 w-5" />;
      case 'component': return <Layout className="h-5 w-5" />;
      case 'saas': return <Zap className="h-5 w-5" />;
      default: return <Code2 className="h-5 w-5" />;
    }
  };

  return (
    <Card className="cursor-pointer hover:border-primary transition-colors" onClick={onSelect}>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          {getCategoryIcon()}
          <CardTitle className="text-base">{template.name}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-2">{template.description}</p>
        <div className="flex gap-2">
          <Badge variant="secondary">{template.framework}</Badge>
          <Badge variant="outline">{template.category}</Badge>
        </div>
      </CardContent>
    </Card>
  );
};

export default function AICodeBuilderClient() {
  const {
    session,
    sessions,
    currentTask,
    steps,
    messages,
    files,
    templates,
    isLoading,
    isGenerating,
    error,
    createSession,
    loadSession,
    deleteSession,
    generateCode,
    cancelGeneration,
    generateFromTemplate,
    downloadFiles,
    copyFileContent,
    clearError
  } = useCodeBuilder({
    onStep: (step) => {
      console.log('Step:', step);
    },
    onFile: (file) => {
      console.log('File generated:', file.file_path);
    },
    onComplete: (task, files) => {
      console.log('Complete:', task, files);
    }
  });

  const [prompt, setPrompt] = useState('');
  const [taskType, setTaskType] = useState('code_generation');
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('chat');
  const [showHistory, setShowHistory] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-select first file
  useEffect(() => {
    if (files.length > 0 && !selectedFile) {
      setSelectedFile(files[0].id);
    }
  }, [files, selectedFile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isGenerating) return;

    if (!session) {
      await createSession('Code Generation Session');
    }

    try {
      await generateCode(prompt, taskType);
      setPrompt('');
    } catch (err) {
      console.error('Generation failed:', err);
    }
  };

  const handleNewSession = async () => {
    await createSession('New Coding Session');
  };

  const handleSelectTemplate = async (templateId: string) => {
    if (!session) {
      await createSession('Template-based Project');
    }
    setShowTemplates(false);
    await generateFromTemplate(templateId);
  };

  const selectedFileData = files.find(f => f.id === selectedFile);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
                <Code2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold">AI Code Builder</h1>
                <p className="text-sm text-muted-foreground">Manus-powered code generation</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Dialog open={showHistory} onOpenChange={setShowHistory}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <History className="h-4 w-4 mr-2" />
                    History
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Session History</DialogTitle>
                    <DialogDescription>Your recent coding sessions</DialogDescription>
                  </DialogHeader>
                  <ScrollArea className="h-[300px] mt-4">
                    <div className="space-y-2">
                      {sessions.map(s => (
                        <div
                          key={s.id}
                          className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                            session?.id === s.id ? 'border-primary bg-primary/5' : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                          }`}
                          onClick={() => {
                            loadSession(s.id);
                            setShowHistory(false);
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <p className="font-medium truncate">{s.title || 'Untitled Session'}</p>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteSession(s.id);
                              }}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">{s.status}</Badge>
                            <span className="text-xs text-muted-foreground">
                              {new Date(s.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      ))}
                      {sessions.length === 0 && (
                        <p className="text-center text-muted-foreground py-8">No sessions yet</p>
                      )}
                    </div>
                  </ScrollArea>
                </DialogContent>
              </Dialog>

              <Dialog open={showTemplates} onOpenChange={setShowTemplates}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Sparkles className="h-4 w-4 mr-2" />
                    Templates
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Project Templates</DialogTitle>
                    <DialogDescription>Start with a pre-built template</DialogDescription>
                  </DialogHeader>
                  <ScrollArea className="h-[400px] mt-4">
                    <div className="grid grid-cols-2 gap-4">
                      {templates.map(template => (
                        <TemplateCard
                          key={template.id}
                          template={template}
                          onSelect={() => handleSelectTemplate(template.id)}
                        />
                      ))}
                    </div>
                  </ScrollArea>
                </DialogContent>
              </Dialog>

              <Button size="sm" onClick={handleNewSession}>
                <Plus className="h-4 w-4 mr-2" />
                New Session
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-12 gap-6">
          {/* Left Panel - Chat & Steps */}
          <div className="col-span-12 lg:col-span-5 space-y-4">
            {/* Session Info */}
            {session && (
              <Card className="bg-white dark:bg-gray-900">
                <CardContent className="py-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-green-500"></div>
                      <span className="text-sm font-medium">{session.title}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{session.model}</Badge>
                      <Badge variant="secondary">{session.status}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Tabs */}
            <Card className="bg-white dark:bg-gray-900">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <CardHeader className="pb-0">
                  <TabsList className="w-full">
                    <TabsTrigger value="chat" className="flex-1">Chat</TabsTrigger>
                    <TabsTrigger value="steps" className="flex-1">Steps ({steps.length})</TabsTrigger>
                  </TabsList>
                </CardHeader>

                <CardContent className="pt-4">
                  <TabsContent value="chat" className="mt-0">
                    {/* Messages */}
                    <ScrollArea className="h-[400px] pr-4">
                      <div className="space-y-4">
                        {messages.length === 0 && (
                          <div className="text-center py-12">
                            <Sparkles className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                            <p className="text-muted-foreground">
                              Start a conversation to generate code
                            </p>
                            <p className="text-sm text-muted-foreground mt-2">
                              Try: &quot;Create a todo app with Next.js&quot;
                            </p>
                          </div>
                        )}

                        {messages.map((msg, idx) => (
                          <div
                            key={idx}
                            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                                msg.role === 'user'
                                  ? 'bg-primary text-primary-foreground'
                                  : msg.role === 'tool'
                                  ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-900 dark:text-yellow-100'
                                  : 'bg-gray-100 dark:bg-gray-800'
                              }`}
                            >
                              {msg.role === 'tool' && (
                                <Badge variant="outline" className="mb-2">
                                  Tool: {msg.tool_name}
                                </Badge>
                              )}
                              <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                            </div>
                          </div>
                        ))}
                        <div ref={messagesEndRef} />
                      </div>
                    </ScrollArea>

                    {/* Input */}
                    <form onSubmit={handleSubmit} className="mt-4">
                      <div className="flex gap-2">
                        <Select value={taskType} onValueChange={setTaskType}>
                          <SelectTrigger className="w-[140px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="code_generation">Code</SelectItem>
                            <SelectItem value="web_app">Web App</SelectItem>
                            <SelectItem value="api">API</SelectItem>
                            <SelectItem value="component">Component</SelectItem>
                            <SelectItem value="refactor">Refactor</SelectItem>
                            <SelectItem value="debug">Debug</SelectItem>
                            <SelectItem value="test">Test</SelectItem>
                          </SelectContent>
                        </Select>

                        <div className="flex-1 relative">
                          <Textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="Describe what you want to build..."
                            className="min-h-[44px] max-h-[200px] pr-12 resize-none"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSubmit(e);
                              }
                            }}
                          />
                          <Button
                            type="submit"
                            size="sm"
                            className="absolute right-2 bottom-2"
                            disabled={!prompt.trim() || isGenerating}
                          >
                            {isGenerating ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Send className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>

                      {isGenerating && (
                        <div className="flex items-center justify-between mt-2">
                          <p className="text-sm text-muted-foreground animate-pulse">
                            Generating code...
                          </p>
                          <Button variant="ghost" size="sm" onClick={cancelGeneration}>
                            Cancel
                          </Button>
                        </div>
                      )}
                    </form>
                  </TabsContent>

                  <TabsContent value="steps" className="mt-0">
                    <ScrollArea className="h-[450px] pr-4">
                      <div className="space-y-2">
                        {steps.length === 0 && (
                          <p className="text-center text-muted-foreground py-8">
                            No steps yet. Start generating code to see the process.
                          </p>
                        )}
                        {steps.map((step) => (
                          <StepIndicator key={step.id} step={step} />
                        ))}
                      </div>
                    </ScrollArea>
                  </TabsContent>
                </CardContent>
              </Tabs>
            </Card>

            {/* Error Display */}
            {error && (
              <Card className="border-red-200 bg-red-50 dark:bg-red-900/20">
                <CardContent className="py-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                      <X className="h-4 w-4" />
                      <span className="text-sm">{error}</span>
                    </div>
                    <Button variant="ghost" size="sm" onClick={clearError}>
                      Dismiss
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Panel - Code Preview */}
          <div className="col-span-12 lg:col-span-7 space-y-4">
            <Card className="bg-white dark:bg-gray-900 h-[calc(100vh-180px)]">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FolderTree className="h-5 w-5" />
                    Generated Files ({files.length})
                  </CardTitle>
                  {files.length > 0 && (
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={downloadFiles}>
                        <Download className="h-4 w-4 mr-2" />
                        Download All
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>

              <CardContent className="p-0">
                {files.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-[500px] text-muted-foreground">
                    <Code2 className="h-16 w-16 mb-4 opacity-20" />
                    <p>Generated files will appear here</p>
                    <p className="text-sm mt-2">Start by describing what you want to build</p>
                  </div>
                ) : (
                  <div className="flex h-[calc(100vh-280px)]">
                    {/* File Tree */}
                    <div className="w-64 border-r p-3">
                      <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">
                        Project Files
                      </p>
                      <FileTree
                        files={files}
                        selectedFile={selectedFile}
                        onSelect={setSelectedFile}
                      />
                    </div>

                    {/* Code Preview */}
                    <div className="flex-1 p-4 overflow-auto">
                      {selectedFileData ? (
                        <div>
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <p className="font-medium">{selectedFileData.file_path}</p>
                              <p className="text-sm text-muted-foreground">
                                {selectedFileData.language} • {(selectedFileData.size_bytes / 1024).toFixed(1)} KB
                              </p>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => copyFileContent(selectedFileData.id)}
                            >
                              <Copy className="h-4 w-4 mr-2" />
                              Copy
                            </Button>
                          </div>
                          <CodeBlock
                            code={selectedFileData.content}
                            language={selectedFileData.language}
                          />
                        </div>
                      ) : (
                        <p className="text-center text-muted-foreground py-12">
                          Select a file to view its contents
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Quick Actions */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-2">
        {files.length > 0 && (
          <>
            <Button
              size="lg"
              className="rounded-full shadow-lg"
              onClick={downloadFiles}
            >
              <Download className="h-5 w-5 mr-2" />
              Export Project
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
