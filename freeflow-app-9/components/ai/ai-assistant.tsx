"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Wand2, History, Send, Image, FileText, Code, LayoutDashboard } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export function AIAssistant() {
  const [activeTab, setActiveTab] = useState('analyze')
  const [query, setQuery] = useState('')
  const [analyzing, setAnalyzing] = useState(false)
  const [analysisHistory, setAnalysisHistory] = useState([
    {
      id: 1,
      type: 'design',
      query: 'Analyze this landing page design',
      result: 'The design follows modern principles with good use of whitespace and typography. Consider improving contrast in the hero section.'
    },
    {
      id: 2,
      type: 'code',
      query: 'Review my React component',
      result: 'The component is well-structured. Consider implementing useMemo for performance optimization.'
    }
  ])

  const handleAnalyze = async () => {
    if (!query.trim()) return
    setAnalyzing(true)
    try {
      // Simulate analysis
      await new Promise(resolve => setTimeout(resolve, 1500))
      const newAnalysis = {
        id: Date.now(),
        type: 'general',
        query,
        result: 'Analysis completed with A+++ features. The content meets high-quality standards.'
      }
      setAnalysisHistory(prev => [newAnalysis, ...prev])
      setQuery('')
    } catch (error) {
      console.error('Analysis failed:', error)
    } finally {
      setAnalyzing(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl font-bold flex items-center gap-2">
          <Wand2 className="w-6 h-6 text-primary" />
          AI Assistant
        </CardTitle>
      </CardHeader>
      <CardContent className="h-full flex flex-col">
        <div className="tab-content-container">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <TabsList className="tabs-list-fixed grid w-full grid-cols-2">
              <TabsTrigger value="analyze">Analyze</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>

            <div className="tabs-content-area">{/* Tabs content wrapper */}

              <TabsContent value="analyze" className="h-full m-0">
                <div className="tab-panel p-6 space-y-4">
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex items-center gap-2">
                      <Image className="w-4 h-4" />
                      Image
                    </Button>
                    <Button variant="outline" size="sm" className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Document
                    </Button>
                    <Button variant="outline" size="sm" className="flex items-center gap-2">
                      <Code className="w-4 h-4" />
                      Code
                    </Button>
                    <Button variant="outline" size="sm" className="flex items-center gap-2">
                      <LayoutDashboard className="w-4 h-4" />
                      Design
                    </Button>
                  </div>

                  <div className="flex gap-2">
                    <Input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="What would you like me to analyze?"
                      className="flex-1"
                    />
                    <Button 
                      onClick={handleAnalyze}
                      disabled={analyzing || !query.trim()}
                    >
                      {analyzing ? 'Analyzing...' : 'Analyze'}
                      <Send className="w-4 h-4 ml-2" />
                    </Button>
                  </div>

                  <ScrollArea className="h-[400px] rounded-md border p-4">
                    {analysisHistory.map((item) => (
                      <div key={item.id} className="mb-4 last:mb-0">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline">{item.type}</Badge>
                          <span className="text-sm text-muted-foreground">
                            {new Date(item.id).toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-sm font-medium mb-1">{item.query}</p>
                        <p className="text-sm text-muted-foreground">{item.result}</p>
                      </div>
                    ))}
                  </ScrollArea>
                </div>
              </TabsContent>

              <TabsContent value="history" className="h-full m-0">
                <div className="tab-panel p-6">
                  <ScrollArea className="h-[500px] rounded-md border p-4">
                    {analysisHistory.map((item) => (
                      <div key={item.id} className="mb-6 last:mb-0">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{item.type}</Badge>
                            <span className="text-sm text-muted-foreground">
                              {new Date(item.id).toLocaleDateString()}
                            </span>
                          </div>
                          <Button variant="ghost" size="sm">
                            <History className="w-4 h-4" />
                          </Button>
                        </div>
                        <p className="text-sm font-medium mb-1">{item.query}</p>
                        <p className="text-sm text-muted-foreground">{item.result}</p>
                      </div>
                    ))}
                  </ScrollArea>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </CardContent>
    </Card>
  )
} 