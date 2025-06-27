"use client"

import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Wand2, 
  TrendingUp, 
  CheckCircle, 
  AlertCircle, 
  MessageSquare, 
  Send, 
  Zap, 
  Download,
  Brain,
  RefreshCw,
  Sparkles,
  Palette,
  Layout,
  Type,
  Target
} from 'lucide-react';

interface AIDesignSuggestion {
  id: string;
  type: 'color' | 'layout' | 'typography' | 'accessibility';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'implemented' | 'dismissed';
  timestamp: string;
}

interface AIDesignAnalysis {
  score: number;
  insights: string[];
  improvements: string[];
  strengths: string[];
  timestamp: string;
}

export default function AIDesignPage() {
  const [activeTab, setActiveTab] = useState('analyze');
  const [designDescription, setDesignDescription] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AIDesignAnalysis | null>(null);
  const [suggestions, setSuggestions] = useState<AIDesignSuggestion[]>([]);

  const handleAnalyze = async () => {
    if (!designDescription.trim()) return;
    
    setIsAnalyzing(true);
    try {
      const response = await fetch('/api/ai/design-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ designDescription })
      });
      
      const data = await response.json();
      if (data.success) {
        setAnalysis(data.analysis);
        setSuggestions(data.suggestions || []);
      }
    } catch (error) {
      console.error('Design analysis error:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSuggestionAction = async (id: string, action: 'implement' | 'dismiss') => {
    setSuggestions(prev => 
      prev.map(suggestion => 
        suggestion.id === id 
          ? { ...suggestion, status: action === 'implement' ? 'implemented' : 'dismissed' }
          : suggestion
      )
    );
  };

  const getPriorityColor = (priority: AIDesignSuggestion['priority']) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="container mx-auto py-6">
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">AI Design Assistant</h1>
            <p className="text-muted-foreground mt-2">Get AI-powered design analysis and suggestions</p>
          </div>
          <TabsList>
            <TabsTrigger value="analyze" className="flex items-center gap-2">
              <Brain className="w-4 h-4" />
              Analyze Design
            </TabsTrigger>
            <TabsTrigger value="suggestions" className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Suggestions
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="analyze">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Design Analysis</CardTitle>
                <CardDescription>
                  Describe your design and get AI-powered insights and recommendations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Textarea
                    placeholder="Describe your design in detail (e.g., colors, layout, typography, target audience)..."
                    value={designDescription}
                    onChange={(e) => setDesignDescription(e.target.value)}
                    rows={6}
                  />
                  <Button 
                    onClick={handleAnalyze} 
                    disabled={isAnalyzing || !designDescription.trim()}
                    className="w-full"
                  >
                    {isAnalyzing ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Wand2 className="w-4 h-4 mr-2" />
                        Analyze Design
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {analysis && (
              <Card>
                <CardHeader>
                  <CardTitle>Analysis Results</CardTitle>
                  <CardDescription>
                    AI-generated insights based on your design description
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Design Score */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-sm font-medium">Design Score</div>
                        <div className="text-sm text-muted-foreground">{analysis.score}/100</div>
                      </div>
                      <Progress value={analysis.score} className="h-2" />
                    </div>

                    {/* Strengths */}
                    <div>
                      <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        Design Strengths
                      </h3>
                      <ul className="space-y-2">
                        {analysis.strengths.map((strength, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-green-500 mt-1" />
                            <span>{strength}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Areas for Improvement */}
                    <div>
                      <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-blue-500" />
                        Areas for Improvement
                      </h3>
                      <ul className="space-y-2">
                        {analysis.improvements.map((improvement, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <AlertCircle className="w-4 h-4 text-blue-500 mt-1" />
                            <span>{improvement}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Key Insights */}
                    <div>
                      <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                        <Zap className="w-5 h-5 text-purple-500" />
                        Key Insights
                      </h3>
                      <ul className="space-y-2">
                        {analysis.insights.map((insight, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <MessageSquare className="w-4 h-4 text-purple-500 mt-1" />
                            <span>{insight}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Export Button */}
                    <Button variant="outline" className="w-full">
                      <Download className="w-4 h-4 mr-2" />
                      Export Analysis
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="suggestions">
          <div className="grid gap-6">
            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle>Design Suggestions</CardTitle>
                <CardDescription>
                  AI-generated suggestions to improve your design
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" className="gap-2">
                    <Palette className="w-4 h-4" />
                    Colors
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Layout className="w-4 h-4" />
                    Layout
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Type className="w-4 h-4" />
                    Typography
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Target className="w-4 h-4" />
                    Accessibility
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Suggestions List */}
            {suggestions.map((suggestion) => (
              <Card key={suggestion.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{suggestion.title}</CardTitle>
                      <CardDescription>{suggestion.description}</CardDescription>
                    </div>
                    <Badge variant="outline" className={getPriorityColor(suggestion.priority)}>
                      {suggestion.priority}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {suggestion.type === 'color' && <Palette className="w-4 h-4" />}
                      {suggestion.type === 'layout' && <Layout className="w-4 h-4" />}
                      {suggestion.type === 'typography' && <Type className="w-4 h-4" />}
                      {suggestion.type === 'accessibility' && <Target className="w-4 h-4" />}
                      <span className="text-sm text-muted-foreground capitalize">{suggestion.type}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {suggestion.status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleSuggestionAction(suggestion.id, 'dismiss')}
                          >
                            Dismiss
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleSuggestionAction(suggestion.id, 'implement')}
                          >
                            Implement
                          </Button>
                        </>
                      )}
                      {suggestion.status === 'implemented' && (
                        <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                          Implemented
                        </Badge>
                      )}
                      {suggestion.status === 'dismissed' && (
                        <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-200">
                          Dismissed
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {suggestions.length === 0 && (
              <Card>
                <CardContent className="py-8">
                  <div className="text-center text-muted-foreground">
                    <Sparkles className="w-8 h-8 mx-auto mb-4" />
                    <p>No suggestions yet. Analyze your design to get AI-powered recommendations.</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
