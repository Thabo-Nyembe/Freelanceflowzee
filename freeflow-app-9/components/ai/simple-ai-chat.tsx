'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Bot, User, Zap, Brain, Palette, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  id: string;
  timestamp: Date;
  metadata?: {
    duration?: number;
    toolsUsed?: string[];
    model?: string;
  };
}

interface PerformanceMetrics {
  sessionDuration: number;
  messageCount: number;
  toolsUsed: number;
  uniqueTools: number;
  errorRate: number;
  avgResponseTime: number;
}

const quickActions = [
  {
    icon: Zap,
    label: '🎯 Project Analysis',
    prompt: 'Analyze my website redesign project with a $5000 budget and 8-week timeline. The client wants a modern e-commerce platform.',
    color: 'bg-blue-50 hover:bg-blue-100 border-blue-200'
  },
  {
    icon: Palette,
    label: '🎨 Creative Assets',
    prompt: 'Generate a modern color palette and typography suggestions for a technology startup targeting young professionals.',
    color: 'bg-purple-50 hover:bg-purple-100 border-purple-200'
  },
  {
    icon: Brain,
    label: '📧 Client Communication',
    prompt: 'Create a professional project update email for client Sarah about her branding project progress.',
    color: 'bg-green-50 hover:bg-green-100 border-green-200'
  },
  {
    icon: Clock,
    label: '⏰ Time Optimization',
    prompt: 'Help me optimize my 40-hour work week across 3 projects with different priorities and deadlines.',
    color: 'bg-orange-50 hover:bg-orange-100 border-orange-200'
  }
];

export default function SimpleAIChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    sessionDuration: 0,
    messageCount: 0,
    toolsUsed: 0,
    uniqueTools: 0,
    errorRate: 0,
    avgResponseTime: 0
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const sessionStartTime = useRef<Date>(new Date());

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const interval = setInterval(() => {
      const duration = Math.floor((Date.now() - sessionStartTime.current.getTime()) / 1000);
      setMetrics(prev => ({ ...prev, sessionDuration: duration }));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const sendMessage = async (messageContent: string) => {
    if (!messageContent.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: messageContent,
      id: Date.now().toString(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    const requestStartTime = Date.now();

    try {
      const response = await fetch('/api/ai/enhanced-stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(m => ({
            role: m.role,
            content: m.content
          }))
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');

      let assistantMessage = '';
      let toolsUsed: string[] = [];
      let model = '';

      const assistantMessageId = (Date.now() + 1).toString();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = new TextDecoder().decode(value);
        const lines = chunk.split('\n').filter(line => line.trim());

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              
              if (data.type === 'text-delta') {
                assistantMessage += data.textDelta;
                setMessages(prev => {
                  const updated = [...prev];
                  const lastMessage = updated[updated.length - 1];
                  if (lastMessage && lastMessage.role === 'assistant') {
                    lastMessage.content = assistantMessage;
                  } else {
                    updated.push({
                      role: 'assistant',
                      content: assistantMessage,
                      id: assistantMessageId,
                      timestamp: new Date()
                    });
                  }
                  return updated;
                });
              }

              if (data.type === 'tool-call') {
                toolsUsed.push(data.toolName);
              }

              if (data.type === 'finish') {
                model = data.model || 'gpt-4o';
                const responseTime = Date.now() - requestStartTime;
                
                setMessages(prev => {
                  const updated = [...prev];
                  const lastMessage = updated[updated.length - 1];
                  if (lastMessage && lastMessage.role === 'assistant') {
                    lastMessage.metadata = {
                      duration: responseTime,
                      toolsUsed,
                      model
                    };
                  }
                  return updated;
                });

                // Update metrics
                setMetrics(prev => ({
                  sessionDuration: prev.sessionDuration,
                  messageCount: prev.messageCount + 2,
                  toolsUsed: prev.toolsUsed + toolsUsed.length,
                  uniqueTools: new Set([...Array.from({length: prev.uniqueTools}), ...toolsUsed]).size,
                  errorRate: prev.errorRate,
                  avgResponseTime: Math.round((prev.avgResponseTime * (prev.messageCount / 2) + responseTime) / ((prev.messageCount / 2) + 1))
                }));
              }
            } catch (e) {
              console.log('Failed to parse JSON: ', line);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error: ', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        id: (Date.now() + 1).toString(),
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);

      setMetrics(prev => ({
        ...prev,
        errorRate: (prev.errorRate * prev.messageCount + 1) / (prev.messageCount + 1)
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = (prompt: string) => {
    sendMessage(prompt);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-slate-50 via-rose-50/30 to-violet-50/40">
      {/* Header */}
      <div className="border-b bg-white/80 backdrop-blur-xl px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">FreeFlowZee AI Assistant</h1>
              <p className="text-sm text-gray-600">AI-powered freelance workflow optimization</p>
            </div>
          </div>
          
          {/* Performance Metrics */}
          <div className="flex gap-4 text-sm">
            <div className="text-center">
              <div className="font-semibold text-blue-600">{formatTime(metrics.sessionDuration)}</div>
              <div className="text-gray-500">Session</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-purple-600">{metrics.messageCount}</div>
              <div className="text-gray-500">Messages</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-green-600">{metrics.uniqueTools}</div>
              <div className="text-gray-500">Tools Used</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-orange-600">{metrics.avgResponseTime}ms</div>
              <div className="text-gray-500">Avg Response</div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      {messages.length === 0 && (
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions for Freelancers</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {quickActions.map((action, index) => (
              <Card 
                key={index} 
                className={`cursor-pointer transition-all duration-200 border ${action.color}`}
                onClick={() => handleQuickAction(action.prompt)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <action.icon className="w-5 h-5 text-gray-700" />
                    <span className="font-medium text-gray-900">{action.label}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {message.role === 'assistant' && (
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg w-8 h-8 flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4" />
              </div>
            )}
            
            <div className={`max-w-3xl ${message.role === 'user' ? 'order-first' : ''}`}>
              <div
                className={`p-4 rounded-2xl ${
                  message.role === 'user'
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                    : 'bg-white shadow-sm border'
                }`}
              >
                <div className="whitespace-pre-wrap">{message.content}</div>
                
                {message.metadata && (
                  <div className="mt-3 pt-3 border-t border-gray-200 flex flex-wrap gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {message.metadata.model}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {message.metadata.duration}ms
                    </Badge>
                    {message.metadata.toolsUsed?.map((tool, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        🛠️ {tool}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="text-xs text-gray-500 mt-1">
                {message.timestamp.toLocaleTimeString()}
              </div>
            </div>

            {message.role === 'user' && (
              <div className="p-2 bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-lg w-8 h-8 flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}
        
        {isLoading && (
          <div className="flex gap-3 justify-start">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg w-8 h-8 flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-white shadow-sm border p-4 rounded-2xl">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-gray-600">AI is thinking...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t bg-white/80 backdrop-blur-xl p-6">
        <div className="flex gap-3">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me about project analysis, creative assets, client communication, or time optimization..."
            className="flex-1"
            onKeyPress={(e) => e.key === 'Enter' && sendMessage(input)}
            disabled={isLoading}
          />
          <Button
            onClick={() => sendMessage(input)}
            disabled={isLoading || !input.trim()}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
} 