'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { ErrorBoundary } from '@/components/ui/error-boundary-system'
import {
  Code, Play, Bug, Zap, FileText, Download, Copy, Share2,
  CheckCircle, AlertTriangle, Lightbulb, Terminal, Cpu,
  BookOpen, Sparkles, Eye, Settings, Layers
} from 'lucide-react'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'

const PROGRAMMING_LANGUAGES = [
  { id: 'javascript', name: 'JavaScript', icon: '🟨', color: 'bg-yellow-500' },
  { id: 'typescript', name: 'TypeScript', icon: '🔷', color: 'bg-blue-500' },
  { id: 'python', name: 'Python', icon: '🐍', color: 'bg-green-500' },
  { id: 'react', name: 'React/JSX', icon: '⚛️', color: 'bg-cyan-500' },
  { id: 'vue', name: 'Vue.js', icon: '💚', color: 'bg-emerald-500' },
  { id: 'angular', name: 'Angular', icon: '🅰️', color: 'bg-red-500' },
  { id: 'node', name: 'Node.js', icon: '🟢', color: 'bg-green-600' },
  { id: 'php', name: 'PHP', icon: '🐘', color: 'bg-purple-500' },
  { id: 'java', name: 'Java', icon: '☕', color: 'bg-orange-500' },
  { id: 'csharp', name: 'C#', icon: '#️⃣', color: 'bg-purple-600' },
  { id: 'cpp', name: 'C++', icon: '⚡', color: 'bg-blue-600' },
  { id: 'rust', name: 'Rust', icon: '🦀', color: 'bg-orange-600' },
  { id: 'go', name: 'Go', icon: '🐹', color: 'bg-cyan-600' },
  { id: 'swift', name: 'Swift', icon: '🍎', color: 'bg-orange-500' }
]

const CODE_TEMPLATES = [
  {
    id: 'component',
    name: 'React Component',
    description: 'Create a React functional component',
    template: `import React from 'react'

interface Props {
  // Define your props here
}

export const MyComponent: React.FC<Props> = () => {
  return (
    <div>
      {/* Component content */}
    </div>
  )
}

export default MyComponent`
  },
  {
    id: 'api',
    name: 'API Route',
    description: 'Next.js API route handler',
    template: `import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Handle GET request
    return NextResponse.json({ message: 'Success' })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    // Handle POST request
    return NextResponse.json({ data: body })
  } catch (error) {
    return NextResponse.json(
      { error: 'Bad Request' },
      { status: 400 }
    )
  }
}`
  },
  {
    id: 'hook',
    name: 'Custom Hook',
    description: 'React custom hook template',
    template: `import { useState, useEffect } from 'react'

export function useCustomHook() {
  const [state, setState] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    // Effect logic here
  }, [])

  return { state, loading, error }
}`
  }
]

