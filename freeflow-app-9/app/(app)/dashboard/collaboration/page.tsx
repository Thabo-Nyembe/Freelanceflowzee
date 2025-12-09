"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { NumberFlow } from "@/components/ui/number-flow";
import { TextShimmer } from "@/components/ui/text-shimmer";
import { LiquidGlassCard } from "@/components/ui/liquid-glass-card";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import {
  MessageCircle,
  Users,
  Video,
  Mic,
  Share2,
  FileText,
  Image,
  Play,
  Pin,
  CheckCircle,
  Phone,
  Search,
  Download,
  Upload,
  Calendar,
  Clock,
  TrendingUp,
  Activity,
  Zap,
  Settings,
  UserPlus,
  Mail,
  Eye,
  Edit,
  LogOut,
  BarChart3,
  PieChart,
  Briefcase,
  FolderOpen,
  PhoneCall,
  Monitor,
  Square,
  Smile,
  Send,
  MoreVertical,
  Brain,
  AlertTriangle,
  ListChecks,
  Sparkles,
  Target,
  Timer,
  ArrowRight
} from "lucide-react";

// A+++ UTILITIES
import { CardSkeleton, ListSkeleton } from '@/components/ui/loading-skeleton'
import { NoDataEmptyState, ErrorEmptyState } from '@/components/ui/empty-state'
import { useAnnouncer } from '@/lib/accessibility'
import { createFeatureLogger } from '@/lib/logger'
import { useCurrentUser } from '@/hooks/use-ai-data'

const logger = createFeatureLogger('Collaboration')

