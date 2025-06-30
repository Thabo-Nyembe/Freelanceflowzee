'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useFreeflowAI, ProjectAnalysisInput, CreativeAssetInput, ClientCommunicationInput, TimeBudgetInput } from '@/hooks/use-freeflow-ai';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Brain, 
  Palette, 
  MessageSquare, 
  Clock, 
  Send,
  Bot,
  User,
  Loader2,
  Target,
  TrendingUp,
  RefreshCw,
  BarChart3,
} from 'lucide-react';
import { UIMessage } from '@ai-sdk/react';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  id: string;
  timestamp?: Date;
  toolInvocations?: any[];
}

export default function SimpleAIChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const {
    isLoading,
    error,
    analyzeProject,
    generateCreativeAssets,
    generateClientCommunication,
    optimizeTimeBudget,
    chatWithContext,
    resetConversation,
    performanceMetrics,
    generateText,
    streamText,
  } = useFreeflowAI();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const createMessage = (role: Message['role'], content: string): Message => ({
    id: Math.random().toString(36).substring(7),
    role,
    content,
    timestamp: new Date(),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = createMessage('user', input);
    setMessages(prev => [...prev, userMessage]);
    setInput('');

    try {
      if (isStreaming) {
        // Streaming mode
        let streamedContent = '';
        const assistantMessage = createMessage('assistant', '');
        setMessages(prev => [...prev, assistantMessage]);

        await streamText(
          input,
          {
            system: 'You are a helpful AI assistant.',
            temperature: 0.7,
          },
          (chunk) => {
            streamedContent += chunk;
            setMessages(prev => [
              ...prev.slice(0, -1),
              { ...assistantMessage, content: streamedContent }
            ]);
          }
        );
      } else {
        // Non-streaming mode
        const response = await generateText(input, {
          system: 'You are a helpful AI assistant.',
          temperature: 0.7,
        });

        setMessages(prev => [...prev, createMessage('assistant', response.text)]);
      }
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const handleQuickAction = (actionType: string) => {
    switch (actionType) {
      case 'project-analysis':
        const projectInput: ProjectAnalysisInput = {
          projectType: 'website',
          budget: 5000,
          timeline: '6 weeks',
          clientRequirements: 'Modern e-commerce website with payment integration and mobile responsiveness',
        };
        analyzeProject(projectInput);
        break;

      case 'creative-assets':
        const creativeInput: CreativeAssetInput = {
          assetType: 'color-palette',
          style: 'modern minimalist',
          industry: 'technology',
          targetAudience: 'young professionals',
        };
        generateCreativeAssets(creativeInput);
        break;

      case 'client-communication':
        const communicationInput: ClientCommunicationInput = {
          communicationType: 'proposal',
          projectContext: 'Brand redesign project',
          clientName: 'Tech Startup Inc.',
          urgency: 'medium',
        };
        generateClientCommunication(communicationInput);
        break;

      case 'time-budget':
        const timeBudgetInput: TimeBudgetInput = {
          availableHours: 40,
          projectCount: 3,
          deadlines: ['2024-02-15', '2024-03-01', '2024-03-15'],
          priorities: ['high', 'medium', 'urgent'],
        };
        optimizeTimeBudget(timeBudgetInput);
        break;

      default:
        chatWithContext('Hello! Can you help me with my freelance work?');
    }
  };

  const quickActions = [
    {
      id: 'project-analysis',
      icon: Brain,
      label: 'Analyze Project',
      description: 'Get comprehensive project analysis',
      gradient: 'from-blue-500 to-purple-600',
    },
    {
      id: 'creative-assets',
      icon: Palette,
      label: 'Generate Assets',
      description: 'Create design suggestions',
      gradient: 'from-purple-500 to-pink-600',
    },
    {
      id: 'client-communication',
      icon: MessageSquare,
      label: 'Draft Communication',
      description: 'Professional client emails',
      gradient: 'from-green-500 to-blue-600',
    },
    {
      id: 'time-budget',
      icon: Clock,
      label: 'Optimize Timeline',
      description: 'Smart resource allocation',
      gradient: 'from-orange-500 to-red-600',
    },
  ];

  return (
    <div className="flex flex-col h-full max-h-[800px] bg-gradient-to-br from-blue-50 via-purple-50 to-green-50 rounded-lg border">
      {/* Header */}
      <div className="border-b bg-white/80 backdrop-blur-sm p-4 rounded-t-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">FreeflowZee AI Assistant</h2>
              <p className="text-sm text-gray-600">Enhanced with streaming AI SDK 5.0</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={resetConversation}
              className="text-gray-600 hover:text-gray-800"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
            <Badge variant="outline" className="text-xs">
              <BarChart3 className="w-3 h-3 mr-1" />
              {performanceMetrics.messageCount} msgs
            </Badge>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      {performanceMetrics.messageCount > 0 && (
        <div className="px-4 py-2 bg-white/50 border-b text-xs text-gray-600">
          <div className="flex justify-between items-center">
            <span>Session: {performanceMetrics.sessionDuration}s</span>
            <span>Tools used: {performanceMetrics.uniqueTools}</span>
            <span>Avg response: {performanceMetrics.avgResponseTime}s</span>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      {messages.length === 0 && (
        <div className="p-4 border-b bg-white/50">
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((action) => (
              <Button
                key={action.id}
                variant="outline"
                onClick={() => handleQuickAction(action.id)}
                disabled={isLoading}
                className={`h-auto p-4 flex flex-col items-center gap-2 hover:bg-gradient-to-r hover:${action.gradient} hover:text-white transition-all duration-200`}
              >
                <action.icon className="w-5 h-5" />
                <div className="text-center">
                  <div className="font-medium text-sm">{action.label}</div>
                  <div className="text-xs opacity-70">{action.description}</div>
                </div>
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
            <h3 className="text-lg font-medium text-gray-900 mb-2">Ready to enhance your workflow?</h3>
            <p className="text-gray-600 mb-4">
              Use the quick actions above or start a conversation below. I can help with project analysis, 
              creative assets, client communication, and time management.
            </p>
            <div className="flex flex-wrap justify-center gap-2 mt-4">
              <Badge variant="secondary" className="text-xs">🚀 AI SDK 5.0</Badge>
              <Badge variant="secondary" className="text-xs">⚡ Streaming</Badge>
              <Badge variant="secondary" className="text-xs">🔧 Tools Ready</Badge>
            </div>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[80%] ${message.role === 'user' ? 'order-2' : 'order-1'}`}>
              {message.role === 'user' ? (
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-3 rounded-lg shadow-sm">
                  <p className="text-sm">{message.content}</p>
                  <div className="text-xs opacity-75 mt-1">
                    {message.timestamp?.toLocaleTimeString()}
                  </div>
                </div>
              ) : (
                <div className="bg-white border p-4 rounded-lg shadow-sm">
                  <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
                    {message.content}
                  </p>
                  <div className="text-xs text-gray-500 mt-2 flex items-center justify-between">
                    <span>{message.timestamp?.toLocaleTimeString()}</span>
                    {message.toolInvocations && (
                      <Badge variant="outline" className="text-xs">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        Tool used
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
              message.role === 'user' 
                ? 'order-1 bg-gradient-to-br from-blue-600 to-purple-600' 
                : 'order-2 bg-gradient-to-br from-green-600 to-blue-600'
            }`}>
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

        {error && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="bg-red-50 border border-red-200 p-3 rounded-lg">
              <div className="text-sm text-red-600">
                Error: {error}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t bg-white/80 backdrop-blur-sm p-4 rounded-b-lg">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me anything about your projects, clients, or creative workflow..."
            className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            disabled={isLoading}
          />
          <Button 
            type="submit" 
            disabled={isLoading || !input.trim()}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-4"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
        <div className="text-xs text-gray-500 mt-2 text-center">
          Powered by AI SDK 5.0 • Enhanced streaming • Advanced tool integration
        </div>
      </div>
    </div>
  );
} 