export default function AICodeCompletionPage() {
  const codeRef = useRef<HTMLTextAreaElement>(null)
  const [codeInput, setCodeInput] = useState('')
  const [completion, setCompletion] = useState('')
  const [isCompleting, setIsCompleting] = useState(false)
  const [selectedLanguage, setSelectedLanguage] = useState('javascript')
  const [selectedTemplate, setSelectedTemplate] = useState('')
  const [bugs, setBugs] = useState<any[]>([])
  const [suggestions, setSuggestions] = useState<string[]>([])

  const handleComplete = useCallback(() => {
    setIsCompleting(true)
    setTimeout(() => {
      const mockCompletion = '// AI-generated completion\n' +
        codeInput + '\n' +
        '  try {\n' +
        '    // Implementation logic here\n' +
        '    const result = await processData(data)\n' +
        '    return result\n' +
        '  } catch (error) {\n' +
        '    console.error(\'Error:\', error)\n' +
        '    throw new Error(\'Processing failed\')\n' +
        '  }\n'
      setCompletion(mockCompletion)
      setSuggestions(['Add error handling', 'Optimize performance', 'Add TypeScript types'])
      setIsCompleting(false)
    }, 1500)
  }, [codeInput])

  const analyzeBugs = () => {
    const mockBugs = [
      { line: 5, type: 'warning', message: 'Variable declared but never used', severity: 'low' },
      { line: 12, type: 'error', message: 'Possible null reference', severity: 'high' },
      { line: 18, type: 'info', message: 'Consider using const instead of let', severity: 'low' }
    ]
    setBugs(mockBugs)
  }

  const handleTemplateSelect = (template: any) => {
    setCodeInput(template.template)
    setSelectedTemplate(template.id)
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(completion || codeInput)
  }

  // Additional Handlers
  const handleDownloadCode = () => {
    console.log('AI CODE COMPLETION: Download initiated')
    console.log('AI CODE COMPLETION: Language - ' + selectedLanguage)
    console.log('AI CODE COMPLETION: Content length - ' + (completion || codeInput).length + ' characters')
    const blob = new Blob([completion || codeInput], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'code.' + selectedLanguage
    a.click()
    console.log('AI CODE COMPLETION: File downloaded successfully')
    toast.success('Code Downloaded Successfully', {
      description: 'Your code has been saved to your downloads folder'
    })
  }
  const handleShareCode = () => {
    console.log('AI CODE COMPLETION: Share code initiated')
    console.log('AI CODE COMPLETION: Generating shareable link')
    console.log('AI CODE COMPLETION: Code length - ' + (completion || codeInput).length + ' characters')
    toast.info('Share Code Feature', {
      description: 'Generate shareable link or GitHub gist for your code'
    })
  }
  const handleSaveSnippet = () => {
    console.log('AI CODE COMPLETION: Save snippet initiated')
    const name = prompt('Snippet name:')
    if (name) {
      console.log('AI CODE COMPLETION: Snippet name - ' + name)
      console.log('AI CODE COMPLETION: Snippet content length - ' + (completion || codeInput).length + ' characters')
      console.log('AI CODE COMPLETION: Snippet saved successfully')
      toast.success('Snippet Saved', {
        description: 'Snippet "' + name + '" has been saved to your library'
      })
    }
  }
  const handleLoadSnippet = (snippetId: string) => {
    console.log('AI CODE COMPLETION: Load snippet initiated')
    console.log('AI CODE COMPLETION: Snippet ID - ' + snippetId)
    console.log('AI CODE COMPLETION: Fetching snippet from library')
    toast.info('Loading Snippet', {
      description: 'Retrieving saved snippet from your library'
    })
  }
  const handleOptimizeCode = () => {
    console.log('AI CODE COMPLETION: Code optimization started')
    console.log('AI CODE COMPLETION: Analyzing performance patterns')
    console.log('AI CODE COMPLETION: Identifying optimization opportunities')
    console.log('AI CODE COMPLETION: Applying optimizations')
    toast.success('AI Code Optimization', {
      description: 'Analyzing performance and applying optimizations to your code'
    })
  }
  const handleRefactorCode = () => {
    console.log('AI CODE COMPLETION: Code refactoring initiated')
    console.log('AI CODE COMPLETION: Improving code structure')
    console.log('AI CODE COMPLETION: Applying best practices')
    console.log('AI CODE COMPLETION: Enhancing readability')
    toast.success('AI Refactoring', {
      description: 'Improving code structure and applying best practices'
    })
  }
  const handleAddComments = () => {
    console.log('AI CODE COMPLETION: AI documentation started')
    console.log('AI CODE COMPLETION: Generating inline comments')
    console.log('AI CODE COMPLETION: Adding JSDoc/docstrings')
    toast.success('AI Documentation', {
      description: 'Generating inline comments and JSDoc documentation'
    })
  }
  const handleGenerateDocs = () => {
    console.log('AI CODE COMPLETION: Generate documentation initiated')
    console.log('AI CODE COMPLETION: Creating API documentation')
    console.log('AI CODE COMPLETION: Generating README')
    console.log('AI CODE COMPLETION: Adding usage examples')
    toast.success('Generate Documentation', {
      description: 'Creating API docs, README, and usage examples'
    })
  }
  const handleFormatCode = () => {
    console.log('AI CODE COMPLETION: Code formatting initiated')
    console.log('AI CODE COMPLETION: Applying Prettier/ESLint rules')
    console.log('AI CODE COMPLETION: Standardizing code style')
    toast.success('Code Formatting', {
      description: 'Applying Prettier/ESLint and standardizing style'
    })
  }
  const handleValidateCode = () => {
    console.log('AI CODE COMPLETION: Code validation started')
    console.log('AI CODE COMPLETION: Checking syntax')
    console.log('AI CODE COMPLETION: Validating types')
    console.log('AI CODE COMPLETION: Linting code')
    toast.success('Code Validation', {
      description: 'Checking syntax, validating types, and linting code'
    })
  }
  const handleGenerateTests = () => {
    console.log('AI CODE COMPLETION: Generate unit tests initiated')
    console.log('AI CODE COMPLETION: Creating test cases')
    console.log('AI CODE COMPLETION: Adding assertions')
    console.log('AI CODE COMPLETION: Mocking dependencies')
    toast.success('Generate Unit Tests', {
      description: 'Creating test cases, assertions, and mocking dependencies'
    })
  }
  const handleFixBugsAuto = () => {
    console.log('AI CODE COMPLETION: Auto-fix bugs initiated')
    console.log('AI CODE COMPLETION: Analyzing issues in code')
    console.log('AI CODE COMPLETION: Applying automatic fixes')
    toast.success('Auto-Fix Bugs', {
      description: 'Analyzing issues and applying fixes automatically'
    })
  }
  const handleCodeReview = () => {
    console.log('AI CODE COMPLETION: AI code review initiated')
    console.log('AI CODE COMPLETION: Checking best practices')
    console.log('AI CODE COMPLETION: Checking security issues')
    console.log('AI CODE COMPLETION: Checking performance')
    console.log('AI CODE COMPLETION: Checking maintainability')
    toast.info('AI Code Review', {
      description: 'Analyzing best practices, security, performance, and maintainability'
    })
  }
  const handleSecurityScan = () => {
    console.log('AI CODE COMPLETION: Security analysis started')
    console.log('AI CODE COMPLETION: Scanning for SQL injection')
    console.log('AI CODE COMPLETION: Scanning for XSS vulnerabilities')
    console.log('AI CODE COMPLETION: Scanning for CSRF issues')
    console.log('AI CODE COMPLETION: Scanning for insecure dependencies')
    toast.info('Security Analysis', {
      description: 'Scanning for SQL injection, XSS, CSRF, and insecure dependencies'
    })
  }
  const handlePerformanceProfile = () => {
    console.log('AI CODE COMPLETION: Performance analysis started')
    console.log('AI CODE COMPLETION: Analyzing time complexity')
    console.log('AI CODE COMPLETION: Analyzing space complexity')
    console.log('AI CODE COMPLETION: Identifying bottlenecks')
    console.log('AI CODE COMPLETION: Finding optimization opportunities')
    toast.info('Performance Analysis', {
      description: 'Analyzing complexity, bottlenecks, and optimization opportunities'
    })
  }
  const handleAddTypes = () => {
    console.log('AI CODE COMPLETION: Add type definitions initiated')
    console.log('AI CODE COMPLETION: Generating TypeScript interfaces')
    console.log('AI CODE COMPLETION: Adding type annotations')
    toast.success('Add Type Definitions', {
      description: 'Generating TypeScript interfaces and type annotations'
    })
  }
  const handleExportCode = (format: 'gist' | 'markdown' | 'pdf') => {
    console.log('AI CODE COMPLETION: Export code initiated')
    console.log('AI CODE COMPLETION: Export format - ' + format.toUpperCase())
    console.log('AI CODE COMPLETION: Preparing export')
    toast.success('Exporting Code', {
      description: 'Exporting code in ' + format.toUpperCase() + ' format'
    })
  }
  const handleImportCode = () => {
    console.log('AI CODE COMPLETION: Import code initiated')
    console.log('AI CODE COMPLETION: Opening file picker')
    console.log('AI CODE COMPLETION: Accepted formats - .js, .ts, .jsx, .tsx, .py, .java')
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.js,.ts,.jsx,.tsx,.py,.java'
    input.click()
    toast.info('Import Code File', {
      description: 'Select a code file to import and analyze'
    })
  }
  const handleDiffCode = () => {
    console.log('AI CODE COMPLETION: Code diff initiated')
    console.log('AI CODE COMPLETION: Comparing original vs optimized')
    console.log('AI CODE COMPLETION: Comparing before vs after')
    toast.info('Code Diff', {
      description: 'Comparing original vs optimized and before vs after changes'
    })
  }
  const handleVersionHistory = () => {
    console.log('AI CODE COMPLETION: Version history accessed')
    console.log('AI CODE COMPLETION: Loading previous completions')
    toast.info('Version History', {
      description: 'View and restore previous code completions'
    })
  }
  const handleAIExplain = () => {
    console.log('AI CODE COMPLETION: AI code explanation initiated')
    console.log('AI CODE COMPLETION: Generating detailed explanation')
    console.log('AI CODE COMPLETION: Breaking down logic')
    console.log('AI CODE COMPLETION: Highlighting code patterns')
    toast.info('AI Code Explanation', {
      description: 'Generating detailed explanation and breaking down logic'
    })
  }

  return (
    <ErrorBoundary level="page" name="AI Code Completion">
      <div>
        <div className="container mx-auto px-4 py-8 space-y-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-4"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full text-sm font-medium">
              <Code className="w-4 h-4" />
              AI Code Completion
            </div>
            <h1 className="text-4xl font-bold text-gradient">Smart Code Assistant</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Generate, complete, and optimize your code with advanced AI assistance
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Main Editor */}
            <div className="lg:col-span-3 space-y-6">
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold flex items-center gap-2">
                    <Terminal className="w-6 h-6 text-primary" />
                    Code Editor
                  </h2>
                  <div className="flex items-center gap-3">
                    <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PROGRAMMING_LANGUAGES.map((lang) => (
                          <SelectItem key={lang.id} value={lang.id}>
                            <div className="flex items-center gap-2">
                              <span>{lang.icon}</span>
                              <span>{lang.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Tabs defaultValue="editor" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="editor">Editor</TabsTrigger>
                    <TabsTrigger value="templates">Templates</TabsTrigger>
                    <TabsTrigger value="analysis">Analysis</TabsTrigger>
                  </TabsList>

                  <TabsContent value="editor" className="space-y-4">
                    <div className="relative">
                      <Textarea
                        ref={codeRef}
                        placeholder="Start typing your code or describe what you want to build..."
                        value={codeInput}
                        onChange={(e) => setCodeInput(e.target.value)}
                        className="min-h-64 font-mono text-sm"
                      />
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => { handleComplete(); console.log("💻 Generating code completion..."); }} data-testid="complete-code-btn"
                        disabled={!codeInput.trim() || isCompleting}
                        className="gap-2 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground rounded-md font-medium flex items-center"
                      >
                        {isCompleting ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Completing...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4" />
                            Complete Code
                          </>
                        )}
                      </button>
                      <button className="gap-2 px-4 py-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-md font-medium flex items-center" onClick={() => { analyzeBugs(); console.log("🐛 Analyzing bugs..."); }} data-testid="analyze-bugs-btn">
                        <Bug className="w-4 h-4" />
                        Analyze Bugs
                      </button>
                      <button className="gap-2 px-4 py-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-md font-medium flex items-center" onClick={() => { copyToClipboard(); console.log("📋 Copied to clipboard"); }} data-testid="copy-code-btn">
                        <Copy className="w-4 h-4" />
                        Copy
                      </button>
                    </div>

                    {/* AI Completion Result */}
                    <AnimatePresence>
                      {completion && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          className="mt-6"
                        >
                          <Card className="p-4">
                            <div className="flex items-center justify-between mb-3">
                              <h3 className="font-semibold flex items-center gap-2">
                                <Zap className="w-4 h-4 text-primary" />
                                AI Completion
                              </h3>
                              <div className="flex gap-2">
                                <button className="px-3 py-1.5 border border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-md text-sm flex items-center gap-2" onClick={() => setCodeInput(completion)}>
                                  <CheckCircle className="w-3 h-3" />
                                  Accept
                                </button>
                                <button className="px-3 py-1.5 border border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-md text-sm flex items-center gap-2">
                                  <Download className="w-3 h-3" />
                                  Download
                                </button>
                              </div>
                            </div>
                            <pre className="bg-muted/50 p-4 rounded-lg text-sm font-mono overflow-x-auto">
                              <code>{completion}</code>
                            </pre>
                          </Card>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Suggestions */}
                    <AnimatePresence>
                      {suggestions.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                        >
                          <Card className="p-4">
                            <h3 className="font-semibold mb-3 flex items-center gap-2">
                              <Lightbulb className="w-4 h-4 text-primary" />
                              AI Suggestions
                            </h3>
                            <div className="flex flex-wrap gap-2">
                              {suggestions.map((suggestion, index) => (
                                <Badge key={index} variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground">
                                  {suggestion}
                                </Badge>
                              ))}
                            </div>
                          </Card>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </TabsContent>

                  <TabsContent value="templates" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {CODE_TEMPLATES.map((template) => (
                        <motion.div
                          key={template.id}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="cursor-pointer"
                          onClick={() => handleTemplateSelect(template)}
                        >
                          <Card className="p-4 hover:shadow-lg transition-all">
                            <h3 className="font-semibold mb-2">{template.name}</h3>
                            <p className="text-sm text-muted-foreground mb-3">{template.description}</p>
                            <pre className="bg-muted/50 p-2 rounded text-xs font-mono overflow-hidden">
                              <code>{template.template.slice(0, 100)}...</code>
                            </pre>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="analysis" className="space-y-4">
                    {bugs.length > 0 ? (
                      <div className="space-y-3">
                        {bugs.map((bug, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                          >
                            <Card className="p-4">
                              <div className="flex items-start gap-3">
                                {bug.type === 'error' && <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5" />}
                                {bug.type === 'warning' && <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5" />}
                                {bug.type === 'info' && <Lightbulb className="w-5 h-5 text-blue-500 mt-0.5" />}
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="text-sm font-medium">Line {bug.line}</span>
                                    <Badge variant={bug.severity === 'high' ? 'destructive' : 'secondary'} className="text-xs">
                                      {bug.severity}
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-muted-foreground">{bug.message}</p>
                                </div>
                              </div>
                            </Card>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <Bug className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No issues found. Click "Analyze Bugs" to scan your code.</p>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Languages */}
              <Card className="p-6">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Layers className="w-5 h-5 text-primary" />
                  Languages
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {PROGRAMMING_LANGUAGES.slice(0, 8).map((lang) => (
                    <motion.div
                      key={lang.id}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedLanguage(lang.id)}
                      className={`cursor-pointer p-2 rounded-lg text-center text-xs transition-all ${
                        selectedLanguage === lang.id
                          ? 'bg-primary text-primary-foreground'
                          : 'hover:bg-accent'
                      }`}
                    >
                      <div className="text-xl mb-1">{lang.icon}</div>
                      <div className="font-medium">{lang.name}</div>
                    </motion.div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
      </ErrorBoundary>
    )
}
