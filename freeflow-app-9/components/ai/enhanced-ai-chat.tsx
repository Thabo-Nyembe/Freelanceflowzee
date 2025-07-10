'use client';

import { useChat } from '@ai-sdk/react';
import { useState } from 'react';
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Brain, 
  Palette, 
  MessageSquare, 
  TrendingUp,
  Send,
  Bot,
  User,
  Loader2,
} from 'lucide-react';
import { ToolInvocation } from 'ai';

interface ToolVisualizationProps {
  toolInvocation: ToolInvocation
}

const ToolVisualization: React.FC<ToolVisualizationProps> = ({ toolInvocation }) => {
  const { toolName, args } = toolInvocation;
  // Note: 'result' is not available on the toolInvocation object in the new SDK version this way.
  // This component will need to be adapted to receive results separately if needed.

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
                {args.projectType} • Budget: ${args.budget.toLocaleString()}
              </Badge>
              <p className="text-sm text-gray-600">{args.clientRequirements}</p>
            </div>
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
                {args.assetType} • {args.style} Style
              </Badge>
              <p className="text-sm text-gray-600">
                For {args.industry} targeting {args.targetAudience}
              </p>
            </div>
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
                {args.communicationType} • {args.projectName}
              </Badge>
            </div>
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
        </Card>
      );

    default:
      return null;
  }
};

export default function EnhancedAIChat() {
  const [isExpanded, setIsExpanded] = useState<any>(false);
  
  const { messages, input, handleInputChange, handleSubmit, status } = useChat({
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
    handleInputChange({ target: { value: prompt } } as React.ChangeEvent<HTMLInputElement>);
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
            size="sm"
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
                size="sm"
                className="flex items-center gap-2 h-auto p-3 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50"
                onClick={() => handleQuickPrompt(prompt.prompt)}
              >
                <prompt.icon className="w-4 h-4" />
                <span className="text-xs">{prompt.label}</span>
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] ${message.role === 'user' ? 'order-2' : 'order-1'}`}>
              {message.role === 'user' ? (
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-3 rounded-lg">
                  <p className="text-sm">{message.content}</p>
                </div>
              ) : (
                <div className="bg-white p-3 rounded-lg border shadow-sm">
                  {message.parts.map((part, index) => {
                    if (part.type === 'text') {
                      return <p key={index} className="text-sm text-gray-800">{part.text}</p>;
                    }
                    if (part.type === 'tool-invocation') {
                      return <ToolVisualization key={index} toolInvocation={part.toolInvocation} />;
                    }
                    return null;
                  })}
                </div>
              )}
            </div>
            <div className={`w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center ${message.role === 'user' ? 'order-1' : 'order-2'}`}>
              {message.role === 'user' ? <User className="w-5 h-5 text-gray-600" /> : <Bot className="w-5 h-5 text-gray-600" />}
            </div>
          </div>
        ))}
         {status === 'streaming' && (
          <div className="flex justify-start">
             <div className="bg-white p-3 rounded-lg border shadow-sm flex items-center gap-2">
               <Loader2 className="w-5 h-5 text-gray-500 animate-spin" />
               <p className="text-sm text-gray-500">AI is thinking...</p>
             </div>
           </div>
         )}
      </div>

      {/* Input Form */}
      <div className="border-t bg-white/80 backdrop-blur-sm p-4">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <input
            className="flex-1 p-2 border rounded-lg"
            value={input}
            placeholder="Ask AI to do something..."
            onChange={handleInputChange}
            disabled={status !== 'ready'}
          />
          <Button
            type="submit" 
            disabled={status !== 'ready' || !input.trim()}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
} 