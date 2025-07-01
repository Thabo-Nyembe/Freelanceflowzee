'use client';

import { useChat } from '@ai-sdk/react';
import { useState } from 'react';
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Brain, 
  Palette, 
  MessageSquare, 
  Clock, 
  DollarSign,
  Lightbulb,
  Target,
  TrendingUp,
  Send,
  Bot,
  User,
  Loader2,
} from 'lucide-react';

interface ToolVisualizationProps {
  toolName: string;
  input: any;
  result: any;
}

const ToolVisualization: React.FC<ToolVisualizationProps> = ({ toolName, input, result }) => {
  switch (toolName) {
    case 'projectAnalysis':
      return (
        <Card className="my-4 border-blue-200 bg-blue-50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <Brain className="w-5 h-5" />
              Project Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Badge variant="outline" className="mb-2">
                {input.projectType} • Budget: ${input.budget.toLocaleString()}
              </Badge>
              <p className="text-sm text-gray-600">{input.clientRequirements}</p>
            </div>
            
            {result && (
              <>
                <div>
                  <h4 className="font-medium text-blue-800 mb-2">Recommended Workflow</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {result.recommendedSteps.map((step: string, idx: number) => (
                      <div key={idx} className="flex items-center gap-2 text-sm">
                        <span className="w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-xs">
                          {idx + 1}
                        </span>
                        {step}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-blue-800 mb-2 flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      Timeline
                    </h4>
                    <p className="text-sm bg-white p-2 rounded">{result.timeEstimate}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-blue-800 mb-2 flex items-center gap-1">
                      <DollarSign className="w-4 h-4" />
                      Pricing
                    </h4>
                    <p className="text-lg font-bold text-green-600">${result.pricing.suggested.toLocaleString()}</p>
                  </div>
                </div>

                {result.riskFactors.length > 0 && (
                  <div>
                    <h4 className="font-medium text-orange-600 mb-2">Risk Factors</h4>
                    <div className="flex flex-wrap gap-2">
                      {result.riskFactors.map((risk: string, idx: number) => (
                        <Badge key={idx} variant="secondary" className="bg-orange-100 text-orange-800">
                          {risk}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      );

    case 'creativeAsset':
      return (
        <Card className="my-4 border-purple-200 bg-purple-50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-purple-800">
              <Palette className="w-5 h-5" />
              Creative Assets
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Badge variant="outline" className="mb-2">
                {input.assetType} • {input.style} Style
              </Badge>
              <p className="text-sm text-gray-600">
                For {input.industry} targeting {input.targetAudience}
              </p>
            </div>
            
            {result && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {result.suggestions.map((suggestion: any, idx: number) => (
                    <div key={idx} className="bg-white p-3 rounded-lg border">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium text-purple-800">{suggestion.name}</h4>
                        {suggestion.code && (
                          <div 
                            className="w-4 h-4 rounded border" 
                            style={{ backgroundColor: suggestion.code }}
                          />
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{suggestion.description}</p>
                      {suggestion.url && (
                        <a 
                          href={suggestion.url} 
                          target="_blank" 
                          rel="noopener noreferrer
                          className="text-xs text-purple-600 hover:underline"
                        >
                          View Resource →
                        </a>
                      )}
                    </div>
                  ))}
                </div>"
                <p className="text-sm text-purple-700 bg-white p-2 rounded">
                  {result.rationale}
                </p>
              </>
            )}
          </CardContent>
        </Card>
      );

    case 'clientCommunication':
      return (
        <Card className="my-4 border-green-200 bg-green-50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-green-800">
              <MessageSquare className="w-5 h-5" />
              Client Communication
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Badge variant="outline" className="mb-2">
                {input.communicationType} • {input.projectName}
              </Badge>
            </div>
            
            {result && (
              <>
                <div className="bg-white p-4 rounded-lg border">
                  <h4 className="font-medium text-green-800 mb-2">Subject</h4>
                  <p className="text-sm font-medium">{result.subject}</p>
                </div>

                <div className="bg-white p-4 rounded-lg border">
                  <h4 className="font-medium text-green-800 mb-2">Message</h4>
                  <p className="text-sm whitespace-pre-line">{result.body}</p>
                </div>

                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    Tone: {result.tone}
                  </Badge>
                  <Button size="sm" className="bg-green-600 hover:bg-green-700">
                    Copy to Clipboard
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      );

    case 'timeBudget':
      return (
        <Card className="my-4 border-orange-200 bg-orange-50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <TrendingUp className="w-5 h-5" />
              Time & Budget Optimization
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {result && (
              <>
                <div className="space-y-3">
                  {result.allocation.map((phase: any, idx: number) => (
                    <div key={idx} className="bg-white p-3 rounded-lg border">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-orange-800">{phase.phase}</h4>
                        <Badge variant={phase.priority === 'critical' ? 'destructive' : 'default'}>
                          {phase.priority}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Hours: </span>
                          <span className="font-medium">{phase.hours}h</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Budget: </span>
                          <span className="font-medium">${phase.budget.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-white p-3 rounded-lg border">
                  <h4 className="font-medium text-orange-800 mb-2">Recommendations</h4>
                  <ul className="text-sm space-y-1">
                    {result.recommendations.map((rec: string, idx: number) => (
                      <li key={idx} className="flex items-center gap-2">
                        <Lightbulb className="w-3 h-3 text-orange-600" />
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      );

    default:
      return null;
  }
};

export default function EnhancedAIChat() {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/ai/enhanced-stream',
  });

  const quickPrompts = [
    {
      icon: Brain,
      label: 'Analyze Project',
      prompt: 'Help me analyze a new website project with a $3,000 budget for a local restaurant. The client wants modern design with online ordering capabilities.',
    },
    {
      icon: Palette,
      label: 'Generate Assets',
      prompt: 'Generate a color palette and typography suggestions for a tech startup in the fintech industry targeting young professionals.',
    },
    {
      icon: MessageSquare,
      label: 'Draft Communication',
      prompt: 'Help me write a professional project update email for the "Brand Redesign" project for client Sarah Johnson.',
    },
    {
      icon: TrendingUp,
      label: 'Optimize Timeline',
      prompt: 'Help me optimize time and budget allocation for a 40-hour, $4,000 e-commerce project with phases: research, design, development, and testing.',
    },
  ];

  const handleQuickPrompt = (prompt: string) => {
    handleInputChange({ target: { value: prompt } } as any);
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-blue-50 via-purple-50 to-green-50">
      {/* Header */}
      <div className="border-b bg-white/80 backdrop-blur-sm p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">FreeflowZee AI Assistant</h2>
              <p className="text-sm text-gray-600">Your intelligent project companion</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? 'Collapse' : 'Expand'}
          </Button>
        </div>
      </div>

      {/* Quick Actions */}
      {!isExpanded && (
        <div className="p-4 border-b bg-white/50">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {quickPrompts.map((prompt, idx) => (
              <Button
                key={idx}
                variant="outline"
                size="sm
                className="flex items-center gap-2 h-auto p-3 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50"
                onClick={() => handleQuickPrompt(prompt.prompt)}
              >"
                <prompt.icon className="w-4 h-4" />
                <span className="text-xs">{prompt.label}</span>
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Target className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Ready to boost your productivity?</h3>
            <p className="text-gray-600 mb-4">Ask me to analyze projects, generate assets, draft communications, or optimize workflows.</p>
            <div className="flex flex-wrap justify-center gap-2">
              {quickPrompts.map((prompt, idx) => (
                <Button
                  key={idx}
                  variant="outline"
                  size="sm
                  onClick={() => handleQuickPrompt(prompt.prompt)}
                  className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50"
                >
                  {prompt.label}
                </Button>
              ))}
            </div>
          </div>
        )}

        {messages.map((message) => (
          <div key={message.id} className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] ${message.role === 'user' ? 'order-2' : 'order-1'}`}>
              {message.role === 'user' ? ("
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-3 rounded-lg">
                  <p className="text-sm">{message.content}</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="bg-white border p-3 rounded-lg shadow-sm">
                    <p className="text-sm text-gray-800 whitespace-pre-wrap">{message.content}</p>
                  </div>

                  {/* Render tool visualizations */}
                  {message.toolInvocations?.map((toolInvocation, partIdx) => (
                    <ToolVisualization
                      key={partIdx}
                      toolName={toolInvocation.toolName}
                      input={toolInvocation.args}
                      result={toolInvocation.result}
                    />
                  ))}
                </div>
              )}
            </div>
            
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${message.role === 'user' ? 'order-1 bg-gradient-to-br from-blue-600 to-purple-600' : 'order-2 bg-gradient-to-br from-green-600 to-blue-600'}`}>
              {message.role === 'user' ? (
                <User className="w-4 h-4 text-white" />
              ) : (
                <Bot className="w-4 h-4 text-white" />
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 bg-gradient-to-br from-green-600 to-blue-600 rounded-full flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="bg-white border p-3 rounded-lg shadow-sm">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Loader2 className="w-4 h-4 animate-spin" />
                AI is thinking...
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t bg-white/80 backdrop-blur-sm p-4">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            value={input}
            onChange={handleInputChange}
            placeholder="Ask me anything about your projects, clients, or creative workflow..."
            className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isLoading}
          />
          <Button "
            type="submit" 
            disabled={isLoading || !input.trim()}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >"
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
} 