'use client';

import React, { useState, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import {
  Code2,
  Send,
  Copy,
  Download,
  Plus,
  Trash2,
  Settings,
  ChevronRight,
  ChevronDown,
  Loader2,
  Check,
  X,
  FileCode,
  Palette,
  BookOpen,
  Zap,
  Terminal,
  Eye,
  RefreshCw,
  FileJson,
  Folder,
  FolderOpen,
  GitBranch,
  Cpu,
  Bot,
  Brain,
  Wand2,
  PanelLeft,
  PanelRight,
  ExternalLink,
  Laptop,
  Smartphone,
  Tablet
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup
} from '@/components/ui/resizable';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';
import { useCodeBuilder, GeneratedFile, AgentStep, AgentMessage } from '@/hooks/use-code-builder';

// Monaco Editor placeholder (would use @monaco-editor/react in production)
const MonacoEditor = ({ code, language, onChange }: {
  code: string;
  language: string;
  onChange?: (value: string) => void;
}) => {
  return (
    <div className="h-full bg-[#1e1e1e] font-mono text-sm overflow-auto">
      <div className="flex items-center justify-between px-4 py-2 bg-[#252526] border-b border-[#3c3c3c]">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-[#1e1e1e] text-gray-400 border-gray-700 text-xs">
            {language}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="h-6 text-gray-400 hover:text-white" onClick={() => { navigator.clipboard.writeText(code); toast.success('Copied', { description: 'Code copied to clipboard' }); }}>
            <Copy className="h-3 w-3" />
          </Button>
        </div>
      </div>
      <pre className="p-4 text-gray-300 whitespace-pre-wrap">
        <code>{code}</code>
      </pre>
    </div>
  );
};

// Live Preview Component
const LivePreview = ({ files, previewUrl }: { files: GeneratedFile[]; previewUrl?: string }) => {
  const [device, setDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const deviceWidths = {
    desktop: '100%',
    tablet: '768px',
    mobile: '375px'
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  // Generate a simple HTML preview from files
  const generatePreviewHtml = () => {
    const htmlFile = files.find(f => f.file_name.endsWith('.html'));
    const cssFile = files.find(f => f.file_name.endsWith('.css'));
    const jsFile = files.find(f => f.file_name.endsWith('.js') || f.file_name.endsWith('.tsx'));

    if (htmlFile) {
      return htmlFile.content;
    }

    // Generate basic HTML for React/Next.js components
    const componentFile = files.find(f =>
      f.file_name.endsWith('.tsx') ||
      f.file_name.endsWith('.jsx')
    );

    if (componentFile) {
      return `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <script src="https://cdn.tailwindcss.com"></script>
          <style>${cssFile?.content || ''}</style>
        </head>
        <body class="bg-gray-900 text-white p-8">
          <div class="max-w-4xl mx-auto">
            <div class="bg-gradient-to-br from-blue-600 to-purple-700 rounded-2xl p-8 mb-8">
              <h1 class="text-3xl font-bold mb-2">Preview Available</h1>
              <p class="text-blue-100">Your React/Next.js component has been generated</p>
            </div>
            <div class="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h2 class="text-lg font-semibold mb-4 flex items-center gap-2">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/>
                </svg>
                Component Preview
              </h2>
              <p class="text-gray-400 text-sm">Run "npm run dev" to see your component live.</p>
              <div class="mt-4 bg-gray-900 rounded-lg p-4 text-xs font-mono">
                <span class="text-green-400">$</span> npm install && npm run dev
              </div>
            </div>
          </div>
        </body>
        </html>
      `;
    }

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            font-family: system-ui, sans-serif;
            background: #111;
            color: #888;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            margin: 0;
          }
        </style>
      </head>
      <body>
        <p>Generate code to see a preview</p>
      </body>
      </html>
    `;
  };

  return (
    <div className="h-full flex flex-col bg-[#1e1e1e]">
      {/* Preview Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#252526] border-b border-[#3c3c3c]">
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={device === 'desktop' ? 'secondary' : 'ghost'}
                  size="sm"
                  className="h-7"
                  onClick={() => setDevice('desktop')}
                >
                  <Laptop className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Desktop</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={device === 'tablet' ? 'secondary' : 'ghost'}
                  size="sm"
                  className="h-7"
                  onClick={() => setDevice('tablet')}
                >
                  <Tablet className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Tablet</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={device === 'mobile' ? 'secondary' : 'ghost'}
                  size="sm"
                  className="h-7"
                  onClick={() => setDevice('mobile')}
                >
                  <Smartphone className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Mobile</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-gray-400"
            onClick={handleRefresh}
           aria-label="Refresh">
                  <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
          <Button variant="ghost" size="sm" className="h-7 text-gray-400" onClick={() => toast.info('Preview', { description: 'Opening in new window...' })}>
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Preview Frame */}
      <div className="flex-1 flex items-center justify-center p-4 bg-[#1a1a1a] overflow-auto">
        <div
          className="h-full bg-white rounded-lg overflow-hidden shadow-2xl transition-all duration-300"
          style={{ width: deviceWidths[device], maxWidth: '100%' }}
        >
          <iframe
            srcDoc={generatePreviewHtml()}
            className="w-full h-full border-0"
            title="Preview"
            sandbox="allow-scripts"
          />
        </div>
      </div>
    </div>
  );
};

// Terminal Component
const TerminalPanel = ({ output }: { output: string[] }) => {
  return (
    <div className="h-full bg-[#1e1e1e] font-mono text-sm">
      <div className="flex items-center justify-between px-4 py-2 bg-[#252526] border-b border-[#3c3c3c]">
        <div className="flex items-center gap-2">
          <Terminal className="h-4 w-4 text-gray-400" />
          <span className="text-gray-400 text-xs">Terminal</span>
        </div>
        <Button variant="ghost" size="sm" className="h-6 text-gray-400" onClick={() => toast.info('Clear', { description: 'Terminal cleared' })}>
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
      <ScrollArea className="h-[calc(100%-40px)]">
        <div className="p-4 space-y-1">
          {output.length === 0 ? (
            <p className="text-gray-500">Ready for commands...</p>
          ) : (
            output.map((line, idx) => (
              <div key={idx} className="text-gray-300">
                {line.startsWith('$') ? (
                  <span className="text-green-400">{line}</span>
                ) : line.startsWith('Error') ? (
                  <span className="text-red-400">{line}</span>
                ) : (
                  line
                )}
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

// File Explorer with nested structure
const FileExplorer = ({ files, selectedFile, onSelect }: {
  files: GeneratedFile[];
  selectedFile: string | null;
  onSelect: (fileId: string) => void;
}) => {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['src', 'app', 'components']));

  // Build folder structure
  const buildTree = (files: GeneratedFile[]) => {
    const tree: Record<string, { type: 'folder' | 'file'; children?: Record<string, unknown>; file?: GeneratedFile }> = {};

    files.forEach(file => {
      const parts = file.file_path.split('/').filter(Boolean);
      let current = tree;

      parts.forEach((part, idx) => {
        if (idx === parts.length - 1) {
          current[part] = { type: 'file', file };
        } else {
          if (!current[part]) {
            current[part] = { type: 'folder', children: {} };
          }
          current = current[part].children as typeof tree;
        }
      });
    });

    return tree;
  };

  const toggleFolder = (path: string) => {
    setExpandedFolders(prev => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  };

  const getFileIcon = (fileName: string) => {
    if (fileName.endsWith('.tsx') || fileName.endsWith('.ts')) return <FileCode className="h-4 w-4 text-blue-400" />;
    if (fileName.endsWith('.css')) return <Palette className="h-4 w-4 text-pink-400" />;
    if (fileName.endsWith('.json')) return <FileJson className="h-4 w-4 text-yellow-400" />;
    if (fileName.endsWith('.md')) return <BookOpen className="h-4 w-4 text-gray-400" />;
    return <FileCode className="h-4 w-4 text-gray-400" />;
  };

  const renderTree = (tree: Record<string, unknown>, path = '') => {
    return Object.entries(tree).map(([name, node]: [string, unknown]) => {
      const typedNode = node as { type: 'folder' | 'file'; children?: Record<string, unknown>; file?: GeneratedFile };
      const fullPath = path ? `${path}/${name}` : name;

      if (typedNode.type === 'folder') {
        const isExpanded = expandedFolders.has(fullPath);
        return (
          <div key={fullPath}>
            <button
              className="w-full flex items-center gap-2 px-2 py-1 hover:bg-[#2a2d2e] rounded text-left text-sm text-gray-300"
              onClick={() => toggleFolder(fullPath)}
            >
              {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              {isExpanded ? <FolderOpen className="h-4 w-4 text-yellow-500" /> : <Folder className="h-4 w-4 text-yellow-500" />}
              <span>{name}</span>
            </button>
            {isExpanded && typedNode.children && (
              <div className="ml-4">{renderTree(typedNode.children, fullPath)}</div>
            )}
          </div>
        );
      } else if (typedNode.file) {
        return (
          <button
            key={fullPath}
            className={`w-full flex items-center gap-2 px-2 py-1 rounded text-left text-sm ${
              selectedFile === typedNode.file.id
                ? 'bg-[#094771] text-white'
                : 'text-gray-300 hover:bg-[#2a2d2e]'
            }`}
            onClick={() => onSelect(typedNode.file!.id)}
          >
            {getFileIcon(name)}
            <span className="truncate">{name}</span>
          </button>
        );
      }
      return null;
    });
  };

  const tree = buildTree(files);

  return (
    <div className="h-full bg-[#252526] text-gray-300">
      <div className="flex items-center justify-between px-4 py-2 border-b border-[#3c3c3c]">
        <span className="text-xs font-medium uppercase tracking-wider text-gray-500">Explorer</span>
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-gray-500 hover:text-gray-300" onClick={() => toast.info('New File', { description: 'Creating new file...' })}>
            <Plus className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-gray-500 hover:text-gray-300" onClick={() => toast.info('Refresh', { description: 'Refreshing file tree...' })}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <ScrollArea className="h-[calc(100%-40px)]">
        <div className="p-2">
          {files.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-8">No files yet</p>
          ) : (
            renderTree(tree)
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

// AI Chat Panel
const AIChatPanel = ({
  messages,
  steps,
  onSend,
  isGenerating
}: {
  messages: AgentMessage[];
  steps: AgentStep[];
  onSend: (message: string) => void;
  isGenerating: boolean;
}) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isGenerating) {
      onSend(input);
      setInput('');
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#1e1e1e]">
      <div className="flex items-center justify-between px-4 py-2 bg-[#252526] border-b border-[#3c3c3c]">
        <div className="flex items-center gap-2">
          <Bot className="h-4 w-4 text-purple-400" />
          <span className="text-gray-400 text-sm">Manus AI</span>
        </div>
        {isGenerating && (
          <Badge variant="outline" className="bg-purple-500/10 text-purple-400 border-purple-500/30 animate-pulse">
            <Brain className="h-3 w-3 mr-1 animate-pulse" />
            Thinking...
          </Badge>
        )}
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-12">
              <div className="relative inline-block mb-4">
                <div className="absolute inset-0 rounded-full blur-xl bg-gradient-to-r from-purple-500 to-blue-500 opacity-30"></div>
                <Wand2 className="relative h-12 w-12 text-purple-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-300 mb-2">AI Code Builder</h3>
              <p className="text-gray-500 text-sm max-w-xs mx-auto">
                Describe what you want to build and watch the magic happen
              </p>
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-6 max-w-sm mx-auto">
                {[
                  'Create a landing page',
                  'Build a todo app',
                  'Design a dashboard',
                  'Create an API'
                ].map((suggestion) => (
                  <Button
                    key={suggestion}
                    variant="outline"
                    size="sm"
                    className="text-xs bg-[#252526] border-[#3c3c3c] text-gray-400 hover:text-white hover:bg-[#2a2d2e]"
                    onClick={() => setInput(suggestion)}
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[85%] rounded-xl px-4 py-2.5 ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                    : msg.role === 'tool'
                    ? 'bg-[#2a2d2e] border border-yellow-500/30 text-gray-300'
                    : 'bg-[#2a2d2e] text-gray-300'
                }`}
              >
                {msg.role === 'tool' && msg.tool_name && (
                  <div className="flex items-center gap-2 mb-1.5 text-yellow-400">
                    <Zap className="h-3 w-3" />
                    <span className="text-xs font-medium">{msg.tool_name}</span>
                  </div>
                )}
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          ))}

          {/* Steps Progress */}
          {isGenerating && steps.length > 0 && (
            <div className="bg-[#252526] rounded-lg p-3 border border-[#3c3c3c]">
              <div className="flex items-center gap-2 mb-2">
                <Cpu className="h-4 w-4 text-blue-400 animate-pulse" />
                <span className="text-sm text-gray-400">Processing...</span>
              </div>
              <div className="space-y-1.5">
                {steps.slice(-3).map((step) => (
                  <div key={step.id} className="flex items-center gap-2 text-xs">
                    {step.status === 'running' ? (
                      <Loader2 className="h-3 w-3 animate-spin text-blue-400" />
                    ) : step.status === 'completed' ? (
                      <Check className="h-3 w-3 text-green-400" />
                    ) : (
                      <div className="h-3 w-3 rounded-full border border-gray-600" />
                    )}
                    <span className="text-gray-400 truncate">{step.action}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      <form onSubmit={handleSubmit} className="p-4 border-t border-[#3c3c3c]">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe what you want to build..."
            className="bg-[#252526] border-[#3c3c3c] text-gray-200 placeholder:text-gray-500"
            disabled={isGenerating}
          />
          <Button
            type="submit"
            disabled={!input.trim() || isGenerating}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </form>
    </div>
  );
};

// Main Component
export default function AICodeBuilderV2Client() {
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
  } = useCodeBuilder();

  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [activeRightTab, setActiveRightTab] = useState<'preview' | 'terminal'>('preview');
  const [showLeftPanel, setShowLeftPanel] = useState(true);
  const [showRightPanel, setShowRightPanel] = useState(true);
  const [terminalOutput] = useState<string[]>([
    '$ Manus AI Code Builder initialized',
    '$ Ready to generate code...'
  ]);

  // Initialize session on mount
  useEffect(() => {
    if (!session && !isLoading) {
      createSession('AI Code Builder Session');
    }
  }, [session, isLoading, createSession]);

  // Auto-select first file
  useEffect(() => {
    if (files.length > 0 && !selectedFile) {
      setSelectedFile(files[0].id);
    }
  }, [files, selectedFile]);

  const handleSendMessage = async (message: string) => {
    if (!session) {
      await createSession('AI Code Builder Session');
    }
    await generateCode(message, 'code_generation');
  };

  const selectedFileData = files.find(f => f.id === selectedFile);

  return (
    <div className="h-screen bg-[#1e1e1e] text-gray-200 flex flex-col overflow-hidden">
      {/* Top Bar */}
      <header className="h-10 bg-[#323233] border-b border-[#3c3c3c] flex items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg">
              <Code2 className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-medium">Manus Code Builder</span>
            <Badge variant="outline" className="bg-purple-500/10 text-purple-400 border-purple-500/30 text-xs">
              V2
            </Badge>
          </div>
          <Separator orientation="vertical" className="h-4 bg-[#3c3c3c]" />
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-gray-400 hover:text-white"
              onClick={() => setShowLeftPanel(!showLeftPanel)}
            >
              <PanelLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-gray-400 hover:text-white"
              onClick={() => setShowRightPanel(!showRightPanel)}
            >
              <PanelRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {session && (
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-xs text-gray-400">{session.model}</span>
            </div>
          )}
          <Button variant="ghost" size="sm" className="h-7 text-gray-400">
            <Settings className="h-4 w-4" />
          </Button>
          {files.length > 0 && (
            <Button
              size="sm"
              className="h-7 bg-gradient-to-r from-purple-600 to-blue-600"
              onClick={downloadFiles}
            >
              <Download className="h-3 w-3 mr-1" />
              Export
            </Button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal">
          {/* Left Panel - AI Chat */}
          {showLeftPanel && (
            <>
              <ResizablePanel defaultSize={25} minSize={20} maxSize={40}>
                <AIChatPanel
                  messages={messages}
                  steps={steps}
                  onSend={handleSendMessage}
                  isGenerating={isGenerating}
                />
              </ResizablePanel>
              <ResizableHandle className="w-1 bg-[#3c3c3c] hover:bg-blue-500 transition-colors" />
            </>
          )}

          {/* Center Panel - File Explorer + Editor */}
          <ResizablePanel defaultSize={50}>
            <ResizablePanelGroup direction="horizontal">
              {/* File Explorer */}
              <ResizablePanel defaultSize={30} minSize={15} maxSize={40}>
                <FileExplorer
                  files={files}
                  selectedFile={selectedFile}
                  onSelect={setSelectedFile}
                />
              </ResizablePanel>
              <ResizableHandle className="w-1 bg-[#3c3c3c] hover:bg-blue-500 transition-colors" />

              {/* Code Editor */}
              <ResizablePanel defaultSize={70}>
                {selectedFileData ? (
                  <MonacoEditor
                    code={selectedFileData.content}
                    language={selectedFileData.language}
                  />
                ) : (
                  <div className="h-full flex items-center justify-center bg-[#1e1e1e]">
                    <div className="text-center">
                      <FileCode className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                      <p className="text-gray-500">Select a file to view code</p>
                    </div>
                  </div>
                )}
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>

          {/* Right Panel - Preview/Terminal */}
          {showRightPanel && (
            <>
              <ResizableHandle className="w-1 bg-[#3c3c3c] hover:bg-blue-500 transition-colors" />
              <ResizablePanel defaultSize={25} minSize={20} maxSize={40}>
                <div className="h-full flex flex-col">
                  {/* Tabs */}
                  <div className="flex items-center bg-[#252526] border-b border-[#3c3c3c]">
                    <button
                      className={`px-4 py-2 text-sm ${
                        activeRightTab === 'preview'
                          ? 'bg-[#1e1e1e] text-white border-t-2 border-blue-500'
                          : 'text-gray-400 hover:text-white'
                      }`}
                      onClick={() => setActiveRightTab('preview')}
                    >
                      <Eye className="h-4 w-4 inline-block mr-2" />
                      Preview
                    </button>
                    <button
                      className={`px-4 py-2 text-sm ${
                        activeRightTab === 'terminal'
                          ? 'bg-[#1e1e1e] text-white border-t-2 border-blue-500'
                          : 'text-gray-400 hover:text-white'
                      }`}
                      onClick={() => setActiveRightTab('terminal')}
                    >
                      <Terminal className="h-4 w-4 inline-block mr-2" />
                      Terminal
                    </button>
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    {activeRightTab === 'preview' ? (
                      <LivePreview files={files} />
                    ) : (
                      <TerminalPanel output={terminalOutput} />
                    )}
                  </div>
                </div>
              </ResizablePanel>
            </>
          )}
        </ResizablePanelGroup>
      </div>

      {/* Status Bar */}
      <footer className="h-6 bg-[#007acc] flex items-center justify-between px-4 text-xs text-white">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <GitBranch className="h-3 w-3" />
            <span>main</span>
          </div>
          {isGenerating && (
            <div className="flex items-center gap-1">
              <Loader2 className="h-3 w-3 animate-spin" />
              <span>Generating...</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-4">
          <span>{files.length} files</span>
          <span>{steps.length} steps</span>
          {selectedFileData && (
            <span>{selectedFileData.language}</span>
          )}
        </div>
      </footer>

      {/* Error Toast */}
      {error && (
        <div className="fixed bottom-8 right-4 bg-red-500/90 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
          <X className="h-4 w-4" />
          <span className="text-sm">{error}</span>
          <Button variant="ghost" size="sm" className="h-6 text-white hover:bg-red-600" onClick={clearError}>
            Dismiss
          </Button>
        </div>
      )}
    </div>
  );
}
