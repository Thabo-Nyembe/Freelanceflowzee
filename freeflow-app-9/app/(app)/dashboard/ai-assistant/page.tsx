"use client"

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Brain, 
  MessageSquare, 
  Lightbulb, 
  Zap,
  Send,
  FileText,
  Plus,
  Mic,
  Image,
  Settings,
  Download,
  Upload
} from 'lucide-react';

export default function AIAssistantPage() {
  const [message, setMessage] = useState('');
  const [conversation, setConversation] = useState([
    {
      id: 1,
      type: 'assistant',
      content: 'Hello! I\'m your AI assistant. How can I help you today?',
      timestamp: new Date()
    }
  ]);

  const handleSendMessage = () => {
    if (!message.trim()) return;
    
    // Add user message
    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: message,
      timestamp: new Date()
    };
    
    setConversation(prev => [...prev, userMessage]);
    
    // Simulate AI response
    setTimeout(() => {
      const aiResponse = {
        id: Date.now() + 1,
        type: 'assistant',
        content: `I understand you said: "${message}". Here's how I can help you with that...`,
        timestamp: new Date()
      };
      setConversation(prev => [...prev, aiResponse]);
    }, 1000);
    
    setMessage('');
    alert('AI Assistant message sent successfully!');
  };

  const quickActions = [
    {
      title: 'Content Generation',
      description: 'Generate content for your projects',
      icon: FileText,
      action: () => alert('Content generation started!'),
      testId: 'ai-generate-content-btn'
    },
    {
      title: 'Smart Analysis',
      description: 'Analyze your project data',
      icon: Brain,
      action: () => alert('AI analysis initiated!'),
      testId: 'ai-analyze-btn'
    },
    {
      title: 'Optimization',
      description: 'Optimize your workflows',
      icon: Zap,
      action: () => alert('Optimization process started!'),
      testId: 'ai-optimize-btn'
    },
    {
      title: 'Creative Ideas',
      description: 'Get creative suggestions',
      icon: Lightbulb,
      action: () => alert('Creative ideas generated!'),
      testId: 'ai-creative-btn'
    },
    {
      title: 'Voice Input',
      description: 'Use voice commands',
      icon: Mic,
      action: () => alert('Voice input activated!'),
      testId: 'ai-voice-btn'
    },
    {
      title: 'Image Analysis',
      description: 'Analyze and describe images',
      icon: Image,
      action: () => alert('Image analysis started!'),
      testId: 'ai-image-btn'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">AI Assistant</h1>
          <p className="text-gray-600 mt-2">
            Your intelligent assistant for project management and creativity
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" data-testid="ai-settings-btn">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
          <Button data-testid="new-conversation-btn">
            <MessageSquare className="w-4 h-4 mr-2" />
            New Conversation
          </Button>
        </div>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick AI Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <button
                  key={index}
                  onClick={action.action}
                  data-testid={action.testId}
                  className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-left group"
                >
                  <div className="p-2 rounded-lg bg-violet-50 w-fit">
                    <Icon className="w-5 h-5 text-violet-600" />
                  </div>
                  <h4 className="font-medium text-gray-900 mt-3 group-hover:text-violet-600 transition-colors">
                    {action.title}
                  </h4>
                  <p className="text-sm text-gray-500 mt-1">{action.description}</p>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Main Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="h-[600px] flex flex-col">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Chat with AI</CardTitle>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" data-testid="export-chat-btn">
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" data-testid="import-chat-btn">
                    <Upload className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                {conversation.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] p-3 rounded-lg ${
                        msg.type === 'user'
                          ? 'bg-violet-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <p>{msg.content}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {msg.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="space-y-2">
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your message..."
                  rows={3}
                  className="resize-none"
                />
                <div className="flex gap-2">
                  <Button 
                    onClick={handleSendMessage}
                    data-testid="send-message-btn"
                    className="flex-1"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Send Message
                  </Button>
                  <Button 
                    variant="outline"
                    data-testid="voice-input-btn"
                  >
                    <Mic className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="outline"
                    data-testid="attach-file-btn"
                  >
                    <Upload className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {/* AI Capabilities */}
          <Card>
            <CardHeader>
              <CardTitle>AI Capabilities</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900">Content Creation</h4>
                <p className="text-sm text-blue-700">Generate high-quality content for your projects</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <h4 className="font-medium text-green-900">Data Analysis</h4>
                <p className="text-sm text-green-700">Analyze and interpret your project data</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <h4 className="font-medium text-purple-900">Workflow Optimization</h4>
                <p className="text-sm text-purple-700">Optimize your processes for better efficiency</p>
              </div>
              <div className="p-3 bg-amber-50 rounded-lg">
                <h4 className="font-medium text-amber-900">Creative Assistance</h4>
                <p className="text-sm text-amber-700">Get creative ideas and suggestions</p>
              </div>
            </CardContent>
          </Card>

          {/* Recent Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                <FileText className="w-4 h-4 text-violet-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Content Generated</p>
                  <p className="text-xs text-gray-500">2 hours ago</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                <Brain className="w-4 h-4 text-blue-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Data Analyzed</p>
                  <p className="text-xs text-gray-500">1 day ago</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                <Zap className="w-4 h-4 text-amber-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Workflow Optimized</p>
                  <p className="text-xs text-gray-500">3 days ago</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                data-testid="ai-model-settings-btn"
              >
                <Settings className="w-4 h-4 mr-2" />
                AI Model Settings
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                data-testid="conversation-history-btn"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Conversation History
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                data-testid="export-data-btn"
              >
                <Download className="w-4 h-4 mr-2" />
                Export Data
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}