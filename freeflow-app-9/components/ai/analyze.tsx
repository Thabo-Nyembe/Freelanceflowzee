'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

interface Analysis {
  category: string
  score: number
  insights: string[]
  recommendations: string[]
}

export function AIAnalyze() {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [results, setResults] = useState<Analysis[]>([])
  const [progress, setProgress] = useState(0)

  const startAnalysis = async () => {
    setIsAnalyzing(true)
    setProgress(0)
    setResults([])

    try {
      const response = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Analysis failed')
      }

      const data = await response.json()
      setResults(data.results)
      setProgress(100)
    } catch (error) {
      console.error('Analysis error:', error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <div className="flex flex-col space-y-6">
      <div className="flex justify-between items-center">
        <Button onClick={startAnalysis} disabled={isAnalyzing}>
          {isAnalyzing ? 'Analyzing...' : 'Start Analysis'}
        </Button>
        <Progress value={progress} className="w-64" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {results.map((result, index) => (
          <Card key={index} className="p-6">
            <h3 className="text-lg font-semibold mb-2">{result.category}</h3>
            <div className="flex items-center mb-4">
              <Progress value={result.score * 100} className="flex-1 mr-2" />
              <span className="text-sm font-medium">{Math.round(result.score * 100)}%</span>
            </div>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Insights</h4>
                <ul className="list-disc list-inside space-y-1">
                  {result.insights.map((insight, i) => (
                    <li key={i} className="text-sm">{insight}</li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Recommendations</h4>
                <ul className="list-disc list-inside space-y-1">
                  {result.recommendations.map((rec, i) => (
                    <li key={i} className="text-sm">{rec}</li>
                  ))}
                </ul>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
} 