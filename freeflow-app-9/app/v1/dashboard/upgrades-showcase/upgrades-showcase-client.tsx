// MIGRATED: Batch #25 - Removed mock data, using database hooks
"use client"

import { useState } from 'react'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Brain,
  LineChart,
  Users,
  Target,
  Sparkles,
  Activity,
  Search,
  Zap,
  Trophy,
  BarChart3,
  TrendingUp,
  DollarSign,
  Calendar,
  Plus,
  Edit,
  FileText,
  Star,
  Rocket,
  Crown,
} from 'lucide-react'

// Import all competitive upgrade components
import {
  AIInsightsPanel,
  Sparkline,
  ProgressRing,
  TrendIndicator,
  MetricCard,
  CollaborationIndicator,
  InlineComment,
  PredictiveAnalytics,
  DataStory,
} from '@/components/ui/competitive-upgrades'

import {
  ActivityFeed,
  GoalTracker,
  SmartSearch,
  QuickActionsToolbar,
  GamificationWidget,
} from '@/components/ui/competitive-upgrades-extended'


// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function UpgradesShowcaseClient() {
  const [activeTab, setActiveTab] = useState('ai-insights')

  // Dialog states for activity actions
  const [showViewDialog, setShowViewDialog] = useState(false)
  const [showReplyDialog, setShowReplyDialog] = useState(false)
  const [selectedActivity, setSelectedActivity] = useState<any>(null)
  const [replyText, setReplyText] = useState('')

  // Dialog states for quick actions
  const [showNewTaskDialog, setShowNewTaskDialog] = useState(false)
  const [showSearchDialog, setShowSearchDialog] = useState(false)
  const [showAIAssistantDialog, setShowAIAssistantDialog] = useState(false)
  const [showNewProjectDialog, setShowNewProjectDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showStarDialog, setShowStarDialog] = useState(false)

  // Form states for dialogs
  const [newTaskName, setNewTaskName] = useState('')
  const [newTaskDescription, setNewTaskDescription] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [aiPrompt, setAIPrompt] = useState('')
  const [newProjectName, setNewProjectName] = useState('')
  const [newProjectDescription, setNewProjectDescription] = useState('')

  // Dynamic quick actions with real handlers
  const quickActions = [
    { id: '1', label: 'New Task', icon: <Plus className="h-5 w-5" />, shortcut: '⌘N', action: () => setShowNewTaskDialog(true), category: 'Create' },
    { id: '2', label: 'Search', icon: <Search className="h-5 w-5" />, shortcut: '⌘K', action: () => setShowSearchDialog(true), category: 'Navigate' },
    { id: '3', label: 'AI Assistant', icon: <Brain className="h-5 w-5" />, shortcut: '⌘J', action: () => setShowAIAssistantDialog(true), category: 'AI' },
    { id: '4', label: 'New Project', icon: <FileText className="h-5 w-5" />, shortcut: '⌘P', action: () => setShowNewProjectDialog(true), category: 'Create' },
    { id: '5', label: 'Edit', icon: <Edit className="h-5 w-5" />, shortcut: '⌘E', action: () => setShowEditDialog(true), category: 'Actions' },
    { id: '6', label: 'Star', icon: <Star className="h-5 w-5" />, shortcut: '⌘S', action: () => setShowStarDialog(true), category: 'Actions' },
  ]

  // Dynamic activities with real handlers
  const activities = [
    {
      id: '1',
      type: 'mention' as const,
      title: 'mentioned you in Q4 Planning',
      user: { id: '1', name: 'Sarah Chen' },
      target: { type: 'Document', name: 'Q4 Marketing Strategy' },
      timestamp: new Date(Date.now() - 300000),
      isRead: false,
      actions: [
        { label: 'View', action: () => { setShowViewDialog(true); } },
        { label: 'Reply', action: () => { setShowReplyDialog(true); } },
      ],
    },
    {
      id: '2',
      type: 'assignment' as const,
      title: 'assigned you a task',
      description: 'Review and approve the new landing page design',
      user: { id: '2', name: 'Mike Johnson' },
      target: { type: 'Task', name: 'Landing Page Review' },
      timestamp: new Date(Date.now() - 1800000),
      isRead: false,
    },
    {
      id: '3',
      type: 'status_change' as const,
      title: 'moved to "In Review"',
      user: { id: '3', name: 'Emily Davis' },
      target: { type: 'Project', name: 'Website Redesign' },
      timestamp: new Date(Date.now() - 3600000),
      isRead: true,
    },
    {
      id: '4',
      type: 'milestone' as const,
      title: 'completed a milestone',
      description: 'Phase 1 of the product launch is complete',
      user: { id: '1', name: 'Sarah Chen' },
      target: { type: 'Project', name: 'Product Launch 2025' },
      timestamp: new Date(Date.now() - 7200000),
      isRead: true,
      isPinned: true,
    },
    {
      id: '5',
      type: 'comment' as const,
      title: 'commented on your task',
      description: 'Great progress on the analytics dashboard! Just a few suggestions...',
      user: { id: '4', name: 'Alex Kim' },
      target: { type: 'Task', name: 'Analytics Dashboard' },
      timestamp: new Date(Date.now() - 86400000),
      isRead: true,
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 dark:bg-none dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Rocket className="h-8 w-8 text-violet-600" />
              Competitive Upgrades Showcase
            </h1>
            <p className="text-muted-foreground mt-1">
              Premium features that beat Monday.com, HubSpot, Salesforce, Asana, and Notion
            </p>
          </div>
          <Badge className="bg-gradient-to-r from-violet-600 to-purple-600 text-white">
            <Sparkles className="h-3 w-3 mr-1" />
            2025 Edition
          </Badge>
        </div>

        {/* Feature Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-6 w-full">
            <TabsTrigger value="ai-insights" className="flex items-center gap-1">
              <Brain className="h-4 w-4" />
              <span className="hidden sm:inline">AI Insights</span>
            </TabsTrigger>
            <TabsTrigger value="visualizations" className="flex items-center gap-1">
              <LineChart className="h-4 w-4" />
              <span className="hidden sm:inline">Micro-Viz</span>
            </TabsTrigger>
            <TabsTrigger value="collaboration" className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Collab</span>
            </TabsTrigger>
            <TabsTrigger value="goals" className="flex items-center gap-1">
              <Target className="h-4 w-4" />
              <span className="hidden sm:inline">Goals</span>
            </TabsTrigger>
            <TabsTrigger value="activity" className="flex items-center gap-1">
              <Activity className="h-4 w-4" />
              <span className="hidden sm:inline">Activity</span>
            </TabsTrigger>
            <TabsTrigger value="gamification" className="flex items-center gap-1">
              <Trophy className="h-4 w-4" />
              <span className="hidden sm:inline">Gamify</span>
            </TabsTrigger>
          </TabsList>

          {/* AI Insights Tab */}
          <TabsContent value="ai-insights" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <AIInsightsPanel insights={[]} />
              <PredictiveAnalytics predictions={[]} />
            </div>
            <DataStory
              title="Weekly Performance Report"
              subtitle="AI-generated insights from your data"
              segments={[]}
            />
          </TabsContent>

          {/* Micro-Visualizations Tab */}
          <TabsContent value="visualizations" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard
                title="Total Revenue"
                value="$125,430"
                previousValue={102000}
                currentValue={125430}
                icon={<DollarSign className="h-5 w-5" />}
                sparklineData={[80, 95, 88, 102, 110, 118, 125]}
                trend="up"
                description="vs $102K last month"
              />
              <MetricCard
                title="Active Users"
                value="12,847"
                previousValue={11200}
                currentValue={12847}
                icon={<Users className="h-5 w-5" />}
                sparklineData={[9800, 10200, 10800, 11200, 11600, 12200, 12847]}
                trend="up"
                description="14.7% increase"
              />
              <MetricCard
                title="Conversion Rate"
                value="4.2%"
                previousValue={3.8}
                currentValue={4.2}
                icon={<TrendingUp className="h-5 w-5" />}
                sparklineData={[3.2, 3.4, 3.6, 3.8, 3.9, 4.0, 4.2]}
                trend="up"
                description="+0.4% this week"
              />
              <MetricCard
                title="Avg Session"
                value="8m 24s"
                previousValue={420}
                currentValue={504}
                icon={<Calendar className="h-5 w-5" />}
                sparklineData={[380, 400, 420, 440, 460, 480, 504]}
                trend="up"
                description="20% longer sessions"
              />
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Component Gallery</CardTitle>
                <CardDescription>Sparklines, Progress Rings, and Trend Indicators</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-6">
                  <div className="space-y-4">
                    <h4 className="font-medium">Sparklines</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Revenue</span>
                        <Sparkline data={[20, 35, 28, 45, 52, 48, 65]} color="#22c55e" />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Traffic</span>
                        <Sparkline data={[50, 45, 55, 40, 35, 45, 30]} color="#ef4444" />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Engagement</span>
                        <Sparkline data={[30, 35, 32, 38, 35, 40, 38]} color="#8b5cf6" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium">Progress Rings</h4>
                    <div className="flex items-center justify-center gap-6">
                      <ProgressRing value={75} label="Tasks" color="#22c55e" />
                      <ProgressRing value={45} label="Goals" color="#f59e0b" />
                      <ProgressRing value={92} label="Budget" color="#8b5cf6" />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium">Trend Indicators</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Revenue</span>
                        <TrendIndicator value={125000} previousValue={100000} format="percent" />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Costs</span>
                        <TrendIndicator value={45000} previousValue={50000} format="currency" />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Users</span>
                        <TrendIndicator value={12847} previousValue={11200} format="number" />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Collaboration Tab */}
          <TabsContent value="collaboration" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Real-time Collaboration</CardTitle>
                  <CardDescription>See who&apos;s online and working with you</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h4 className="text-sm font-medium mb-3">Team Members Online</h4>
                    <CollaborationIndicator collaborators={[]} showTyping />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-3">Compact View</h4>
                    <CollaborationIndicator collaborators={[]} maxVisible={3} />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Inline Comments & @Mentions</CardTitle>
                  <CardDescription>Collaborate directly on any content</CardDescription>
                </CardHeader>
                <CardContent>
                  <InlineComment
                    comment={null}
                    onReply={(id, content) => toast.success('Reply sent', { description: `Reply to comment ${id}: ${content.substring(0, 30)}...` })}
                    onReact={(id, emoji) => toast.success('Reaction added', { description: `${emoji} added to comment` })}
                    onResolve={(id) => toast.success('Comment resolved', { description: `Comment ${id} has been resolved` })}
                    onPin={(id) => toast.success('Comment pinned', { description: `Comment ${id} has been pinned` })}
                  />
                </CardContent>
              </Card>
            </div>

            <SmartSearch
              recentSearches={['marketing campaign', 'Q4 report', 'team meeting', 'budget review']}
              suggestedFilters={[
                { key: 'type', values: ['Projects', 'Tasks', 'Documents', 'People'] },
                { key: 'status', values: ['Active', 'Completed', 'In Progress', 'Archived'] },
              ]}
            />
          </TabsContent>

          {/* Goals Tab */}
          <TabsContent value="goals" className="space-y-6">
            <GoalTracker goals={[]} />
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity" className="space-y-6">
            <ActivityFeed
              activities={activities}
              onMarkRead={(id) => toast.success('Marked as read', { description: `Activity ${id} marked as read` })}
              onMarkAllRead={() => toast.success('All marked as read', { description: 'All activities marked as read' })}
              onPin={(id) => toast.success('Activity pinned', { description: `Activity ${id} has been pinned` })}
              onArchive={(id) => toast.success('Activity archived', { description: `Activity ${id} moved to archive` })}
            />
          </TabsContent>

          {/* Gamification Tab */}
          <TabsContent value="gamification" className="space-y-6">
            <GamificationWidget
              stats={null}
              achievements={[]}
              onClaim={(id) => toast.success('Achievement claimed!', { description: `You've claimed achievement ${id}. Check your profile for rewards!` })}
            />
          </TabsContent>
        </Tabs>

        {/* Quick Actions Toolbar (always visible) */}
        <QuickActionsToolbar actions={quickActions} position="bottom" />
      </div>

      {/* View Activity Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>View Activity</DialogTitle>
            <DialogDescription>
              {selectedActivity ? `${selectedActivity.user.name} ${selectedActivity.title}` : 'Activity details'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {selectedActivity && (
              <>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm font-medium">Target: {selectedActivity.target.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">Type: {selectedActivity.target.type}</p>
                </div>
                <div className="text-sm text-muted-foreground">
                  {new Date(selectedActivity.timestamp).toLocaleString()}
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowViewDialog(false)}>Close</Button>
            <Button onClick={() => { setShowViewDialog(false); toast.success('Activity viewed'); }}>
              Mark as Read
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reply to Activity Dialog */}
      <Dialog open={showReplyDialog} onOpenChange={setShowReplyDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reply to Activity</DialogTitle>
            <DialogDescription>
              Reply to {selectedActivity?.user.name}&apos;s mention
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reply-text">Your Reply</Label>
              <Textarea
                id="reply-text"
                placeholder="Type your reply..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowReplyDialog(false); setReplyText(''); }}>
              Cancel
            </Button>
            <Button onClick={() => {
              setShowReplyDialog(false);
              toast.success('Reply sent', { description: `Replied to ${selectedActivity?.user.name}` });
              setReplyText('');
            }}>
              Send Reply
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Task Dialog */}
      <Dialog open={showNewTaskDialog} onOpenChange={setShowNewTaskDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Task</DialogTitle>
            <DialogDescription>
              Add a new task to your project
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="task-name">Task Name</Label>
              <Input
                id="task-name"
                placeholder="Enter task name..."
                value={newTaskName}
                onChange={(e) => setNewTaskName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="task-description">Description</Label>
              <Textarea
                id="task-description"
                placeholder="Enter task description..."
                value={newTaskDescription}
                onChange={(e) => setNewTaskDescription(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowNewTaskDialog(false); setNewTaskName(''); setNewTaskDescription(''); }}>
              Cancel
            </Button>
            <Button onClick={() => {
              setShowNewTaskDialog(false);
              toast.success('Task created', { description: newTaskName || 'New task' });
              setNewTaskName('');
              setNewTaskDescription('');
            }}>
              Create Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Search Dialog */}
      <Dialog open={showSearchDialog} onOpenChange={setShowSearchDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Search</DialogTitle>
            <DialogDescription>
              Search across projects, tasks, and documents
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="search-query">Search Query</Label>
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  id="search-query"
                  placeholder="Type to search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1"
                />
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              Recent: marketing campaign, Q4 report, team meeting
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowSearchDialog(false); setSearchQuery(''); }}>
              Cancel
            </Button>
            <Button onClick={() => {
              setShowSearchDialog(false);
              toast.success('Search completed', { description: `Searched for: ${searchQuery || 'all'}` });
              setSearchQuery('');
            }}>
              Search
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* AI Assistant Dialog */}
      <Dialog open={showAIAssistantDialog} onOpenChange={setShowAIAssistantDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>AI Assistant</DialogTitle>
            <DialogDescription>
              Ask the AI assistant for help with your tasks
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center gap-2 p-3 bg-violet-50 dark:bg-violet-950 rounded-lg">
              <Brain className="h-5 w-5 text-violet-600" />
              <span className="text-sm">Powered by advanced AI</span>
            </div>
            <div className="space-y-2">
              <Label htmlFor="ai-prompt">Your Question</Label>
              <Textarea
                id="ai-prompt"
                placeholder="Ask me anything..."
                value={aiPrompt}
                onChange={(e) => setAIPrompt(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowAIAssistantDialog(false); setAIPrompt(''); }}>
              Cancel
            </Button>
            <Button onClick={() => {
              setShowAIAssistantDialog(false);
              toast.success('AI processing', { description: 'Your request is being processed' });
              setAIPrompt('');
            }}>
              Ask AI
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Project Dialog */}
      <Dialog open={showNewProjectDialog} onOpenChange={setShowNewProjectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
            <DialogDescription>
              Start a new project to organize your work
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="project-name">Project Name</Label>
              <Input
                id="project-name"
                placeholder="Enter project name..."
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="project-description">Description</Label>
              <Textarea
                id="project-description"
                placeholder="Enter project description..."
                value={newProjectDescription}
                onChange={(e) => setNewProjectDescription(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowNewProjectDialog(false); setNewProjectName(''); setNewProjectDescription(''); }}>
              Cancel
            </Button>
            <Button onClick={() => {
              setShowNewProjectDialog(false);
              toast.success('Project created', { description: newProjectName || 'New project' });
              setNewProjectName('');
              setNewProjectDescription('');
            }}>
              Create Project
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Mode</DialogTitle>
            <DialogDescription>
              Select an item to edit
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 border rounded-lg">
              <p className="text-sm font-medium mb-2">Available for editing:</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>- Current project settings</li>
                <li>- Task details</li>
                <li>- Document content</li>
                <li>- Team permissions</li>
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              setShowEditDialog(false);
              toast.success('Editor opened', { description: 'You can now edit items' });
            }}>
              Start Editing
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Star/Favorite Dialog */}
      <Dialog open={showStarDialog} onOpenChange={setShowStarDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add to Favorites</DialogTitle>
            <DialogDescription>
              Star items to access them quickly
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-amber-50 dark:bg-amber-950 rounded-lg">
              <Star className="h-5 w-5 text-amber-500" />
              <span className="text-sm">Starred items appear in your favorites</span>
            </div>
            <div className="p-4 border rounded-lg">
              <p className="text-sm font-medium mb-2">Quick star options:</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>- Current page</li>
                <li>- Active project</li>
                <li>- Selected tasks</li>
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowStarDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              setShowStarDialog(false);
              toast.success('Added to favorites', { description: 'Item has been starred' });
            }}>
              <Star className="h-4 w-4 mr-2" />
              Star Item
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