export default function CollaborationPage() {
  // A+++ STATE MANAGEMENT
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { announce } = useAnnouncer()
  const { userId, loading: userLoading } = useCurrentUser()

  // Database state
  const [channels, setChannels] = useState<any[]>([])
  const [teams, setTeams] = useState<any[]>([])
  const [meetings, setMeetings] = useState<any[]>([])
  const [workspaceFiles, setWorkspaceFiles] = useState<any[]>([])

  const [activeTab, setActiveTab] = useState<any>("chat");

  // Dialog States
  const [showDeleteFeedbackDialog, setShowDeleteFeedbackDialog] = useState(false)
  const [showRemoveParticipantDialog, setShowRemoveParticipantDialog] = useState(false)
  const [feedbackToDelete, setFeedbackToDelete] = useState<number | null>(null)
  const [participantToRemove, setParticipantToRemove] = useState<number | null>(null)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [showMediaGallery, setShowMediaGallery] = useState(false)
  const [selectedEmoji, setSelectedEmoji] = useState<string | null>(null)

  // Emoji categories
  const emojiCategories = {
    'Smileys': ['😀', '😃', '😄', '😁', '😅', '😂', '🤣', '😊', '😇', '🙂', '😉', '😍', '🥰', '😘', '😋', '😜'],
    'Gestures': ['👍', '👎', '👏', '🙌', '🤝', '💪', '✌️', '🤞', '🤟', '🤘', '👋', '🙏', '✋', '🤚', '👐', '🖐️'],
    'Objects': ['🎉', '🎊', '🎁', '🏆', '⭐', '🌟', '💡', '📌', '📎', '✅', '❌', '❓', '❗', '💬', '💭', '🔔'],
    'Hearts': ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '💔', '💕', '💖', '💗', '💘', '💝', '💞', '💟']
  }

  // Sample media for gallery
  const mediaItems = [
    { id: 1, type: 'image', name: 'project-design.png', size: '2.4 MB', date: '2 hours ago', url: '/placeholder-image.jpg' },
    { id: 2, type: 'video', name: 'demo-recording.mp4', size: '45 MB', date: '1 day ago', url: '/placeholder-video.mp4' },
    { id: 3, type: 'image', name: 'wireframes.jpg', size: '1.8 MB', date: '2 days ago', url: '/placeholder-image.jpg' },
    { id: 4, type: 'image', name: 'screenshot.png', size: '890 KB', date: '3 days ago', url: '/placeholder-image.jpg' },
    { id: 5, type: 'video', name: 'meeting-recap.mp4', size: '120 MB', date: '4 days ago', url: '/placeholder-video.mp4' },
    { id: 6, type: 'image', name: 'mockup-v2.png', size: '3.1 MB', date: '5 days ago', url: '/placeholder-image.jpg' }
  ]

  // A+++ LOAD COLLABORATION DATA
  useEffect(() => {
    const loadCollaborationData = async () => {
      if (!userId) {
        logger.info('Waiting for user authentication')
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        setError(null)
        logger.info('Loading collaboration data', { userId })

        // Dynamic import for code splitting
        const { getChannels, getTeams, getMeetings, getWorkspaceFiles } = await import('@/lib/collaboration-queries')

        // Load collaboration data in parallel
        const [channelsResult, teamsResult, meetingsResult, filesResult] = await Promise.all([
          getChannels(userId),
          getTeams(userId),
          getMeetings(userId),
          getWorkspaceFiles(userId)
        ])

        setChannels(channelsResult.data || [])
        setTeams(teamsResult.data || [])
        setMeetings(meetingsResult.data || [])
        setWorkspaceFiles(filesResult.data || [])

        setIsLoading(false)
        toast.success('Collaboration loaded', {
          description: `${channelsResult.data?.length || 0} channels, ${teamsResult.data?.length || 0} teams, ${meetingsResult.data?.length || 0} meetings`
        })
        logger.info('Collaboration data loaded successfully', {
          channelsCount: channelsResult.data?.length,
          teamsCount: teamsResult.data?.length,
          meetingsCount: meetingsResult.data?.length,
          filesCount: filesResult.data?.length
        })
        announce('Collaboration data loaded successfully', 'polite')
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load collaboration data'
        setError(errorMessage)
        setIsLoading(false)
        logger.error('Failed to load collaboration data', { error: errorMessage, userId })
        toast.error('Failed to load collaboration', { description: errorMessage })
        announce('Error loading collaboration data', 'assertive')
      }
    }

    loadCollaborationData()
  }, [userId, announce]) // eslint-disable-line react-hooks/exhaustive-deps

  // Handlers with enhanced logging
  const handleStartAudioCall = () => {
    logger.info('Audio call started', { participants: 3 })
    toast.success('🎤 Audio call started', {
      description: '3 participants connected'
    })
  }

  const handleStartVideoCall = () => {
    logger.info('Video call started', { participants: 3 })
    toast.success('📹 Video call started', {
      description: '3 participants connected'
    })
  }

  const handleSendMessage = () => {
    logger.info('Message sent')
    toast.success('💬 Message sent!')
  }

  const handleAddPinpointFeedback = () => {
    logger.info('Pinpoint feedback mode activated')
    toast.info('📌 Pinpoint feedback mode active', {
      description: 'Click on media to add feedback'
    })
  }

  const handleUploadFile = () => {
    logger.info('File upload initiated')
    const input = document.createElement('input')
    input.type = 'file'
    input.click()
    
    toast.info('📎 File upload dialog opened')
  }

  const handleAddVoiceNote = () => {
    logger.info('Voice note recording started')
    toast.success('🎙️ Recording voice note...', {
      description: 'Microphone access granted'
    })
  }

  const handleShareScreen = () => {
    logger.info('Screen sharing started')
    toast.success('🖥️ Screen sharing started')
  }

  const handleEditFeedback = (id: number) => {
    logger.info('Edit feedback', { feedbackId: id })
    toast.info('✏️ Edit mode active')
  }

  const handleDeleteFeedback = (id: number) => {
    logger.info('Delete feedback requested', { feedbackId: id })
    setFeedbackToDelete(id)
    setShowDeleteFeedbackDialog(true)
  }

  const confirmDeleteFeedback = () => {
    if (feedbackToDelete !== null) {
      logger.info('Feedback deleted', { feedbackId: feedbackToDelete })
      toast.success('✅ Feedback deleted')
      announce('Feedback deleted', 'polite')
    }
    setShowDeleteFeedbackDialog(false)
    setFeedbackToDelete(null)
  }

  const handleReplyToMessage = (id: number) => {
    logger.info('Reply to message', { messageId: id })
    toast.info('💬 Reply mode active')
  }

  const handleReactToMessage = (id: number, emoji: string) => {
    logger.info('Message reaction added', { messageId: id, emoji })
    toast.success('Reaction added: ' + emoji)
  }

  const handlePinMessage = (id: number) => {
    logger.info('Message pinned', { messageId: id })
    toast.success('📌 Message pinned')
  }

  const handleArchiveConversation = () => {
    logger.info('Conversation archived')
    toast.success('📦 Conversation archived')
  }

  const handleAddParticipants = () => {
    logger.info('Add participants initiated')
    toast.info('➕ Add participants', {
      description: 'Select users to add'
    })
  }

  const handleRemoveParticipant = (id: number) => {
    logger.info('Remove participant requested', { participantId: id })
    setParticipantToRemove(id)
    setShowRemoveParticipantDialog(true)
  }

  const confirmRemoveParticipant = () => {
    if (participantToRemove !== null) {
      logger.info('Participant removed', { participantId: participantToRemove })
      toast.success('✅ Participant removed')
      announce('Participant removed from collaboration', 'polite')
    }
    setShowRemoveParticipantDialog(false)
    setParticipantToRemove(null)
  }

  const handleExportChat = () => {
    logger.info('Export chat history initiated')
    toast.success('💾 Chat history exported')
  }

  const handleMuteNotifications = () => {
    logger.info('Notifications muted')
    toast.success('🔕 Notifications muted')
  }

  const handleCreateCanvas = () => {
    logger.info('Canvas created')
    toast.success('🎨 Canvas created')
  }

  const handleAddDrawing = () => {
    logger.info('Drawing mode activated')
    toast.info('✏️ Drawing mode activated')
  }

  const handleSaveCanvas = () => {
    logger.info('Canvas saved')
    toast.success('💾 Canvas saved!')
  }

  const handleExportMedia = () => {
    logger.info('Media export initiated')
    toast.success('📥 Media files exported')
  }

  const handleViewMediaPreview = (type: string) => {
    logger.info('View media preview', { mediaType: type })
    toast.info('👁️ Viewing ' + type + ' preview')
  }

  // NEW ENTERPRISE HANDLERS - Meeting Enhancement
  const handleRecordMeeting = () => {
    logger.info('Meeting recording started', {
      activeMeetings: 3,
      quality: '1080p HD',
      audio: 'High-quality stereo',
      features: ['transcript', 'captions', 'cloud storage', 'AI summary']
    })
    toast.success('🎥 Meeting recording started', {
      description: '1080p HD with auto-transcription'
    })
  }

  const handleCreateBreakoutRoom = () => {
    logger.info('Breakout rooms created', {
      totalParticipants: 12,
      onlineParticipants: 8,
      features: ['auto-assign', 'manual assignment', 'timer', 'broadcast']
    })
    toast.success('🚪 Breakout rooms ready', {
      description: '8 online participants'
    })
  }

  const handleLiveCaptions = () => {
    logger.info('Live captions activated', {
      language: 'English',
      accuracy: '95%+',
      latency: '<1 second',
      languages: 30
    })
    toast.success('💬 Live captions activated', {
      description: '95%+ accuracy, 30+ languages'
    })
  }

  const handleVirtualBackground = () => {
    logger.info('Virtual background activated', {
      options: 20,
      features: ['blur', 'office scenes', 'nature scenes', 'custom images', 'AI edge detection']
    })
    toast.success('🎨 Virtual background ready', {
      description: '20+ options available'
    })
  }

  const handleMuteParticipant = (name: string) => {
    logger.info('Participant muted', { participant: name })
    toast.success('🔇 Participant muted: ' + name)
  }

  const handleSpotlightParticipant = (name: string) => {
    logger.info('Spotlight activated', { participant: name })
    toast.success('⭐ Spotlight: ' + name, {
      description: 'Pinned to main view'
    })
  }

  const handleRaiseHand = () => {
    logger.info('Hand raised')
    toast.success('✋ Hand raised', {
      description: 'Visible to all participants'
    })
  }

  // NEW ENTERPRISE HANDLERS - Chat Enhancement
  const handleSearchMessages = () => {
    logger.info('Message search activated', { resultsFound: 247 })
    toast.info('🔍 Search activated', {
      description: '247 messages indexed'
    })
  }

  const handleSendFile = () => {
    logger.info('File send initiated', { maxSize: '100MB', totalMessages: 247 })
    toast.info('📎 Select file to send', {
      description: 'Max 100MB per file'
    })
  }

  // NEW ENTERPRISE HANDLERS - Collaboration Tools
  const handleStartWhiteboard = () => {
    logger.info('Whiteboard started', {
      collaborators: 8,
      features: ['drawing tools', 'shapes', 'text', 'sticky notes', 'real-time sync']
    })
    toast.success('🖌️ Whiteboard ready', {
      description: '8 collaborators online'
    })
  }

  const handleCreatePoll = () => {
    logger.info('Poll creator opened', {
      participants: 12,
      types: ['multiple choice', 'yes/no', 'rating', 'open text', 'ranking']
    })
    toast.success('📊 Poll creator opened', {
      description: '12 participants available'
    })
  }

  // NEW ENTERPRISE HANDLERS - Meeting Scheduling
  const handleRecurringMeeting = () => {
    logger.info('Recurring meeting setup', {
      currentMeetings: 12,
      options: ['daily', 'weekly', 'monthly', 'custom'],
      integration: ['calendar sync', 'email reminders']
    })
    toast.success('🔁 Recurring meeting setup', {
      description: '12 meetings currently scheduled'
    })
  }

  // NEW ENTERPRISE HANDLERS - Workspace Management
  const handleExportWorkspace = (workspaceId: string) => {
    logger.info('Workspace export initiated', {
      workspaceId,
      format: 'ZIP',
      contents: ['files', 'comments', 'version history', 'team members']
    })
    toast.success('📦 Workspace exported', {
      description: 'Download starting...'
    })
  }

  // NEW ENTERPRISE HANDLERS - Analytics & Reporting
  const handleGenerateTeamReport = () => {
    logger.info('Team report generated', {
      teamMembers: 12,
      activeProjects: 27,
      meetingsAnalyzed: 12,
      metrics: {
        responseTime: '2.3h',
        projectCompletion: '87%',
        collaborationScore: '94%',
        satisfaction: '9.1/10'
      }
    })
    toast.success('📊 Team report generated', {
      description: 'PDF ready for download'
    })
  }

  // Additional missing handlers
  const handleInviteMember = () => {
    logger.info('Invite member initiated', { currentTeamSize: 12 })
    toast.info('➕ Invite team member', {
      description: 'Current team: 12 members'
    })
  }

  const handleBulkInvite = () => {
    logger.info('Bulk invite initiated', {
      options: ['CSV upload', 'email list', 'integration']
    })
    toast.info('📧 Bulk invite members', {
      description: 'CSV, email list, or integration'
    })
  }

  const handleViewProfile = (memberId: string) => {
    logger.info('View profile', { memberId })
    toast.info('👤 Viewing profile: ' + memberId)
  }

  const handleEditPermissions = (memberId: string) => {
    logger.info('Edit permissions', { memberId, currentPermission: 'Editor' })
    toast.info('🔐 Edit permissions: ' + memberId, {
      description: 'Current: Editor'
    })
  }

  const handleStartMeeting = () => {
    logger.info('Meeting started', {
      features: ['HD video', 'screen sharing', 'recording', 'live captions']
    })
    toast.success('🎥 Meeting started', {
      description: 'HD video with recording'
    })
  }

  const handleJoinMeeting = (meetingId: string) => {
    logger.info('Joined meeting', { meetingId, quality: 'HD' })
    toast.success('🚪 Joined meeting: ' + meetingId, {
      description: 'Connected with HD quality'
    })
  }

  const handleCreateWorkspace = () => {
    logger.info('Create workspace initiated', {
      options: ['private', 'team', 'public']
    })
    toast.info('🏢 Create workspace', {
      description: 'Private, team, or public'
    })
  }

  const handleJoinWorkspace = (workspaceId: string) => {
    logger.info('Joined workspace', { workspaceId, accessLevel: 'Contributor' })
    toast.success('🚪 Joined workspace: ' + workspaceId, {
      description: 'Access level: Contributor'
    })
  }

  // A+++ LOADING STATE
  if (isLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="space-y-6">
          <CardSkeleton />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
          <ListSkeleton items={5} />
        </div>
      </div>
    )
  }

  // A+++ ERROR STATE
  if (error) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <ErrorEmptyState
          error={error}
          onRetry={() => window.location.reload()}
        />
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
            <Users className="h-6 w-6 text-white" />
          </div>
          <TextShimmer className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 dark:from-gray-100 dark:via-blue-100 dark:to-indigo-100 bg-clip-text text-transparent">
            Universal Collaboration Hub
          </TextShimmer>
        </div>
        <p className="text-lg text-gray-600">
          Revolutionary multi-media commenting, real-time collaboration, and AI-powered feedback analysis 
          with live cursor tracking, voice notes, and instant synchronization across all project types.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-8 gap-2">
          <TabsTrigger value="chat" data-testid="chat-tab-trigger">Chat</TabsTrigger>
          <TabsTrigger value="teams" data-testid="teams-tab-trigger">Teams</TabsTrigger>
          <TabsTrigger value="workspace" data-testid="workspace-tab-trigger">Workspace</TabsTrigger>
          <TabsTrigger value="meetings" data-testid="meetings-tab-trigger">Meetings</TabsTrigger>
          <TabsTrigger value="feedback" data-testid="feedback-tab-trigger">Feedback</TabsTrigger>
          <TabsTrigger value="media" data-testid="media-tab-trigger">Media</TabsTrigger>
          <TabsTrigger value="canvas" data-testid="canvas-tab-trigger">Canvas</TabsTrigger>
          <TabsTrigger value="analytics" data-testid="analytics-tab-trigger">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="chat" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Team Chat
              </CardTitle>
              <CardDescription>
                Real-time messaging with voice notes, file sharing, and video calls
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Chat header with participants */}
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-semibold">Team Chat</p>
                      <p className="text-sm text-gray-600">8 online • 12 members total</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      data-testid="start-audio-call-btn"
                      size="sm"
                      variant="outline"
                      onClick={handleStartAudioCall}
                    >
                      <Phone className="h-4 w-4 mr-2" />
                      Audio
                    </Button>
                    <Button
                      data-testid="start-video-call-btn"
                      size="sm"
                      variant="default"
                      onClick={handleStartVideoCall}
                    >
                      <Video className="h-4 w-4 mr-2" />
                      Video
                    </Button>
                  </div>
                </div>

                {/* Chat messages */}
                <div className="space-y-4 max-h-[500px] overflow-y-auto p-4 border rounded-lg bg-gray-50">
                  {/* Message 1 */}
                  <div className="flex gap-3">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                      SA
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-sm">Sarah Anderson</span>
                        <span className="text-xs text-gray-500">10:23 AM</span>
                        <Badge variant="secondary" className="text-xs">Online</Badge>
                      </div>
                      <div className="bg-white rounded-lg p-3 shadow-sm">
                        <p className="text-sm">Good morning team! Just reviewed the latest project updates. Everything looks great!</p>
                      </div>
                      <div className="flex gap-2 mt-2">
                        <Button
                          data-testid="pin-message-btn-1"
                          size="sm"
                          variant="ghost"
                          className="h-6 text-xs"
                          onClick={() => handlePinMessage(1)}
                        >
                          <Pin className="h-3 w-3 mr-1" />
                          Pin
                        </Button>
                        <Button
                          data-testid="reply-message-btn-1"
                          size="sm"
                          variant="ghost"
                          className="h-6 text-xs"
                          onClick={() => handleReplyToMessage(1)}
                        >
                          Reply
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Message 2 */}
                  <div className="flex gap-3">
                    <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-semibold">
                      MC
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-sm">Mike Chen</span>
                        <span className="text-xs text-gray-500">10:25 AM</span>
                        <Badge variant="secondary" className="text-xs">Online</Badge>
                      </div>
                      <div className="bg-white rounded-lg p-3 shadow-sm">
                        <p className="text-sm">Thanks Sarah! I added pinpoint feedback on the design mockups.</p>
                        <div className="mt-2 p-2 bg-blue-50 rounded flex items-center gap-2">
                          <Pin className="h-4 w-4 text-blue-600" />
                          <span className="text-xs text-blue-700">3 annotations added</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Message 3 */}
                  <div className="flex gap-3">
                    <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                      JD
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-sm">Jessica Davis</span>
                        <span className="text-xs text-gray-500">10:28 AM</span>
                        <Badge variant="secondary" className="text-xs">Online</Badge>
                      </div>
                      <div className="bg-white rounded-lg p-3 shadow-sm">
                        <p className="text-sm">Great work everyone! Let's schedule a quick sync meeting.</p>
                      </div>
                    </div>
                  </div>

                  {/* Message 4 - Voice note */}
                  <div className="flex gap-3">
                    <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-white font-semibold">
                      RK
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-sm">Robert Kim</span>
                        <span className="text-xs text-gray-500">10:30 AM</span>
                        <Badge variant="secondary" className="text-xs">Online</Badge>
                      </div>
                      <div className="bg-white rounded-lg p-3 shadow-sm">
                        <div className="flex items-center gap-3">
                          <Mic className="h-5 w-5 text-orange-600" />
                          <div className="flex-1">
                            <div className="h-2 bg-orange-200 rounded-full">
                              <div className="h-2 bg-orange-500 rounded-full w-2/3"></div>
                            </div>
                          </div>
                          <span className="text-xs text-gray-500">0:42</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Message 5 - File attachment */}
                  <div className="flex gap-3">
                    <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center text-white font-semibold">
                      EM
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-sm">Emily Martinez</span>
                        <span className="text-xs text-gray-500">10:32 AM</span>
                        <Badge variant="secondary" className="text-xs">Online</Badge>
                      </div>
                      <div className="bg-white rounded-lg p-3 shadow-sm">
                        <p className="text-sm mb-2">Here's the updated project timeline.</p>
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded border">
                          <FileText className="h-6 w-6 text-blue-600" />
                          <div className="flex-1">
                            <p className="text-sm font-medium">Project_Timeline_v2.pdf</p>
                            <p className="text-xs text-gray-500">2.4 MB</p>
                          </div>
                          <Button size="sm" variant="ghost">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Chat input and actions */}
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <Button
                      data-testid="send-file-btn"
                      size="sm"
                      variant="outline"
                      onClick={handleSendFile}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Attach
                    </Button>
                    <Button
                      data-testid="add-voice-note-btn"
                      size="sm"
                      variant="outline"
                      onClick={handleAddVoiceNote}
                    >
                      <Mic className="h-4 w-4 mr-2" />
                      Voice
                    </Button>
                    <Button
                      data-testid="add-emoji-btn"
                      size="sm"
                      variant="outline"
                      onClick={() => setShowEmojiPicker(true)}
                    >
                      <Smile className="h-4 w-4 mr-2" />
                      Emoji
                    </Button>
                    <Button
                      data-testid="search-messages-btn"
                      size="sm"
                      variant="outline"
                      onClick={handleSearchMessages}
                    >
                      <Search className="h-4 w-4 mr-2" />
                      Search
                    </Button>
                    <Button
                      data-testid="export-chat-btn"
                      size="sm"
                      variant="outline"
                      onClick={handleExportChat}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Type a message..."
                      className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <Button
                      data-testid="send-message-btn"
                      variant="default"
                      onClick={handleSendMessage}
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Send
                    </Button>
                  </div>
                </div>

                {/* Online participants sidebar */}
                <div className="p-4 bg-gray-50 rounded-lg border">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-sm">Online Participants (8/12)</h4>
                    <Button
                      data-testid="add-participants-btn"
                      size="sm"
                      variant="ghost"
                      onClick={handleAddParticipants}
                    >
                      <UserPlus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {['Sarah A.', 'Mike C.', 'Jessica D.', 'Robert K.', 'Emily M.', 'David L.', 'Lisa W.', 'Tom H.'].map((name, idx) => (
                      <div key={idx} className="flex flex-col items-center gap-1">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                          {name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <span className="text-xs text-center">{name}</span>
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="teams" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Team Management
              </CardTitle>
              <CardDescription>
                Manage team members, permissions, and collaboration settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Team stats */}
                <div className="grid grid-cols-3 gap-4">
                  <LiquidGlassCard variant="gradient" hoverEffect={true}>
                    <div className="pt-6 pb-6">
                      <div className="text-center">
                        <div className="inline-flex p-3 bg-gradient-to-br from-blue-400/20 to-indigo-400/20 dark:from-blue-400/10 dark:to-indigo-400/10 rounded-xl backdrop-blur-sm mb-2">
                          <Users className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                        </div>
                        <NumberFlow value={12} className="text-3xl font-bold text-gray-900 dark:text-gray-100 block" />
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Total Members</p>
                      </div>
                    </div>
                  </LiquidGlassCard>
                  <LiquidGlassCard variant="tinted" hoverEffect={true}>
                    <div className="pt-6 pb-6">
                      <div className="text-center">
                        <div className="inline-flex p-3 bg-gradient-to-br from-emerald-400/20 to-teal-400/20 dark:from-emerald-400/10 dark:to-teal-400/10 rounded-xl backdrop-blur-sm mb-2">
                          <Activity className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <NumberFlow value={8} className="text-3xl font-bold text-gray-900 dark:text-gray-100 block" />
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Online Now</p>
                      </div>
                    </div>
                  </LiquidGlassCard>
                  <LiquidGlassCard variant="gradient" hoverEffect={true}>
                    <div className="pt-6 pb-6">
                      <div className="text-center">
                        <div className="inline-flex p-3 bg-gradient-to-br from-purple-400/20 to-indigo-400/20 dark:from-purple-400/10 dark:to-indigo-400/10 rounded-xl backdrop-blur-sm mb-2">
                          <Briefcase className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                        </div>
                        <NumberFlow value={27} className="text-3xl font-bold text-gray-900 dark:text-gray-100 block" />
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Active Projects</p>
                      </div>
                    </div>
                  </LiquidGlassCard>
                </div>

                {/* Team actions */}
                <div className="flex gap-2 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border">
                  <Button
                    data-testid="invite-member-btn"
                    variant="default"
                    onClick={handleInviteMember}
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Invite Member
                  </Button>
                  <Button
                    data-testid="bulk-invite-btn"
                    variant="outline"
                    onClick={handleBulkInvite}
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Bulk Invite
                  </Button>
                  <Button
                    data-testid="team-meeting-btn"
                    variant="outline"
                    onClick={handleStartMeeting}
                  >
                    <Video className="h-4 w-4 mr-2" />
                    Team Meeting
                  </Button>
                  <Button
                    data-testid="generate-team-report-btn"
                    variant="outline"
                    onClick={handleGenerateTeamReport}
                  >
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Team Report
                  </Button>
                </div>

                {/* Team members list */}
                <div className="space-y-3">
                  <h3 className="font-semibold">Team Members</h3>

                  {/* Member 1 */}
                  <div className="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                      SA
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">Sarah Anderson</p>
                        <Badge variant="default" className="text-xs">Admin</Badge>
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-xs text-gray-500">Online</span>
                      </div>
                      <p className="text-sm text-gray-600">Product Manager • 8 projects</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        data-testid="view-profile-btn-1"
                        size="sm"
                        variant="ghost"
                        onClick={() => handleViewProfile('sarah-anderson')}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        data-testid="edit-permissions-btn-1"
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEditPermissions('sarah-anderson')}
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Member 2 */}
                  <div className="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center text-white font-semibold">
                      MC
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">Mike Chen</p>
                        <Badge variant="secondary" className="text-xs">Editor</Badge>
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-xs text-gray-500">Online</span>
                      </div>
                      <p className="text-sm text-gray-600">UI/UX Designer • 5 projects</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        data-testid="view-profile-btn-2"
                        size="sm"
                        variant="ghost"
                        onClick={() => handleViewProfile('mike-chen')}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        data-testid="edit-permissions-btn-2"
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEditPermissions('mike-chen')}
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Member 3 */}
                  <div className="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                      JD
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">Jessica Davis</p>
                        <Badge variant="secondary" className="text-xs">Editor</Badge>
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-xs text-gray-500">Online</span>
                      </div>
                      <p className="text-sm text-gray-600">Developer • 12 projects</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        data-testid="view-profile-btn-3"
                        size="sm"
                        variant="ghost"
                        onClick={() => handleViewProfile('jessica-davis')}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        data-testid="edit-permissions-btn-3"
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEditPermissions('jessica-davis')}
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Member 4 */}
                  <div className="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center text-white font-semibold">
                      RK
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">Robert Kim</p>
                        <Badge variant="secondary" className="text-xs">Editor</Badge>
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-xs text-gray-500">Online</span>
                      </div>
                      <p className="text-sm text-gray-600">Marketing Lead • 4 projects</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        data-testid="view-profile-btn-4"
                        size="sm"
                        variant="ghost"
                        onClick={() => handleViewProfile('robert-kim')}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        data-testid="edit-permissions-btn-4"
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEditPermissions('robert-kim')}
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Member 5 */}
                  <div className="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50">
                    <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center text-white font-semibold">
                      EM
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">Emily Martinez</p>
                        <Badge variant="outline" className="text-xs">Contributor</Badge>
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-xs text-gray-500">Online</span>
                      </div>
                      <p className="text-sm text-gray-600">Content Writer • 6 projects</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        data-testid="view-profile-btn-5"
                        size="sm"
                        variant="ghost"
                        onClick={() => handleViewProfile('emily-martinez')}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        data-testid="edit-permissions-btn-5"
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEditPermissions('emily-martinez')}
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Member 6 */}
                  <div className="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50">
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold">
                      DL
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">David Lee</p>
                        <Badge variant="secondary" className="text-xs">Editor</Badge>
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-xs text-gray-500">Online</span>
                      </div>
                      <p className="text-sm text-gray-600">Data Analyst • 3 projects</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        data-testid="view-profile-btn-6"
                        size="sm"
                        variant="ghost"
                        onClick={() => handleViewProfile('david-lee')}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        data-testid="edit-permissions-btn-6"
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEditPermissions('david-lee')}
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Member 7 */}
                  <div className="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50">
                    <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-pink-600 rounded-full flex items-center justify-center text-white font-semibold">
                      LW
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">Lisa Wang</p>
                        <Badge variant="secondary" className="text-xs">Editor</Badge>
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-xs text-gray-500">Online</span>
                      </div>
                      <p className="text-sm text-gray-600">QA Engineer • 7 projects</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        data-testid="view-profile-btn-7"
                        size="sm"
                        variant="ghost"
                        onClick={() => handleViewProfile('lisa-wang')}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        data-testid="edit-permissions-btn-7"
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEditPermissions('lisa-wang')}
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Member 8 */}
                  <div className="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50">
                    <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-teal-600 rounded-full flex items-center justify-center text-white font-semibold">
                      TH
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">Tom Harris</p>
                        <Badge variant="outline" className="text-xs">Viewer</Badge>
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-xs text-gray-500">Online</span>
                      </div>
                      <p className="text-sm text-gray-600">Stakeholder • 2 projects</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        data-testid="view-profile-btn-8"
                        size="sm"
                        variant="ghost"
                        onClick={() => handleViewProfile('tom-harris')}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        data-testid="edit-permissions-btn-8"
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEditPermissions('tom-harris')}
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="workspace" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Workspaces
              </CardTitle>
              <CardDescription>
                Collaborative workspaces with real-time sync and version control
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Workspace actions */}
                <div className="flex gap-2">
                  <Button
                    data-testid="create-workspace-btn"
                    variant="default"
                    onClick={handleCreateWorkspace}
                  >
                    <FolderOpen className="h-4 w-4 mr-2" />
                    Create Workspace
                  </Button>
                  <Button
                    data-testid="join-workspace-btn"
                    variant="outline"
                    onClick={() => handleJoinWorkspace('workspace-001')}
                  >
                    Join Workspace
                  </Button>
                </div>

                {/* Active workspaces */}
                <div className="space-y-4">
                  <h3 className="font-semibold">Active Workspaces</h3>

                  {/* Workspace 1 */}
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                          <Briefcase className="h-8 w-8 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold">Marketing Campaign 2025</h4>
                            <Badge variant="default" className="text-xs">Active</Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">Collaborative workspace for Q1 marketing initiatives</p>
                          <div className="grid grid-cols-4 gap-4 mb-3">
                            <div>
                              <p className="text-xs text-gray-500">Collaborators</p>
                              <p className="font-semibold">8 members</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Files</p>
                              <p className="font-semibold">24 files</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Comments</p>
                              <p className="font-semibold">89 comments</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Last Activity</p>
                              <p className="font-semibold">5 min ago</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              data-testid="join-workspace-btn-1"
                              size="sm"
                              variant="default"
                              onClick={() => handleJoinWorkspace('marketing-2025')}
                            >
                              Open Workspace
                            </Button>
                            <Button
                              data-testid="invite-to-workspace-btn-1"
                              size="sm"
                              variant="outline"
                              onClick={handleInviteMember}
                            >
                              <UserPlus className="h-4 w-4 mr-2" />
                              Invite
                            </Button>
                            <Button
                              data-testid="export-workspace-btn-1"
                              size="sm"
                              variant="outline"
                              onClick={() => handleExportWorkspace('marketing-2025')}
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Export
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Workspace 2 */}
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-teal-500 rounded-lg flex items-center justify-center">
                          <Briefcase className="h-8 w-8 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold">Product Development</h4>
                            <Badge variant="default" className="text-xs">Active</Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">New feature development and testing workspace</p>
                          <div className="grid grid-cols-4 gap-4 mb-3">
                            <div>
                              <p className="text-xs text-gray-500">Collaborators</p>
                              <p className="font-semibold">12 members</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Files</p>
                              <p className="font-semibold">87 files</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Comments</p>
                              <p className="font-semibold">247 comments</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Last Activity</p>
                              <p className="font-semibold">12 min ago</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              data-testid="join-workspace-btn-2"
                              size="sm"
                              variant="default"
                              onClick={() => handleJoinWorkspace('product-dev')}
                            >
                              Open Workspace
                            </Button>
                            <Button
                              data-testid="invite-to-workspace-btn-2"
                              size="sm"
                              variant="outline"
                              onClick={handleInviteMember}
                            >
                              <UserPlus className="h-4 w-4 mr-2" />
                              Invite
                            </Button>
                            <Button
                              data-testid="export-workspace-btn-2"
                              size="sm"
                              variant="outline"
                              onClick={() => handleExportWorkspace('product-dev')}
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Export
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Workspace 3 */}
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                          <Briefcase className="h-8 w-8 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold">Design System 2.0</h4>
                            <Badge variant="secondary" className="text-xs">Active</Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">UI/UX design system components and guidelines</p>
                          <div className="grid grid-cols-4 gap-4 mb-3">
                            <div>
                              <p className="text-xs text-gray-500">Collaborators</p>
                              <p className="font-semibold">6 members</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Files</p>
                              <p className="font-semibold">45 files</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Comments</p>
                              <p className="font-semibold">134 comments</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Last Activity</p>
                              <p className="font-semibold">1 hour ago</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              data-testid="join-workspace-btn-3"
                              size="sm"
                              variant="default"
                              onClick={() => handleJoinWorkspace('design-system')}
                            >
                              Open Workspace
                            </Button>
                            <Button
                              data-testid="invite-to-workspace-btn-3"
                              size="sm"
                              variant="outline"
                              onClick={handleInviteMember}
                            >
                              <UserPlus className="h-4 w-4 mr-2" />
                              Invite
                            </Button>
                            <Button
                              data-testid="export-workspace-btn-3"
                              size="sm"
                              variant="outline"
                              onClick={() => handleExportWorkspace('design-system')}
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Export
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Recent activity */}
                <div className="space-y-3">
                  <h3 className="font-semibold">Recent Activity</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <Edit className="h-5 w-5 text-blue-600" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Sarah Anderson edited "Brand Guidelines.pdf"</p>
                        <p className="text-xs text-gray-500">Marketing Campaign 2025 • 5 min ago</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <MessageCircle className="h-5 w-5 text-green-600" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Mike Chen added 3 comments</p>
                        <p className="text-xs text-gray-500">Product Development • 12 min ago</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <Upload className="h-5 w-5 text-purple-600" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Jessica Davis uploaded 4 new files</p>
                        <p className="text-xs text-gray-500">Design System 2.0 • 1 hour ago</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="meetings" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Video className="h-5 w-5" />
                Meetings
              </CardTitle>
              <CardDescription>
                Video conferencing with advanced meeting controls and recording
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Meeting quick actions */}
                <div className="flex gap-2 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border">
                  <Button
                    data-testid="start-meeting-btn"
                    variant="default"
                    onClick={handleStartMeeting}
                  >
                    <Video className="h-4 w-4 mr-2" />
                    Start Meeting
                  </Button>
                  <Button
                    data-testid="schedule-recurring-btn"
                    variant="outline"
                    onClick={handleRecurringMeeting}
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Schedule Recurring
                  </Button>
                  <Button
                    data-testid="view-recordings-btn"
                    variant="outline"
                    onClick={handleRecordMeeting}
                  >
                    <Play className="h-4 w-4 mr-2" />
                    View Recordings
                  </Button>
                </div>

                {/* Upcoming meetings */}
                <div className="space-y-3">
                  <h3 className="font-semibold">Upcoming Meetings</h3>

                  {/* Meeting 1 */}
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                          <Video className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold">Team Standup</h4>
                            <Badge variant="default" className="text-xs">In 15 min</Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">Daily sync meeting</p>
                          <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              <span>10:00 AM - 10:30 AM</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              <span>8 participants</span>
                            </div>
                          </div>
                          <Button
                            data-testid="join-meeting-btn-1"
                            size="sm"
                            variant="default"
                            onClick={() => handleJoinMeeting('meeting-001')}
                          >
                            Join Meeting
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Meeting 2 */}
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                          <Video className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold">Product Review</h4>
                            <Badge variant="secondary" className="text-xs">Today 2:00 PM</Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">Weekly product development review</p>
                          <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              <span>2:00 PM - 3:00 PM</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              <span>12 participants</span>
                            </div>
                          </div>
                          <Button
                            data-testid="join-meeting-btn-2"
                            size="sm"
                            variant="outline"
                            onClick={() => handleJoinMeeting('meeting-002')}
                          >
                            View Details
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Active meeting controls */}
                <div className="p-4 bg-gradient-to-r from-green-50 to-teal-50 rounded-lg border">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <h3 className="font-semibold">Meeting Controls</h3>
                    <Badge variant="default" className="text-xs">Live</Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      data-testid="share-screen-btn"
                      size="sm"
                      variant="outline"
                      onClick={() => handleShareScreen()}
                    >
                      <Monitor className="h-4 w-4 mr-2" />
                      Share Screen
                    </Button>
                    <Button
                      data-testid="record-meeting-btn"
                      size="sm"
                      variant="outline"
                      onClick={handleRecordMeeting}
                    >
                      <Square className="h-4 w-4 mr-2" />
                      Record
                    </Button>
                    <Button
                      data-testid="breakout-rooms-btn"
                      size="sm"
                      variant="outline"
                      onClick={handleCreateBreakoutRoom}
                    >
                      <Users className="h-4 w-4 mr-2" />
                      Breakout
                    </Button>
                    <Button
                      data-testid="live-captions-btn"
                      size="sm"
                      variant="outline"
                      onClick={handleLiveCaptions}
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Captions
                    </Button>
                    <Button
                      data-testid="virtual-background-btn"
                      size="sm"
                      variant="outline"
                      onClick={handleVirtualBackground}
                    >
                      <Image className="h-4 w-4 mr-2" />
                      Background
                    </Button>
                    <Button
                      data-testid="mute-participant-btn"
                      size="sm"
                      variant="outline"
                      onClick={() => handleMuteParticipant('John Doe')}
                    >
                      <Mic className="h-4 w-4 mr-2" />
                      Mute All
                    </Button>
                    <Button
                      data-testid="spotlight-participant-btn"
                      size="sm"
                      variant="outline"
                      onClick={() => handleSpotlightParticipant('Sarah Anderson')}
                    >
                      <Zap className="h-4 w-4 mr-2" />
                      Spotlight
                    </Button>
                    <Button
                      data-testid="raise-hand-btn"
                      size="sm"
                      variant="outline"
                      onClick={handleRaiseHand}
                    >
                      <Activity className="h-4 w-4 mr-2" />
                      Raise Hand
                    </Button>
                    <Button
                      data-testid="create-poll-btn"
                      size="sm"
                      variant="outline"
                      onClick={handleCreatePoll}
                    >
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Poll
                    </Button>
                  </div>
                </div>

                {/* Past meetings */}
                <div className="space-y-3">
                  <h3 className="font-semibold">Past Meetings</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <Play className="h-5 w-5 text-blue-600" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Sprint Planning Meeting</p>
                        <p className="text-xs text-gray-500">Yesterday • 1h 23m • Recording available</p>
                      </div>
                      <Button size="sm" variant="ghost">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <Play className="h-5 w-5 text-green-600" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Client Presentation</p>
                        <p className="text-xs text-gray-500">2 days ago • 45m • Recording available</p>
                      </div>
                      <Button size="sm" variant="ghost">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <Play className="h-5 w-5 text-purple-600" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Design Review</p>
                        <p className="text-xs text-gray-500">3 days ago • 1h 12m • Recording available</p>
                      </div>
                      <Button size="sm" variant="ghost">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="feedback" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Pin className="h-5 w-5" />
                Universal Pinpoint System (UPS)
              </CardTitle>
              <CardDescription>
                Revolutionary pinpoint feedback on any media type with precise annotations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* UPS Demo button */}
                <div className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border-2 border-blue-200">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                      <Pin className="h-8 w-8 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-1">Universal Pinpoint System</h3>
                      <p className="text-sm text-gray-600">Add precise feedback anywhere on any media</p>
                    </div>
                  </div>
                  <Button
                    data-testid="launch-ups-btn"
                    size="lg"
                    variant="default"
                    onClick={handleAddPinpointFeedback}
                    className="w-full"
                  >
                    <Pin className="h-5 w-5 mr-2" />
                    Launch UPS Demo
                  </Button>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  {/* Supported media types */}
                  <div className="space-y-4">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Image className="h-5 w-5 text-blue-600" />
                      Supported Media Types
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-4 border-2 rounded-lg text-center hover:bg-blue-50 transition-colors">
                        <Image className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                        <p className="text-sm font-medium">Images</p>
                        <p className="text-xs text-gray-500">JPG, PNG, GIF</p>
                      </div>
                      <div className="p-4 border-2 rounded-lg text-center hover:bg-green-50 transition-colors">
                        <Play className="h-8 w-8 mx-auto mb-2 text-green-600" />
                        <p className="text-sm font-medium">Videos</p>
                        <p className="text-xs text-gray-500">MP4, MOV, AVI</p>
                      </div>
                      <div className="p-4 border-2 rounded-lg text-center hover:bg-purple-50 transition-colors">
                        <FileText className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                        <p className="text-sm font-medium">Documents</p>
                        <p className="text-xs text-gray-500">PDF, DOC, XLSX</p>
                      </div>
                      <div className="p-4 border-2 rounded-lg text-center hover:bg-orange-50 transition-colors">
                        <Mic className="h-8 w-8 mx-auto mb-2 text-orange-600" />
                        <p className="text-sm font-medium">Audio</p>
                        <p className="text-xs text-gray-500">MP3, WAV, M4A</p>
                      </div>
                    </div>
                  </div>

                  {/* UPS Benefits */}
                  <div className="space-y-4">
                    <h3 className="font-semibold flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      Key Benefits
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                        <div>
                          <p className="font-medium text-sm">Precise Annotations</p>
                          <p className="text-xs text-gray-600">Click exactly where you want feedback</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                        <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                        <div>
                          <p className="font-medium text-sm">Real-time Collaboration</p>
                          <p className="text-xs text-gray-600">See team feedback instantly</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
                        <CheckCircle className="h-5 w-5 text-purple-600 mt-0.5" />
                        <div>
                          <p className="font-medium text-sm">Thread Conversations</p>
                          <p className="text-xs text-gray-600">Reply to feedback directly</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg">
                        <CheckCircle className="h-5 w-5 text-orange-600 mt-0.5" />
                        <div>
                          <p className="font-medium text-sm">Status Tracking</p>
                          <p className="text-xs text-gray-600">Open, in-progress, resolved</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Integration status */}
                <div className="p-4 bg-gradient-to-r from-green-50 to-teal-50 rounded-lg border">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <h3 className="font-semibold">Integration Status</h3>
                    <Badge variant="default" className="text-xs">Active</Badge>
                  </div>
                  <p className="text-sm text-gray-600">UPS is integrated across all collaboration tools including Chat, Workspaces, and Video Studio.</p>
                </div>

                {/* Example use cases */}
                <div className="space-y-3">
                  <h3 className="font-semibold">Example Use Cases</h3>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-4 border rounded-lg hover:bg-gray-50">
                      <Image className="h-6 w-6 mb-2 text-blue-600" />
                      <p className="font-medium text-sm">Design Review</p>
                      <p className="text-xs text-gray-500">Annotate UI mockups</p>
                    </div>
                    <div className="p-4 border rounded-lg hover:bg-gray-50">
                      <Play className="h-6 w-6 mb-2 text-green-600" />
                      <p className="font-medium text-sm">Video Feedback</p>
                      <p className="text-xs text-gray-500">Comment at timestamps</p>
                    </div>
                    <div className="p-4 border rounded-lg hover:bg-gray-50">
                      <FileText className="h-6 w-6 mb-2 text-purple-600" />
                      <p className="font-medium text-sm">Document Review</p>
                      <p className="text-xs text-gray-500">Mark specific sections</p>
                    </div>
                  </div>
                </div>

                {/* AI FEEDBACK ANALYSIS DASHBOARD - USER MANUAL SPEC */}
                <ScrollReveal delay={0.2}>
                  <div className="mt-8 p-6 bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 rounded-lg border-2 border-purple-200">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-full flex items-center justify-center">
                        <Brain className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                          <Sparkles className="w-6 h-6 text-purple-600" />
                          AI Feedback Analysis
                        </h3>
                        <p className="text-sm text-gray-600">Smart categorization, priority identification, and implementation roadmap</p>
                      </div>
                    </div>

                    {/* AI Insights Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      {/* Feedback Themes */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white rounded-lg p-4 shadow-sm"
                      >
                        <div className="flex items-center gap-2 mb-3">
                          <ListChecks className="w-5 h-5 text-purple-600" />
                          <h4 className="font-semibold text-gray-900">Feedback Themes</h4>
                        </div>
                        <p className="text-3xl font-bold text-purple-600 mb-2">
                          <NumberFlow value={5} />
                        </p>
                        <p className="text-sm text-gray-600 mb-3">themes identified</p>
                        <div className="flex flex-wrap gap-1">
                          <Badge className="bg-purple-100 text-purple-700 text-xs">Design</Badge>
                          <Badge className="bg-blue-100 text-blue-700 text-xs">Performance</Badge>
                          <Badge className="bg-green-100 text-green-700 text-xs">UX</Badge>
                          <Badge className="bg-orange-100 text-orange-700 text-xs">Content</Badge>
                          <Badge className="bg-pink-100 text-pink-700 text-xs">Features</Badge>
                        </div>
                      </motion.div>

                      {/* Critical Issues */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white rounded-lg p-4 shadow-sm"
                      >
                        <div className="flex items-center gap-2 mb-3">
                          <AlertTriangle className="w-5 h-5 text-red-600" />
                          <h4 className="font-semibold text-gray-900">Critical Issues</h4>
                        </div>
                        <p className="text-3xl font-bold text-red-600 mb-2">
                          <NumberFlow value={3} />
                        </p>
                        <p className="text-sm text-gray-600 mb-3">require immediate attention</p>
                        <Button size="sm" variant="destructive" className="w-full">
                          <Target className="w-4 h-4 mr-2" />
                          View & Address
                        </Button>
                      </motion.div>

                      {/* Implementation Time */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-white rounded-lg p-4 shadow-sm"
                      >
                        <div className="flex items-center gap-2 mb-3">
                          <Timer className="w-5 h-5 text-blue-600" />
                          <h4 className="font-semibold text-gray-900">Est. Time</h4>
                        </div>
                        <p className="text-3xl font-bold text-blue-600 mb-2">
                          <NumberFlow value={12} /> hrs
                        </p>
                        <p className="text-sm text-gray-600 mb-2">to implement all feedback</p>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: "30%" }}
                            transition={{ duration: 1, delay: 0.5 }}
                            className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full"
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">30% complete</p>
                      </motion.div>
                    </div>

                    {/* Feedback Categories Breakdown */}
                    <div className="bg-white rounded-lg p-5 shadow-sm mb-6">
                      <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-purple-600" />
                        Feedback by Category
                      </h4>
                      <div className="space-y-3">
                        {[
                          { category: "Design", count: 18, color: "purple", percentage: 90 },
                          { category: "Performance", count: 12, color: "blue", percentage: 60 },
                          { category: "UX/Usability", count: 15, color: "green", percentage: 75 },
                          { category: "Content", count: 8, color: "orange", percentage: 40 },
                          { category: "New Features", count: 10, color: "pink", percentage: 50 }
                        ].map((item, index) => (
                          <div key={item.category} className="space-y-1">
                            <div className="flex items-center justify-between text-sm">
                              <span className="font-medium text-gray-700">{item.category}</span>
                              <span className="text-gray-600">{item.count} items</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${item.percentage}%` }}
                                transition={{ duration: 0.8, delay: index * 0.1 }}
                                className={`h-full bg-gradient-to-r ${
                                  item.color === 'purple' ? 'from-purple-500 to-purple-600' :
                                  item.color === 'blue' ? 'from-blue-500 to-blue-600' :
                                  item.color === 'green' ? 'from-green-500 to-green-600' :
                                  item.color === 'orange' ? 'from-orange-500 to-orange-600' :
                                  'from-pink-500 to-pink-600'
                                }`}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Priority Breakdown */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                      {[
                        { priority: "Critical", count: 3, color: "red", icon: AlertTriangle },
                        { priority: "High", count: 8, color: "orange", icon: TrendingUp },
                        { priority: "Medium", count: 12, color: "yellow", icon: Activity },
                        { priority: "Low", count: 5, color: "green", icon: CheckCircle }
                      ].map((item, index) => {
                        const Icon = item.icon
                        return (
                          <motion.div
                            key={item.priority}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.1 }}
                            className={`bg-gradient-to-br ${
                              item.color === 'red' ? 'from-red-50 to-red-100 border-red-200' :
                              item.color === 'orange' ? 'from-orange-50 to-orange-100 border-orange-200' :
                              item.color === 'yellow' ? 'from-yellow-50 to-yellow-100 border-yellow-200' :
                              'from-green-50 to-green-100 border-green-200'
                            } rounded-lg p-4 border-2`}
                          >
                            <Icon className={`w-5 h-5 mb-2 ${
                              item.color === 'red' ? 'text-red-600' :
                              item.color === 'orange' ? 'text-orange-600' :
                              item.color === 'yellow' ? 'text-yellow-600' :
                              'text-green-600'
                            }`} />
                            <p className={`text-2xl font-bold ${
                              item.color === 'red' ? 'text-red-700' :
                              item.color === 'orange' ? 'text-orange-700' :
                              item.color === 'yellow' ? 'text-yellow-700' :
                              'text-green-700'
                            }`}>
                              <NumberFlow value={item.count} />
                            </p>
                            <p className="text-xs text-gray-600">{item.priority} Priority</p>
                          </motion.div>
                        )
                      })}
                    </div>

                    {/* Implementation Roadmap */}
                    <div className="bg-white rounded-lg p-5 shadow-sm mb-6">
                      <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Target className="w-5 h-5 text-indigo-600" />
                        Implementation Roadmap
                      </h4>
                      <div className="space-y-4">
                        {[
                          {
                            phase: 1,
                            time: "2 hours",
                            tasks: ["Fix navigation bug", "Update color contrast"],
                            status: "completed"
                          },
                          {
                            phase: 2,
                            time: "5 hours",
                            tasks: ["Redesign dashboard layout", "Add missing features"],
                            status: "in-progress"
                          },
                          {
                            phase: 3,
                            time: "3 hours",
                            tasks: ["Performance optimizations", "Mobile responsiveness"],
                            status: "pending"
                          },
                          {
                            phase: 4,
                            time: "2 hours",
                            tasks: ["Content updates", "Final polish"],
                            status: "pending"
                          }
                        ].map((phase, index) => (
                          <motion.div
                            key={phase.phase}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.15 }}
                            className={`p-4 rounded-lg border-2 ${
                              phase.status === 'completed' ? 'bg-green-50 border-green-200' :
                              phase.status === 'in-progress' ? 'bg-blue-50 border-blue-200' :
                              'bg-gray-50 border-gray-200'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                                  phase.status === 'completed' ? 'bg-green-600' :
                                  phase.status === 'in-progress' ? 'bg-blue-600' :
                                  'bg-gray-400'
                                }`}>
                                  {phase.status === 'completed' ? <CheckCircle className="w-5 h-5" /> : phase.phase}
                                </div>
                                <div>
                                  <p className="font-semibold text-gray-900">Phase {phase.phase}</p>
                                  <p className="text-xs text-gray-600 flex items-center gap-1">
                                    <Timer className="w-3 h-3" />
                                    {phase.time}
                                  </p>
                                </div>
                              </div>
                              <Badge className={
                                phase.status === 'completed' ? 'bg-green-500' :
                                phase.status === 'in-progress' ? 'bg-blue-500' :
                                'bg-gray-400'
                              }>
                                {phase.status === 'completed' ? 'Completed' :
                                 phase.status === 'in-progress' ? 'In Progress' :
                                 'Pending'}
                              </Badge>
                            </div>
                            <div className="space-y-2">
                              {phase.tasks.map((task, taskIndex) => (
                                <div key={taskIndex} className="flex items-center gap-2 text-sm text-gray-700">
                                  {phase.status === 'completed' ? (
                                    <CheckCircle className="w-4 h-4 text-green-600" />
                                  ) : phase.status === 'in-progress' ? (
                                    <div className="w-4 h-4 border-2 border-blue-600 rounded-full animate-pulse" />
                                  ) : (
                                    <div className="w-4 h-4 border-2 border-gray-400 rounded-full" />
                                  )}
                                  <span>{task}</span>
                                </div>
                              ))}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    {/* Smart Insights */}
                    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-5 border-2 border-indigo-200">
                      <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-indigo-600" />
                        AI-Generated Insights
                      </h4>
                      <div className="space-y-3">
                        <div className="bg-white rounded-lg p-4">
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                              <TrendingUp className="w-4 h-4 text-purple-600" />
                            </div>
                            <div>
                              <p className="font-semibold text-sm text-gray-900 mb-1">Most Common Issue</p>
                              <p className="text-sm text-gray-600">"Navigation confusion" - mentioned in 12 feedback items. Consider redesigning the main menu structure.</p>
                            </div>
                          </div>
                        </div>
                        <div className="bg-white rounded-lg p-4">
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                              <PieChart className="w-4 h-4 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-semibold text-sm text-gray-900 mb-1">Client Satisfaction Score</p>
                              <div className="flex items-center gap-2">
                                <p className="text-2xl font-bold text-blue-600">8.2/10</p>
                                <Badge className="bg-green-500 text-xs">+0.5 vs last month</Badge>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="bg-white rounded-lg p-4">
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                              <Target className="w-4 h-4 text-green-600" />
                            </div>
                            <div>
                              <p className="font-semibold text-sm text-gray-900 mb-1">Quality Trends</p>
                              <p className="text-sm text-gray-600">
                                <Badge className="bg-green-500 text-xs mr-2">Improving</Badge>
                                Positive sentiment increased by 15% since last review cycle.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-6 flex gap-3">
                      <Button
                        size="lg"
                        className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                        onClick={() => {
                          logger.info('AI Feedback Analysis - Export report clicked', {
                            totalFeedback: 63,
                            categories: 5,
                            criticalIssues: 3,
                            estimatedTime: 12
                          })
                          toast.success('📊 Exporting AI Analysis Report', {
                            description: 'PDF report with all insights, roadmap, and recommendations'
                          })
                        }}
                      >
                        <Download className="w-5 h-5 mr-2" />
                        Export Full Report
                      </Button>
                      <Button
                        size="lg"
                        variant="outline"
                        onClick={() => {
                          logger.info('AI Feedback Analysis - View detailed roadmap clicked')
                          toast.info('🗺️ Opening Implementation Roadmap', {
                            description: 'Interactive roadmap with dependencies and timelines'
                          })
                        }}
                      >
                        <ArrowRight className="w-5 w-5 mr-2" />
                        View Full Roadmap
                      </Button>
                    </div>

                    {/* Info Banner */}
                    <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-start gap-3">
                        <Brain className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div>
                          <p className="text-sm font-semibold text-blue-900 mb-1">AI-Powered Analysis</p>
                          <p className="text-xs text-blue-700">
                            This analysis uses advanced AI to categorize feedback, identify patterns, estimate implementation time, and generate actionable insights. Analysis updates in real-time as new feedback arrives.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </ScrollReveal>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="media" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Image className="h-5 w-5" />
                Shared Media
              </CardTitle>
              <CardDescription>
                Centralized media library with preview and sharing capabilities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Upload action */}
                <div className="flex gap-2">
                  <Button
                    data-testid="upload-media-btn"
                    variant="default"
                    onClick={handleSendFile}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Media
                  </Button>
                  <Button
                    data-testid="view-all-media-btn"
                    variant="outline"
                    onClick={() => setShowMediaGallery(true)}
                  >
                    View All
                  </Button>
                </div>

                {/* Media gallery */}
                <div className="space-y-3">
                  <h3 className="font-semibold">Recent Media</h3>
                  <div className="grid grid-cols-3 gap-4">
                    {/* Media item 1 - Image */}
                    <Card>
                      <CardContent className="pt-6">
                        <div className="aspect-video bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg mb-3 flex items-center justify-center">
                          <Image className="h-12 w-12 text-blue-600" />
                        </div>
                        <p className="font-medium text-sm mb-1">Brand_Logo_v2.png</p>
                        <p className="text-xs text-gray-500 mb-3">Uploaded 2 hours ago • 1.2 MB</p>
                        <div className="flex gap-2">
                          <Button
                            data-testid="preview-media-btn-1"
                            size="sm"
                            variant="ghost"
                            onClick={() => handleViewMediaPreview('image')}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost">
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost">
                            <Share2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Media item 2 - Video */}
                    <Card>
                      <CardContent className="pt-6">
                        <div className="aspect-video bg-gradient-to-br from-green-100 to-green-200 rounded-lg mb-3 flex items-center justify-center">
                          <Play className="h-12 w-12 text-green-600" />
                        </div>
                        <p className="font-medium text-sm mb-1">Product_Demo.mp4</p>
                        <p className="text-xs text-gray-500 mb-3">Uploaded yesterday • 45 MB</p>
                        <div className="flex gap-2">
                          <Button
                            data-testid="preview-media-btn-2"
                            size="sm"
                            variant="ghost"
                            onClick={() => handleViewMediaPreview('video')}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost">
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost">
                            <Share2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Media item 3 - Document */}
                    <Card>
                      <CardContent className="pt-6">
                        <div className="aspect-video bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg mb-3 flex items-center justify-center">
                          <FileText className="h-12 w-12 text-purple-600" />
                        </div>
                        <p className="font-medium text-sm mb-1">Q1_Report.pdf</p>
                        <p className="text-xs text-gray-500 mb-3">Uploaded 2 days ago • 3.8 MB</p>
                        <div className="flex gap-2">
                          <Button
                            data-testid="preview-media-btn-3"
                            size="sm"
                            variant="ghost"
                            onClick={() => handleViewMediaPreview('document')}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost">
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost">
                            <Share2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Media item 4 - Image */}
                    <Card>
                      <CardContent className="pt-6">
                        <div className="aspect-video bg-gradient-to-br from-orange-100 to-orange-200 rounded-lg mb-3 flex items-center justify-center">
                          <Image className="h-12 w-12 text-orange-600" />
                        </div>
                        <p className="font-medium text-sm mb-1">Mockup_Homepage.jpg</p>
                        <p className="text-xs text-gray-500 mb-3">Uploaded 3 days ago • 2.1 MB</p>
                        <div className="flex gap-2">
                          <Button
                            data-testid="preview-media-btn-4"
                            size="sm"
                            variant="ghost"
                            onClick={() => handleViewMediaPreview('image')}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost">
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost">
                            <Share2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Media item 5 - Video */}
                    <Card>
                      <CardContent className="pt-6">
                        <div className="aspect-video bg-gradient-to-br from-red-100 to-red-200 rounded-lg mb-3 flex items-center justify-center">
                          <Play className="h-12 w-12 text-red-600" />
                        </div>
                        <p className="font-medium text-sm mb-1">Meeting_Recording.mp4</p>
                        <p className="text-xs text-gray-500 mb-3">Uploaded 4 days ago • 127 MB</p>
                        <div className="flex gap-2">
                          <Button
                            data-testid="preview-media-btn-5"
                            size="sm"
                            variant="ghost"
                            onClick={() => handleViewMediaPreview('video')}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost">
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost">
                            <Share2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Media item 6 - Document */}
                    <Card>
                      <CardContent className="pt-6">
                        <div className="aspect-video bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-lg mb-3 flex items-center justify-center">
                          <FileText className="h-12 w-12 text-indigo-600" />
                        </div>
                        <p className="font-medium text-sm mb-1">Style_Guide.pdf</p>
                        <p className="text-xs text-gray-500 mb-3">Uploaded 1 week ago • 5.3 MB</p>
                        <div className="flex gap-2">
                          <Button
                            data-testid="preview-media-btn-6"
                            size="sm"
                            variant="ghost"
                            onClick={() => handleViewMediaPreview('document')}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost">
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost">
                            <Share2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {/* Media stats */}
                <div className="grid grid-cols-4 gap-4">
                  <div className="p-4 bg-blue-50 rounded-lg text-center">
                    <p className="text-2xl font-bold text-blue-600">156</p>
                    <p className="text-sm text-gray-600">Total Files</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg text-center">
                    <p className="text-2xl font-bold text-green-600">2.4 GB</p>
                    <p className="text-sm text-gray-600">Storage Used</p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg text-center">
                    <p className="text-2xl font-bold text-purple-600">89</p>
                    <p className="text-sm text-gray-600">Shared Files</p>
                  </div>
                  <div className="p-4 bg-orange-50 rounded-lg text-center">
                    <p className="text-2xl font-bold text-orange-600">12</p>
                    <p className="text-sm text-gray-600">Folders</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="canvas" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Square className="h-5 w-5" />
                Collaborative Canvas
              </CardTitle>
              <CardDescription>
                Figma-style real-time design collaboration with live cursors
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Canvas actions */}
                <div className="flex gap-2 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border">
                  <Button
                    data-testid="start-whiteboard-btn"
                    variant="default"
                    onClick={handleStartWhiteboard}
                  >
                    <Square className="h-4 w-4 mr-2" />
                    Start Whiteboard
                  </Button>
                  <Button
                    data-testid="create-canvas-btn"
                    variant="outline"
                    onClick={handleCreateCanvas}
                  >
                    Create Canvas
                  </Button>
                  <Button
                    data-testid="export-canvas-btn"
                    variant="outline"
                    onClick={handleExportMedia}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>

                {/* Canvas preview */}
                <div className="aspect-video bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Square className="h-12 w-12 text-white" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Real-Time Canvas</h3>
                    <p className="text-gray-600 mb-4">Collaborate on designs with your team in real-time</p>
                    <div className="flex gap-2 justify-center">
                      <Button
                        data-testid="start-canvas-collaboration-btn"
                        onClick={handleStartWhiteboard}
                      >
                        <Users className="h-4 w-4 mr-2" />
                        Start Collaboration
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Drawing tools */}
                <div className="space-y-3">
                  <h3 className="font-semibold">Drawing Tools</h3>
                  <div className="grid grid-cols-6 gap-2">
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Square className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Activity className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <MessageCircle className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Image className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Templates */}
                <div className="space-y-3">
                  <h3 className="font-semibold">Templates</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                      <div className="aspect-video bg-gradient-to-br from-blue-100 to-blue-200 rounded mb-2"></div>
                      <p className="font-medium text-sm">Wireframe</p>
                      <p className="text-xs text-gray-500">UI/UX design template</p>
                    </div>
                    <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                      <div className="aspect-video bg-gradient-to-br from-green-100 to-green-200 rounded mb-2"></div>
                      <p className="font-medium text-sm">Flowchart</p>
                      <p className="text-xs text-gray-500">Process diagram template</p>
                    </div>
                    <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                      <div className="aspect-video bg-gradient-to-br from-purple-100 to-purple-200 rounded mb-2"></div>
                      <p className="font-medium text-sm">Mind Map</p>
                      <p className="text-xs text-gray-500">Brainstorming template</p>
                    </div>
                  </div>
                </div>

                {/* Recent canvases */}
                <div className="space-y-3">
                  <h3 className="font-semibold">Recent Canvases</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <Square className="h-5 w-5 text-blue-600" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Product Wireframes</p>
                        <p className="text-xs text-gray-500">Edited 1 hour ago • 8 collaborators</p>
                      </div>
                      <Button size="sm" variant="ghost">Open</Button>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <Square className="h-5 w-5 text-green-600" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">User Flow Diagram</p>
                        <p className="text-xs text-gray-500">Edited yesterday • 5 collaborators</p>
                      </div>
                      <Button size="sm" variant="ghost">Open</Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Collaboration Analytics
              </CardTitle>
              <CardDescription>
                Real-time collaboration intelligence and team performance metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Team Performance Section */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <Users className="h-5 w-5 text-blue-600" />
                    Team Performance
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm text-gray-600">Total Members</p>
                          <Users className="h-4 w-4 text-blue-600" />
                        </div>
                        <p className="text-3xl font-bold">12</p>
                        <p className="text-xs text-gray-500">Active team members</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm text-gray-600">Online Now</p>
                          <Activity className="h-4 w-4 text-green-600" />
                        </div>
                        <p className="text-3xl font-bold">8</p>
                        <p className="text-xs text-green-600">+67% online rate</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm text-gray-600">Active Projects</p>
                          <Briefcase className="h-4 w-4 text-purple-600" />
                        </div>
                        <p className="text-3xl font-bold">27</p>
                        <p className="text-xs text-gray-500">Ongoing projects</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm text-gray-600">Collaboration Rate</p>
                          <TrendingUp className="h-4 w-4 text-blue-600" />
                        </div>
                        <p className="text-3xl font-bold">94%</p>
                        <p className="text-xs text-blue-600">+8% this month</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm text-gray-600">Response Time</p>
                          <Clock className="h-4 w-4 text-orange-600" />
                        </div>
                        <p className="text-3xl font-bold">2.3h</p>
                        <p className="text-xs text-gray-500">Average response</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm text-gray-600">Completion Rate</p>
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        </div>
                        <p className="text-3xl font-bold">87%</p>
                        <p className="text-xs text-green-600">On-time delivery</p>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {/* Meeting Statistics Section */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <Video className="h-5 w-5 text-green-600" />
                    Meeting Statistics
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm text-gray-600">Meetings This Week</p>
                          <Calendar className="h-4 w-4 text-blue-600" />
                        </div>
                        <p className="text-3xl font-bold">12</p>
                        <p className="text-xs text-gray-500">Scheduled meetings</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm text-gray-600">Total Time</p>
                          <Clock className="h-4 w-4 text-purple-600" />
                        </div>
                        <p className="text-3xl font-bold">8.5h</p>
                        <p className="text-xs text-gray-500">Meeting duration</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm text-gray-600">Total Participants</p>
                          <Users className="h-4 w-4 text-green-600" />
                        </div>
                        <p className="text-3xl font-bold">47</p>
                        <p className="text-xs text-gray-500">Unique attendees</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm text-gray-600">Attendance</p>
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        </div>
                        <p className="text-3xl font-bold">96%</p>
                        <p className="text-xs text-green-600">Great attendance!</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm text-gray-600">Connection Quality</p>
                          <Zap className="h-4 w-4 text-blue-600" />
                        </div>
                        <p className="text-3xl font-bold">98%</p>
                        <p className="text-xs text-blue-600">Excellent quality</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm text-gray-600">Audio Quality</p>
                          <Mic className="h-4 w-4 text-purple-600" />
                        </div>
                        <p className="text-3xl font-bold">95%</p>
                        <p className="text-xs text-gray-500">Clear audio</p>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {/* Communication Insights Section */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <MessageCircle className="h-5 w-5 text-purple-600" />
                    Communication Insights
                  </h3>
                  <div className="grid grid-cols-4 gap-4">
                    <Card className="col-span-2">
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm text-gray-600">Total Interactions</p>
                          <MessageCircle className="h-4 w-4 text-blue-600" />
                        </div>
                        <div className="flex items-baseline gap-2">
                          <p className="text-3xl font-bold">847</p>
                          <Badge variant="default" className="text-xs">+23%</Badge>
                        </div>
                        <p className="text-xs text-gray-500">vs last week</p>
                      </CardContent>
                    </Card>
                    <Card className="col-span-2">
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm text-gray-600">Engagement Rate</p>
                          <TrendingUp className="h-4 w-4 text-green-600" />
                        </div>
                        <p className="text-3xl font-bold">96%</p>
                        <p className="text-xs text-green-600">High engagement</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm text-gray-600">Chat Messages</p>
                          <MessageCircle className="h-4 w-4 text-blue-600" />
                        </div>
                        <p className="text-2xl font-bold">1,247</p>
                        <p className="text-xs text-gray-500">45% of total</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm text-gray-600">Comments</p>
                          <Pin className="h-4 w-4 text-purple-600" />
                        </div>
                        <p className="text-2xl font-bold">834</p>
                        <p className="text-xs text-gray-500">30% of total</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm text-gray-600">Video Calls</p>
                          <Video className="h-4 w-4 text-green-600" />
                        </div>
                        <p className="text-2xl font-bold">389</p>
                        <p className="text-xs text-gray-500">14% of total</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm text-gray-600">File Shares</p>
                          <Upload className="h-4 w-4 text-orange-600" />
                        </div>
                        <p className="text-2xl font-bold">312</p>
                        <p className="text-xs text-gray-500">11% of total</p>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {/* Collaboration Metrics Section */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <Zap className="h-5 w-5 text-orange-600" />
                    Collaboration Metrics
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm text-gray-600">Active Sessions</p>
                          <Activity className="h-4 w-4 text-blue-600" />
                        </div>
                        <p className="text-3xl font-bold">16</p>
                        <p className="text-xs text-gray-500">Real-time sessions</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm text-gray-600">Edits Today</p>
                          <Edit className="h-4 w-4 text-purple-600" />
                        </div>
                        <p className="text-3xl font-bold">247</p>
                        <p className="text-xs text-gray-500">Document changes</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm text-gray-600">Sync Time</p>
                          <Zap className="h-4 w-4 text-orange-600" />
                        </div>
                        <p className="text-3xl font-bold">3.2s</p>
                        <p className="text-xs text-gray-500">Average sync</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm text-gray-600">Uptime</p>
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        </div>
                        <p className="text-3xl font-bold">99.8%</p>
                        <p className="text-xs text-green-600">Excellent uptime</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm text-gray-600">Efficiency</p>
                          <TrendingUp className="h-4 w-4 text-blue-600" />
                        </div>
                        <p className="text-3xl font-bold">94%</p>
                        <p className="text-xs text-blue-600">+12% this month</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm text-gray-600">Conflict Resolution</p>
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        </div>
                        <p className="text-3xl font-bold">98%</p>
                        <p className="text-xs text-gray-500">Auto-resolved</p>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {/* Export analytics button */}
                <div className="flex justify-end">
                  <Button
                    data-testid="export-analytics-btn"
                    variant="default"
                    onClick={handleGenerateTeamReport}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export Analytics Report
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Delete Feedback Confirmation Dialog */}
      <AlertDialog open={showDeleteFeedbackDialog} onOpenChange={setShowDeleteFeedbackDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              Delete Feedback?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this feedback? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteFeedback}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Feedback
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Remove Participant Confirmation Dialog */}
      <AlertDialog open={showRemoveParticipantDialog} onOpenChange={setShowRemoveParticipantDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-yellow-600">
              <AlertTriangle className="w-5 h-5" />
              Remove Participant?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this participant from the collaboration?
              They will lose access to shared resources and conversations.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmRemoveParticipant}
              className="bg-yellow-600 hover:bg-yellow-700"
            >
              Remove Participant
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Emoji Picker Dialog */}
      <Dialog open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Smile className="w-5 h-5 text-yellow-500" />
              Emoji Picker
            </DialogTitle>
            <DialogDescription>
              Select an emoji to add to your message
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {Object.entries(emojiCategories).map(([category, emojis]) => (
              <div key={category}>
                <h4 className="text-sm font-medium text-gray-500 mb-2">{category}</h4>
                <div className="grid grid-cols-8 gap-1">
                  {emojis.map((emoji, index) => (
                    <button
                      key={index}
                      className={`p-2 text-xl rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${selectedEmoji === emoji ? 'bg-blue-100 dark:bg-blue-900' : ''}`}
                      onClick={() => {
                        setSelectedEmoji(emoji)
                        toast.success(`Emoji selected: ${emoji}`)
                        logger.info('Emoji selected', { emoji })
                        announce(`Emoji ${emoji} selected`, 'polite')
                      }}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEmojiPicker(false)}>Cancel</Button>
            <Button
              onClick={() => {
                if (selectedEmoji) {
                  toast.success(`Added reaction: ${selectedEmoji}`)
                  setShowEmojiPicker(false)
                  setSelectedEmoji(null)
                } else {
                  toast.error('Please select an emoji first')
                }
              }}
              disabled={!selectedEmoji}
            >
              Add Reaction
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Media Gallery Dialog */}
      <Dialog open={showMediaGallery} onOpenChange={setShowMediaGallery}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Image className="w-5 h-5 text-blue-500" />
              Media Gallery
            </DialogTitle>
            <DialogDescription>
              Browse and manage shared media files
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="text-blue-600">All</Button>
              <Button variant="ghost" size="sm">Images</Button>
              <Button variant="ghost" size="sm">Videos</Button>
              <Button variant="ghost" size="sm">Documents</Button>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {mediaItems.map((item) => (
                <div
                  key={item.id}
                  className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer group"
                  onClick={() => {
                    toast.info(`Opening ${item.name}`, { description: `${item.size} • ${item.date}` })
                    logger.info('Media item opened', { item: item.name, type: item.type })
                  }}
                >
                  <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center relative">
                    {item.type === 'image' ? (
                      <Image className="w-8 h-8 text-gray-400" />
                    ) : (
                      <Play className="w-8 h-8 text-gray-400" />
                    )}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <Button size="sm" variant="secondary">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="secondary">
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="p-3">
                    <p className="text-sm font-medium truncate">{item.name}</p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-gray-500">{item.size}</span>
                      <span className="text-xs text-gray-500">{item.date}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMediaGallery(false)}>Close</Button>
            <Button onClick={() => {
              toast.success('Upload Dialog', { description: 'Opening file upload...' })
            }}>
              <Upload className="w-4 h-4 mr-2" />
              Upload Media
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
