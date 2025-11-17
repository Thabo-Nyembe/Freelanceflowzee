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
      const mockCompletion = `// AI-generated completion
${codeInput}
  try {
    // Implementation logic here
    const result = await processData(data)
    return result
  } catch (error) {
    console.error('Error:', error)
    throw new Error('Processing failed')
  }

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
      </ErrorBoundary>
    )
