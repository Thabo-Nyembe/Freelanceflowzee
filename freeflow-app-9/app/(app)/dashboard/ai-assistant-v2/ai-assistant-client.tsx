'use client'

import { useState, useRef, useEffect } from 'react'
import StatGrid from '@/components/dashboard-results/StatGrid'
import BentoQuickAction from '@/components/dashboard-results/BentoQuickAction'
import PillButton from '@/components/modern-button-suite/PillButton'
import MiniKPI from '@/components/dashboard-results/MiniKPI'
import ActivityFeed from '@/components/dashboard-results/ActivityFeed'
import RankingList from '@/components/dashboard-results/RankingList'
import {
  useAIAssistant,
  getConversationModeColor,
  getMessageRoleColor,
  formatTokens,
  formatCost,
  formatLatency,
  getRelativeTime,
  type AIConversation,
  type AIMessage
} from '@/lib/hooks/use-ai-assistant'

type ViewMode = 'chat' | 'conversations' | 'starred'

interface AIAssistantClientProps {
  initialConversations: AIConversation[]
}

export default function AIAssistantClient({ initialConversations }: AIAssistantClientProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('chat')
  const [inputMessage, setInputMessage] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const {
    conversations,
    messages,
    activeConversation,
    stats,
    isLoading,
    isSending,
    createConversation,
    sendMessage,
    fetchMessages,
    toggleStar,
    toggleArchive,
    deleteConversation,
    setActiveConversation
  } = useAIAssistant(initialConversations)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return

    if (!activeConversation) {
      const newConversation = await createConversation('New Chat', 'chat')
      if (newConversation) {
        await sendMessage(inputMessage, 'user')
      }
    } else {
      await sendMessage(inputMessage, 'user')
    }

    setInputMessage('')
  }

  const handleSelectConversation = async (conversation: AIConversation) => {
    setActiveConversation(conversation)
    await fetchMessages(conversation.id)
    setViewMode('chat')
  }

  const handleNewChat = async () => {
    await createConversation('New Chat', 'chat')
    setViewMode('chat')
  }

  const suggestions = [
    'Analyze project performance',
    'Generate weekly report',
    'Optimize team workflow',
    'Suggest growth strategies',
    'Review client feedback',
    'Create task breakdown'
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-violet-50 dark:bg-none dark:bg-gray-900">
      <div className="max-w-[1600px] mx-auto p-6 space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent flex items-center gap-3">
              🤖 AI Assistant
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Your intelligent business companion
            </p>
          </div>
          <button
            onClick={handleNewChat}
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-violet-600 text-white rounded-lg hover:shadow-lg hover:shadow-purple-500/50 transition-all duration-300"
          >
            New Chat
          </button>
        </div>

        {/* Stats Grid */}
        <StatGrid
          stats={[
            {
              label: 'Conversations',
              value: stats.totalConversations.toString(),
              change: '+15%',
              trend: 'up' as const,
              subtitle: 'total chats'
            },
            {
              label: 'Messages',
              value: stats.totalMessages.toString(),
              change: '+32%',
              trend: 'up' as const,
              subtitle: 'exchanged'
            },
            {
              label: 'Tokens Used',
              value: formatTokens(stats.totalTokens),
              change: '+18%',
              trend: 'up' as const,
              subtitle: 'this month'
            },
            {
              label: 'Total Cost',
              value: formatCost(stats.totalCost),
              change: '+12%',
              trend: 'up' as const,
              subtitle: 'API usage'
            }
          ]}
        />

        {/* Quick Actions */}
        <BentoQuickAction
          actions={[
            { label: 'Smart Insights', icon: '🧠', onClick: () => {} },
            { label: 'Automate Tasks', icon: '⚡', onClick: () => {} },
            { label: 'Get Suggestions', icon: '💡', onClick: () => {} },
            { label: 'Templates', icon: '⭐', onClick: () => {} },
            { label: 'History', icon: '📜', onClick: () => setViewMode('conversations') },
            { label: 'Starred', icon: '⭐', onClick: () => setViewMode('starred') },
            { label: 'Settings', icon: '⚙️', onClick: () => {} },
            { label: 'Help', icon: '❓', onClick: () => {} }
          ]}
        />

        {/* View Mode Pills */}
        <div className="flex items-center gap-3">
          <PillButton label="Chat" isActive={viewMode === 'chat'} onClick={() => setViewMode('chat')} />
          <PillButton label="Conversations" isActive={viewMode === 'conversations'} onClick={() => setViewMode('conversations')} />
          <PillButton label="Starred" isActive={viewMode === 'starred'} onClick={() => setViewMode('starred')} />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Chat/Conversations Area */}
          <div className="lg:col-span-2">
            {viewMode === 'chat' ? (
              <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl border border-slate-200 dark:border-slate-800 p-6 h-[600px] flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                    {activeConversation?.title || 'New Chat'}
                  </h2>
                  {activeConversation && (
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${getConversationModeColor(activeConversation.mode)}`}>
                        {activeConversation.mode}
                      </span>
                      <button
                        onClick={() => toggleStar(activeConversation.id)}
                        className={`p-1 rounded ${activeConversation.is_starred ? 'text-yellow-500' : 'text-slate-400'}`}
                      >
                        ★
                      </button>
                    </div>
                  )}
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto mb-4 space-y-4">
                  {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-slate-500 dark:text-slate-400">
                      <div className="text-6xl mb-4">🤖</div>
                      <p className="text-lg font-medium">Hello! How can I help you today?</p>
                      <p className="text-sm mt-2">Start a conversation or try one of the suggestions below</p>
                      <div className="flex flex-wrap gap-2 mt-4 max-w-md justify-center">
                        {suggestions.slice(0, 3).map((suggestion, index) => (
                          <button
                            key={index}
                            onClick={() => setInputMessage(suggestion)}
                            className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-xs hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-all"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] p-4 rounded-lg ${
                            message.role === 'user'
                              ? 'bg-purple-600 text-white'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white'
                          }`}
                        >
                          {message.role === 'assistant' && (
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-xl">🤖</span>
                              <span className="text-xs font-semibold text-purple-600 dark:text-purple-400">AI Assistant</span>
                            </div>
                          )}
                          <p className="text-sm whitespace-pre-line">{message.content}</p>
                          <div className="text-xs mt-2 opacity-70">
                            {getRelativeTime(message.created_at)}
                            {message.total_tokens > 0 && ` • ${message.total_tokens} tokens`}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="Ask me anything..."
                      className="flex-1 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      disabled={isSending}
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={isSending || !inputMessage.trim()}
                      className="px-4 py-2 bg-gradient-to-r from-purple-600 to-violet-600 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSending ? '...' : '✨ Send'}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                <h2 className="text-xl font-semibold mb-4 text-slate-900 dark:text-white">
                  {viewMode === 'starred' ? 'Starred Conversations' : 'All Conversations'}
                </h2>

                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {conversations
                      .filter(c => viewMode !== 'starred' || c.is_starred)
                      .map((conversation) => (
                        <div
                          key={conversation.id}
                          onClick={() => handleSelectConversation(conversation)}
                          className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-purple-500/50 cursor-pointer transition-all hover:shadow-lg hover:shadow-purple-500/10"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold text-slate-900 dark:text-white">
                              {conversation.title}
                            </h3>
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-1 rounded-full text-xs ${getConversationModeColor(conversation.mode)}`}>
                                {conversation.mode}
                              </span>
                              {conversation.is_starred && <span className="text-yellow-500">★</span>}
                            </div>
                          </div>
                          <div className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                            {conversation.message_count} messages • {formatTokens(conversation.total_tokens)} tokens
                          </div>
                          <div className="text-xs text-slate-500">
                            Last updated: {getRelativeTime(conversation.updated_at)}
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">

            {/* Suggestions */}
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
              <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white flex items-center gap-2">
                💡 Suggestions
              </h3>
              <div className="space-y-2">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setInputMessage(suggestion)
                      setViewMode('chat')
                    }}
                    className="w-full text-left p-3 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-purple-50 dark:hover:bg-purple-900/30 transition-colors text-sm text-slate-700 dark:text-slate-300"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              <MiniKPI label="Active" value={stats.activeConversations.toString()} trend="up" change="+5" />
              <MiniKPI label="Starred" value={stats.starredConversations.toString()} trend="same" change="0" />
              <MiniKPI label="Archived" value={stats.archivedConversations.toString()} trend="down" change="-2" />
              <MiniKPI label="Avg Messages" value={stats.avgMessagesPerConversation.toFixed(0)} trend="up" change="+3" />
            </div>

            {/* AI Capabilities */}
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
              <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">
                AI Capabilities
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
                  <span className="text-xl">🧠</span>
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">Smart Analysis</p>
                    <p className="text-xs text-slate-500">Data insights</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
                  <span className="text-xl">⚡</span>
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">Automation</p>
                    <p className="text-xs text-slate-500">Task handling</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
                  <span className="text-xl">💬</span>
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">Conversation</p>
                    <p className="text-xs text-slate-500">Natural chat</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
                  <span className="text-xl">📈</span>
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">Predictions</p>
                    <p className="text-xs text-slate-500">Trends & forecasts</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <ActivityFeed
              activities={[
                {
                  action: 'Conversation started',
                  subject: 'Project Analysis',
                  time: '5 min ago',
                  type: 'info'
                },
                {
                  action: 'Report generated',
                  subject: 'Weekly Summary',
                  time: '1 hour ago',
                  type: 'success'
                },
                {
                  action: 'Task automated',
                  subject: 'Email Responses',
                  time: '3 hours ago',
                  type: 'success'
                }
              ]}
            />

          </div>
        </div>

      </div>
    </div>
  )
}
