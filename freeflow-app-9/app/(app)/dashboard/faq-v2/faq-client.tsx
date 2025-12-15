'use client'

import { useState } from 'react'
import { useFAQs, FAQ, FAQStats } from '@/lib/hooks/use-faqs'
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
  HelpCircle,
  Plus,
  Search,
  Settings,
  BarChart3,
  FileText,
  Tag,
  Eye,
  ThumbsUp,
  ThumbsDown,
  X,
  Loader2,
  Trash2,
  Edit
} from 'lucide-react'

interface FAQClientProps {
  initialFAQs: FAQ[]
  initialStats: FAQStats
}

export default function FAQClient({ initialFAQs, initialStats }: FAQClientProps) {
  const {
    faqs,
    stats,
    loading,
    createFAQ,
    updateFAQ,
    deleteFAQ,
    markHelpful
  } = useFAQs(initialFAQs, initialStats)

  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft' | 'review'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newFAQ, setNewFAQ] = useState({
    question: '',
    answer: '',
    category: '',
    priority: 'medium' as const
  })

  const filteredFAQs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || faq.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleCreateFAQ = async () => {
    if (!newFAQ.question.trim() || !newFAQ.answer.trim()) return
    await createFAQ(newFAQ)
    setShowCreateModal(false)
    setNewFAQ({ question: '', answer: '', category: '', priority: 'medium' })
  }

  const displayStats = [
    { label: 'Total FAQs', value: stats.total.toString(), change: 12.5, icon: <HelpCircle className="w-5 h-5" /> },
    { label: 'Published', value: stats.published.toString(), change: 8.3, icon: <FileText className="w-5 h-5" /> },
    { label: 'Total Views', value: stats.totalViews.toLocaleString(), change: 25.3, icon: <Eye className="w-5 h-5" /> },
    { label: 'Helpfulness', value: `${stats.avgHelpfulness}%`, change: 5.2, icon: <ThumbsUp className="w-5 h-5" /> }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300'
      case 'draft': return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
      case 'review': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300'
      case 'archived': return 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
      case 'high': return 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300'
      case 'medium': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300'
      case 'low': return 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50/30 to-pink-50/40 dark:from-blue-950 dark:via-purple-950/30 dark:to-pink-950/40 p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <HelpCircle className="w-10 h-10 text-blue-600" />
              FAQ Management
            </h1>
            <p className="text-muted-foreground">Manage frequently asked questions</p>
          </div>
          <GradientButton from="blue" to="purple" onClick={() => setShowCreateModal(true)}>
            <Plus className="w-5 h-5 mr-2" />
            Create FAQ
          </GradientButton>
        </div>

        <StatGrid columns={4} stats={displayStats} />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <BentoQuickAction icon={<Plus />} title="New FAQ" description="Create" onClick={() => setShowCreateModal(true)} />
          <BentoQuickAction icon={<Tag />} title="Categories" description="Manage" onClick={() => console.log('Categories')} />
          <BentoQuickAction icon={<BarChart3 />} title="Analytics" description="View" onClick={() => console.log('Analytics')} />
          <BentoQuickAction icon={<Settings />} title="Settings" description="Configure" onClick={() => console.log('Settings')} />
        </div>

        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search FAQs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <PillButton variant={statusFilter === 'all' ? 'primary' : 'ghost'} onClick={() => setStatusFilter('all')}>All</PillButton>
            <PillButton variant={statusFilter === 'published' ? 'primary' : 'ghost'} onClick={() => setStatusFilter('published')}>Published</PillButton>
            <PillButton variant={statusFilter === 'draft' ? 'primary' : 'ghost'} onClick={() => setStatusFilter('draft')}>Draft</PillButton>
            <PillButton variant={statusFilter === 'review' ? 'primary' : 'ghost'} onClick={() => setStatusFilter('review')}>Review</PillButton>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {loading && faqs.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              </div>
            ) : filteredFAQs.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <HelpCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No FAQs found</p>
                <ModernButton variant="outline" size="sm" className="mt-4" onClick={() => setShowCreateModal(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create First FAQ
                </ModernButton>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredFAQs.map((faq) => (
                  <BentoCard key={faq.id} className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`text-xs px-2 py-1 rounded-md ${getStatusColor(faq.status)}`}>{faq.status}</span>
                            <span className={`text-xs px-2 py-1 rounded-md ${getPriorityColor(faq.priority)}`}>{faq.priority}</span>
                            {faq.category && <span className="text-xs px-2 py-1 rounded-md bg-muted">{faq.category}</span>}
                          </div>
                          <h3 className="font-semibold text-lg">{faq.question}</h3>
                          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{faq.answer}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1"><Eye className="w-3 h-3" />{faq.views_count} views</div>
                        <div className="flex items-center gap-1"><ThumbsUp className="w-3 h-3" />{faq.helpful_count}</div>
                        <div className="flex items-center gap-1"><ThumbsDown className="w-3 h-3" />{faq.not_helpful_count}</div>
                      </div>

                      <div className="flex items-center gap-2 pt-3 border-t">
                        <ModernButton variant="outline" size="sm" onClick={() => console.log('Edit', faq.id)}>
                          <Edit className="w-3 h-3 mr-1" />Edit
                        </ModernButton>
                        {faq.status === 'draft' && (
                          <ModernButton variant="primary" size="sm" onClick={() => updateFAQ(faq.id, { status: 'published' })}>
                            Publish
                          </ModernButton>
                        )}
                        <ModernButton variant="outline" size="sm" onClick={() => deleteFAQ(faq.id)}>
                          <Trash2 className="w-3 h-3" />
                        </ModernButton>
                      </div>
                    </div>
                  </BentoCard>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <BentoCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <MiniKPI label="Published" value={stats.published.toString()} change={8.3} />
                <MiniKPI label="In Review" value={stats.review.toString()} change={12.5} />
                <MiniKPI label="Drafts" value={stats.draft.toString()} change={-5.2} />
                <MiniKPI label="Helpfulness" value={`${stats.avgHelpfulness}%`} change={2.1} />
              </div>
            </BentoCard>
          </div>
        </div>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background rounded-xl p-6 w-full max-w-lg mx-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Create FAQ</h2>
              <button onClick={() => setShowCreateModal(false)}><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Question *</label>
                <input
                  type="text"
                  value={newFAQ.question}
                  onChange={(e) => setNewFAQ({ ...newFAQ, question: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter question"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Answer *</label>
                <textarea
                  value={newFAQ.answer}
                  onChange={(e) => setNewFAQ({ ...newFAQ, answer: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter answer"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Category</label>
                  <input
                    type="text"
                    value={newFAQ.category}
                    onChange={(e) => setNewFAQ({ ...newFAQ, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Account"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Priority</label>
                  <select
                    value={newFAQ.priority}
                    onChange={(e) => setNewFAQ({ ...newFAQ, priority: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <ModernButton variant="outline" className="flex-1" onClick={() => setShowCreateModal(false)}>Cancel</ModernButton>
                <GradientButton from="blue" to="purple" className="flex-1" onClick={handleCreateFAQ} disabled={loading || !newFAQ.question.trim() || !newFAQ.answer.trim()}>
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create FAQ'}
                </GradientButton>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
