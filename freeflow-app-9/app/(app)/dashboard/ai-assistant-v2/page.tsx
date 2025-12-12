"use client"

import { useState } from 'react'
import {
  BentoCard,
  BentoQuickAction
} from '@/components/ui/bento-grid-advanced'
import {
  StatGrid,
  MiniKPI
} from '@/components/ui/results-display'
import {
  ModernButton,
  GradientButton,
  PillButton
} from '@/components/ui/modern-buttons'
import {
  Bot,
  Sparkles,
  MessageSquare,
  Zap,
  Brain,
  Lightbulb,
  CheckCircle,
  Clock,
  TrendingUp,
  Star
} from 'lucide-react'

/**
 * AI Assistant V2 - Groundbreaking AI-Powered Help
 * Showcases AI assistant features with modern components
 */
export default function AIAssistantV2() {
  const [selectedMode, setSelectedMode] = useState<'chat' | 'tasks' | 'insights'>('chat')
  const [messages, setMessages] = useState([
    { id: 1, type: 'ai', content: 'Hello! I\'m your AI assistant. How can I help you today?' },
    { id: 2, type: 'user', content: 'Can you help me analyze my project performance?' },
    { id: 3, type: 'ai', content: 'I\'d be happy to help! Based on your recent data, here are some key insights:\n\n• Revenue is up 23% this month\n• 5 projects ahead of schedule\n• Team velocity increased by 15%\n\nWould you like me to create a detailed report?' }
  ])

  const stats = [
    { label: 'Queries Handled', value: '1,247', change: 25.3, icon: <MessageSquare className="w-5 h-5" /> },
    { label: 'Tasks Automated', value: '342', change: 18.7, icon: <Zap className="w-5 h-5" /> },
    { label: 'Accuracy', value: '98%', change: 5.2, icon: <CheckCircle className="w-5 h-5" /> },
    { label: 'Time Saved', value: '47h', change: 32.1, icon: <Clock className="w-5 h-5" /> }
  ]

  const suggestions = [
    'Analyze project performance',
    'Generate weekly report',
    'Optimize team workflow',
    'Suggest growth strategies',
    'Review client feedback',
    'Create task breakdown'
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-violet-50/30 to-fuchsia-50/40 p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <Bot className="w-10 h-10 text-purple-600" />
              AI Assistant
            </h1>
            <p className="text-muted-foreground">Your intelligent business companion</p>
          </div>
          <GradientButton from="purple" to="fuchsia" onClick={() => console.log('Settings')}>
            <Sparkles className="w-5 h-5 mr-2" />
            AI Settings
          </GradientButton>
        </div>

        <StatGrid columns={4} stats={stats} />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <BentoQuickAction icon={<Brain />} title="Smart Insights" description="AI analysis" onClick={() => console.log('Insights')} />
          <BentoQuickAction icon={<Zap />} title="Automate" description="Tasks" onClick={() => console.log('Automate')} />
          <BentoQuickAction icon={<Lightbulb />} title="Suggestions" description="Ideas" onClick={() => console.log('Suggestions')} />
          <BentoQuickAction icon={<Star />} title="Templates" description="Prompts" onClick={() => console.log('Templates')} />
        </div>

        <div className="flex items-center gap-3">
          <PillButton variant={selectedMode === 'chat' ? 'primary' : 'ghost'} onClick={() => setSelectedMode('chat')}>
            <MessageSquare className="w-4 h-4 mr-2" />
            Chat
          </PillButton>
          <PillButton variant={selectedMode === 'tasks' ? 'primary' : 'ghost'} onClick={() => setSelectedMode('tasks')}>
            <Zap className="w-4 h-4 mr-2" />
            Tasks
          </PillButton>
          <PillButton variant={selectedMode === 'insights' ? 'primary' : 'ghost'} onClick={() => setSelectedMode('insights')}>
            <Brain className="w-4 h-4 mr-2" />
            Insights
          </PillButton>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <BentoCard className="p-6 h-[600px] flex flex-col">
              <div className="flex-1 overflow-y-auto mb-4 space-y-4">
                {messages.map((message) => (
                  <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] p-4 rounded-lg ${
                      message.type === 'user'
                        ? 'bg-purple-600 text-white'
                        : 'bg-muted'
                    }`}>
                      {message.type === 'ai' && (
                        <div className="flex items-center gap-2 mb-2">
                          <Bot className="w-4 h-4 text-purple-600" />
                          <span className="text-xs font-semibold text-purple-600">AI Assistant</span>
                        </div>
                      )}
                      <p className="text-sm whitespace-pre-line">{message.content}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Ask me anything..."
                    className="flex-1 px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <ModernButton variant="primary" onClick={() => console.log('Send')}>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Send
                  </ModernButton>
                </div>
              </div>
            </BentoCard>
          </div>

          <div className="space-y-6">
            <BentoCard className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-purple-600" />
                Suggestions
              </h3>
              <div className="space-y-2">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => console.log('Suggestion:', suggestion)}
                    className="w-full text-left p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors text-sm"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </BentoCard>

            <BentoCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">AI Capabilities</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <Brain className="w-5 h-5 text-purple-600" />
                  <div>
                    <p className="text-sm font-medium">Smart Analysis</p>
                    <p className="text-xs text-muted-foreground">Data insights</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <Zap className="w-5 h-5 text-purple-600" />
                  <div>
                    <p className="text-sm font-medium">Automation</p>
                    <p className="text-xs text-muted-foreground">Task handling</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <MessageSquare className="w-5 h-5 text-purple-600" />
                  <div>
                    <p className="text-sm font-medium">Conversation</p>
                    <p className="text-xs text-muted-foreground">Natural chat</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                  <div>
                    <p className="text-sm font-medium">Predictions</p>
                    <p className="text-xs text-muted-foreground">Trends & forecasts</p>
                  </div>
                </div>
              </div>
            </BentoCard>

            <BentoCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">Performance</h3>
              <div className="space-y-3">
                <MiniKPI label="Response Time" value="0.8s" change={-12.5} />
                <MiniKPI label="Accuracy Rate" value="98%" change={5.2} />
                <MiniKPI label="User Satisfaction" value="4.9/5" change={8.3} />
                <MiniKPI label="Daily Queries" value="847" change={25.3} />
              </div>
            </BentoCard>
          </div>
        </div>
      </div>
    </div>
  )
}
