"use client"

import { useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Textarea } from '@/components/ui/textarea'
import { 
  Loader2, 
  Upload, 
  FileText, 
  Image, 
  Code, 
  PenTool, 
  History, 
  Brain,
  AlertCircle,
  CheckCircle,
  XCircle,
  Eye,
  Download
} from 'lucide-react'
import { aiService, AIAnalysisResult } from '@/lib/services/ai-service'
import { FileType } from '@/types/files'

interface AIAssistantProps {
  className?: string
}

export function AIAssistant({ className }: AIAssistantProps) {
  const [activeTab, setActiveTab] = useState('analyze')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [selectedType, setSelectedType] = useState<FileType>('document')
  const [fileContent, setFileContent] = useState<string>('')
  const [analysisHistory, setAnalysisHistory] = useState<AIAnalysisResult[]>([])
  const [currentAnalysis, setCurrentAnalysis] = useState<AIAnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [analysisProgress, setAnalysisProgress] = useState(0)

  useEffect(() => {
    loadAnalysisHistory()
  }, [])

  const loadAnalysisHistory = async () => {
    try {
      setError(null)
      const history = await aiService.getAnalysisHistory()
      setAnalysisHistory(history)
    } catch (error: any) {
      console.error('Error loading analysis history:', error)
      setError(`Failed to load analysis history: ${error.message}`)
    }
  }

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setError(null)
      
      // Read file content if it's a text-based file
      if (file.type.startsWith('text/') || 
          file.name.endsWith('.md') || 
          file.name.endsWith('.json') ||
          file.name.endsWith('.js') ||
          file.name.endsWith('.ts') ||
          file.name.endsWith('.tsx') ||
          file.name.endsWith('.jsx')) {
        try {
          const content = await file.text()
          setFileContent(content)
        } catch (error: any) {
          console.error('Error reading file content:', error)
          setFileContent('')
        }
      } else {
        setFileContent('')
      }
    }
  }

  const getFileTypeFromFile = (file: File): FileType => {
    if (file.type.startsWith('image/')) return 'image'
    if (file.type.startsWith('text/') || 
        file.name.match(/\.(js|ts|tsx|jsx|py|java|cpp|c|html|css|sql)$/)) return 'code'
    if (file.name.match(/\.(sketch|fig|psd|ai|xd)$/)) return 'design'
    return 'document'
  }

  const handleAnalyze = async () => {
    if (!selectedFile) {
      setError('Please select a file to analyze')
      return
    }

    setIsAnalyzing(true)
    setError(null)
    setAnalysisProgress(10)

    try {
      const fileType = getFileTypeFromFile(selectedFile)
      
      setAnalysisProgress(30)

      const result = await aiService.analyzeFile(selectedFile, fileType)
      
      setAnalysisProgress(100)
      setCurrentAnalysis(result)
      setAnalysisHistory(prev => [result, ...prev])
      
    } catch (error: any) {
      console.error('Error analyzing file:', error)
      setError(`Analysis failed: ${error.message}`)
    } finally {
      setIsAnalyzing(false)
      setSelectedFile(null)
      setFileContent('')
      setAnalysisProgress(0)
      // Reset file input
      const fileInput = document.getElementById('file-input') as HTMLInputElement
      if (fileInput) fileInput.value = ''
    }
  }

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image': return <Image className="h-4 w-4" />
      case 'code': return <Code className="h-4 w-4" />
      case 'design': return <PenTool className="h-4 w-4" />
      default: return <FileText className="h-4 w-4" />
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'complete': return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'analyzing': return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
      case 'error': return <XCircle className="h-4 w-4 text-red-500" />
      default: return <Brain className="h-4 w-4" />
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className={className}>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="analyze" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Analyze
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            History
          </TabsTrigger>
          <TabsTrigger value="insights" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Current Analysis
          </TabsTrigger>
        </TabsList>

        {error && (
          <Alert className="mt-4 border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-red-800">
              {error}
            </AlertDescription>
          </Alert>
        )}

        <TabsContent value="analyze" className="space-y-4">
          <Card className="p-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">File Analysis</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Upload a file to get AI-powered insights and recommendations
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label htmlFor="file-input" className="block text-sm font-medium mb-2">
                    Select File
                  </label>
                  <Input
                    id="file-input"
                    type="file"
                    onChange={handleFileSelect}
                    accept=".txt,.md,.js,.ts,.tsx,.jsx,.py,.java,.cpp,.c,.html,.css,.sql,.json,.pdf,.doc,.docx,.png,.jpg,.jpeg,.gif,.sketch,.fig,.psd,.ai,.xd"
                    className="w-full"
                  />
                </div>

                {selectedFile && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      {getFileIcon(getFileTypeFromFile(selectedFile))}
                      <span className="font-medium">{selectedFile.name}</span>
                      <Badge variant="secondary">
                        {getFileTypeFromFile(selectedFile)}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-600">
                      <p>Size: {formatFileSize(selectedFile.size)}</p>
                      <p>Type: {selectedFile.type || 'Unknown'}</p>
                      {fileContent && (
                        <p>Content: {fileContent.length} characters</p>
                      )}
                    </div>
                  </div>
                )}

                {fileContent && (
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      File Content Preview
                    </label>
                    <Textarea
                      value={fileContent.substring(0, 500) + (fileContent.length > 500 ? '...' : '')}
                      readOnly
                      className="h-32 bg-gray-50"
                    />
                  </div>
                )}

                {isAnalyzing && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm">Analyzing file...</span>
                    </div>
                    <Progress value={analysisProgress} className="w-full" />
                  </div>
                )}

                <Button 
                  onClick={handleAnalyze} 
                  disabled={!selectedFile || isAnalyzing}
                  className="w-full"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Brain className="mr-2 h-4 w-4" />
                      Analyze File
                    </>
                  )}
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Analysis History</h3>
              <Button onClick={loadAnalysisHistory} variant="outline" size="sm">
                <History className="mr-2 h-4 w-4" />
                Refresh
              </Button>
            </div>

            {analysisHistory.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No analysis history yet</p>
                <p className="text-sm">Upload and analyze files to see them here</p>
              </div>
            ) : (
              <div className="space-y-3">
                {analysisHistory.map((analysis) => (
                  <div 
                    key={analysis.id}
                    className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => setCurrentAnalysis(analysis)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getFileIcon(analysis.type)}
                        <span className="font-medium">
                          Analysis {analysis.id.slice(0, 8)}
                        </span>
                        <Badge variant="outline">{analysis.type}</Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(analysis.status)}
                        <span className="text-xs text-gray-500">
                          {new Date(analysis.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    
                    {analysis.status === 'complete' && analysis.result && (
                      <div className="text-sm text-gray-600">
                        <p className="truncate">{analysis.result}</p>
                      </div>
                    )}
                    
                    {analysis.status === 'error' && (
                      <div className="text-sm text-red-600">
                        Analysis failed
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          {currentAnalysis ? (
            <Card className="p-6">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    {getFileIcon(currentAnalysis.type)}
                    Analysis Results
                  </h3>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(currentAnalysis.status)}
                    <Badge variant="outline">{currentAnalysis.type}</Badge>
                  </div>
                </div>

                {currentAnalysis.status === 'complete' && currentAnalysis.result && (
                  <div className="space-y-6">
                    {/* Summary */}
                    <div>
                      <h4 className="font-semibold mb-2">Analysis Result</h4>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <pre className="whitespace-pre-wrap text-sm">
                          {currentAnalysis.result}
                        </pre>
                      </div>
                    </div>

                    {/* Metadata */}
                    <div>
                      <h4 className="font-semibold mb-2">Analysis Information</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium">ID:</span> {currentAnalysis.id}
                        </div>
                        <div>
                          <span className="font-medium">Type:</span> {currentAnalysis.type}
                        </div>
                        <div>
                          <span className="font-medium">Status:</span> {currentAnalysis.status}
                        </div>
                        <div>
                          <span className="font-medium">Timestamp:</span> {new Date(currentAnalysis.timestamp).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {currentAnalysis.status === 'error' && (
                  <Alert className="border-red-200 bg-red-50">
                    <XCircle className="h-4 w-4" />
                    <AlertDescription className="text-red-800">
                      Analysis failed. Please try again.
                    </AlertDescription>
                  </Alert>
                )}

                {currentAnalysis.status === 'analyzing' && (
                  <div className="text-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                    <p>Analysis in progress...</p>
                  </div>
                )}
              </div>
            </Card>
          ) : (
            <Card className="p-6">
              <div className="text-center py-8 text-gray-500">
                <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No analysis selected</p>
                <p className="text-sm">Analyze a file or select from history to see insights</p>
              </div>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
} 