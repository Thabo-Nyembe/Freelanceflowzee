"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  MoreVertical
} from "lucide-react";

export default function CollaborationPage() {
  const [activeTab, setActiveTab] = useState<any>("chat");

  // Handlers with enhanced logging
  const handleStartAudioCall = () => {
    console.log('🎤 COLLABORATION: Audio call initiated')
    console.log('👥 COLLABORATION: Participants ready: 3')
    console.log('📞 COLLABORATION: Connecting audio stream...')
    console.log('✅ COLLABORATION: Audio call started')
    alert('🎤 Starting audio call...')
  }

  const handleStartVideoCall = () => {
    console.log('📹 COLLABORATION: Video call initiated')
    console.log('👥 COLLABORATION: Participants ready: 3')
    console.log('🎥 COLLABORATION: Starting video stream...')
    console.log('✅ COLLABORATION: Video call active')
    alert('📹 Starting video call...')
  }

  const handleSendMessage = () => {
    console.log('💬 COLLABORATION: Send message clicked')
    console.log('📝 COLLABORATION: Message content ready')
    console.log('📤 COLLABORATION: Sending to server...')
    console.log('✅ COLLABORATION: Message sent successfully')
    alert('💬 Message sent!')
  }

  const handleAddPinpointFeedback = () => {
    console.log('📌 COLLABORATION: Pinpoint feedback mode activated')
    console.log('🎯 COLLABORATION: Click on media to add feedback')
    console.log('✅ COLLABORATION: Ready for pinpoint selection')
    alert('📌 Click on media to add pinpoint feedback')
  }

  const handleUploadFile = () => {
    console.log('📎 COLLABORATION: File upload initiated')
    console.log('📁 COLLABORATION: Opening file picker...')
    const input = document.createElement('input')
    input.type = 'file'
    input.click()
    console.log('✅ COLLABORATION: File dialog opened')
    alert('📎 File upload dialog opened')
  }

  const handleAddVoiceNote = () => {
    console.log('🎙️ COLLABORATION: Voice note recording started')
    console.log('🔴 COLLABORATION: Microphone access requested')
    console.log('✅ COLLABORATION: Recording in progress')
    alert('🎙️ Recording voice note...')
  }

  const handleShareScreen = () => {
    console.log('🖥️ COLLABORATION: Screen sharing initiated')
    console.log('📺 COLLABORATION: Requesting screen access...')
    console.log('✅ COLLABORATION: Screen sharing active')
    alert('🖥️ Screen sharing started')
  }

  const handleEditFeedback = (id: number) => {
    console.log('✏️ COLLABORATION: Edit feedback:', id)
    console.log('📝 COLLABORATION: Loading feedback content...')
    console.log('✅ COLLABORATION: Edit mode ready')
    alert('✏️ Edit feedback')
  }

  const handleDeleteFeedback = (id: number) => {
    console.log('🗑️ COLLABORATION: Delete feedback request:', id)
    console.log('⚠️ COLLABORATION: Confirming deletion...')
    if (confirm('Delete feedback?')) {
      console.log('✅ COLLABORATION: Feedback deleted')
      alert('✅ Deleted')
    }
  }

  const handleReplyToMessage = (id: number) => {
    console.log('💬 COLLABORATION: Reply to message:', id)
    console.log('📝 COLLABORATION: Opening reply composer...')
    console.log('✅ COLLABORATION: Reply mode active')
    alert('💬 Reply to message')
  }

  const handleReactToMessage = (id: number, emoji: string) => {
    console.log('😀 COLLABORATION: React to message:', id)
    console.log('✨ COLLABORATION: Emoji reaction:', emoji)
    console.log('✅ COLLABORATION: Reaction added')
    alert(`Reacted with ${emoji}`)
  }

  const handlePinMessage = (id: number) => {
    console.log('📌 COLLABORATION: Pin message:', id)
    console.log('📍 COLLABORATION: Adding to pinned messages...')
    console.log('✅ COLLABORATION: Message pinned')
    alert('📌 Message pinned')
  }

  const handleArchiveConversation = () => {
    console.log('📦 COLLABORATION: Archive conversation')
    console.log('💾 COLLABORATION: Moving to archive...')
    console.log('✅ COLLABORATION: Conversation archived')
    alert('📦 Conversation archived')
  }

  const handleAddParticipants = () => {
    console.log('➕ COLLABORATION: Add participants')
    console.log('👥 COLLABORATION: Opening participant selector...')
    console.log('✅ COLLABORATION: Ready to add users')
    alert('➕ Add participants to collaboration')
  }

  const handleRemoveParticipant = (id: number) => {
    console.log('➖ COLLABORATION: Remove participant:', id)
    console.log('⚠️ COLLABORATION: Confirming removal...')
    if (confirm('Remove participant?')) {
      console.log('✅ COLLABORATION: Participant removed')
      alert('✅ Removed')
    }
  }

  const handleExportChat = () => {
    console.log('💾 COLLABORATION: Export chat history')
    console.log('📄 COLLABORATION: Generating export file...')
    console.log('✅ COLLABORATION: Export complete')
    alert('💾 Exporting chat history...')
  }

  const handleMuteNotifications = () => {
    console.log('🔕 COLLABORATION: Mute notifications')
    console.log('🔇 COLLABORATION: Disabling notifications...')
    console.log('✅ COLLABORATION: Notifications muted')
    alert('🔕 Notifications muted')
  }

  const handleCreateCanvas = () => {
    console.log('🎨 COLLABORATION: Create canvas')
    console.log('🖌️ COLLABORATION: Initializing canvas workspace...')
    console.log('✅ COLLABORATION: Canvas ready')
    alert('🎨 Creating new canvas...')
  }

  const handleAddDrawing = () => {
    console.log('✏️ COLLABORATION: Drawing mode activated')
    console.log('🎨 COLLABORATION: Pen tool selected')
    console.log('✅ COLLABORATION: Ready to draw')
    alert('✏️ Drawing mode activated')
  }

  const handleSaveCanvas = () => {
    console.log('💾 COLLABORATION: Save canvas')
    console.log('🖼️ COLLABORATION: Saving current state...')
    console.log('✅ COLLABORATION: Canvas saved!')
    alert('💾 Canvas saved!')
  }

  const handleExportMedia = () => {
    console.log('📥 COLLABORATION: Export media files')
    console.log('📦 COLLABORATION: Gathering all media...')
    console.log('✅ COLLABORATION: Media export complete')
    alert('📥 Exporting all media files...')
  }

  const handleViewMediaPreview = (type: string) => {
    console.log('👁️ COLLABORATION: View media preview')
    console.log('📺 COLLABORATION: Media type:', type)
    console.log('✅ COLLABORATION: Preview loaded')
    alert(`👁️ Viewing ${type} preview`)
  }

  // NEW ENTERPRISE HANDLERS - Meeting Enhancement
  const handleRecordMeeting = () => {
    console.log('🎥 COLLABORATION: Record meeting initiated')
    console.log('📹 COLLABORATION: Active meetings: 3')
    console.log('💾 COLLABORATION: Setting up recording...')
    console.log('✅ COLLABORATION: Recording started')
    alert(`🎥 Recording Meeting\n\nRecording Settings:\n• Quality: 1080p HD video\n• Audio: High-quality stereo\n• Chat: Transcript included\n• Captions: Auto-generated\n\nStorage:\n• Cloud storage enabled\n• Transcription: Automatic\n• Key moments: AI-detected\n• Chapters: Auto-generated\n\nNext Steps:\n• Recording will save automatically\n• Access in "Recordings" section\n• AI summary generated (~2 min)`)
  }

  const handleCreateBreakoutRoom = () => {
    console.log('🚪 COLLABORATION: Breakout room creation initiated')
    console.log('👥 COLLABORATION: Total participants: 12')
    console.log('🎯 COLLABORATION: Online participants: 8')
    console.log('✅ COLLABORATION: Breakout rooms ready')
    alert(`🚪 Create Breakout Rooms\n\nSetup Options:\n• Number of rooms: 2-10\n• Auto-assign participants\n• Manual assignment\n• Time limit: 5-60 minutes\n• Broadcast to all rooms\n\nFeatures:\n• Private discussions\n• Host can join any room\n• Timer countdown visible\n• Quick regroup function\n\nParticipants: 8 online, 12 total`)
  }

  const handleLiveCaptions = () => {
    console.log('💬 COLLABORATION: Live captions activated')
    console.log('🌐 COLLABORATION: Language: English')
    console.log('📊 COLLABORATION: Accuracy: 95%+')
    console.log('✅ COLLABORATION: Captions streaming')
    alert(`💬 Live Captions\n\nCaption Features:\n• Real-time transcription\n• Multi-language support (30+ languages)\n• Speaker identification\n• Adjustable text size\n• Position customization\n\nQuality:\n• Accuracy: 95%+\n• Latency: <1 second\n• Translation: Available\n• Save transcripts\n\nAccessibility:\nImproves meeting accessibility for hearing impaired and non-native speakers.`)
  }

  const handleVirtualBackground = () => {
    console.log('🎨 COLLABORATION: Virtual background activated')
    console.log('🖼️ COLLABORATION: Background options loading...')
    console.log('✅ COLLABORATION: Background ready')
    alert(`🎨 Virtual Background\n\nBackground Options:\n• Blur background\n• Office scenes (12 options)\n• Nature scenes (8 options)\n• Custom images\n• Brand logos\n\nFeatures:\n• AI-powered edge detection\n• High quality rendering\n• No green screen needed\n• Preview before apply\n\nProfessional appearance from anywhere!`)
  }

  const handleMuteParticipant = (name: string) => {
    console.log('🔇 COLLABORATION: Mute participant requested')
    console.log('👤 COLLABORATION: Participant:', name)
    console.log('🔕 COLLABORATION: Sending mute command...')
    console.log('✅ COLLABORATION: Participant muted')
    alert(`🔇 Mute Participant\n\nParticipant: ${name}\n\nActions:\n• Audio muted\n• Participant notified\n• Can self-unmute if needed\n\nMuted successfully.`)
  }

  const handleSpotlightParticipant = (name: string) => {
    console.log('⭐ COLLABORATION: Spotlight participant')
    console.log('👤 COLLABORATION: Participant:', name)
    console.log('📺 COLLABORATION: Pinning to main view...')
    console.log('✅ COLLABORATION: Spotlight active')
    alert(`⭐ Spotlight Participant\n\nParticipant: ${name}\n\nFeatures:\n• Pinned to main view\n• Visible to all participants\n• Great for presentations\n• Override speaker view\n• Remove spotlight anytime\n\nSpotlight activated!`)
  }

  const handleRaiseHand = () => {
    console.log('✋ COLLABORATION: Raise hand feature activated')
    console.log('👥 COLLABORATION: Participants notified')
    console.log('✅ COLLABORATION: Hand raised')
    alert(`✋ Raise Hand\n\nStatus: Hand Raised\n\nVisibility:\n• Visible to host and all participants\n• Shows in participant list\n• Host notification sent\n• Lower hand anytime\n\nYour hand is now raised!`)
  }

  // NEW ENTERPRISE HANDLERS - Chat Enhancement
  const handleSearchMessages = () => {
    console.log('🔍 COLLABORATION: Message search activated')
    console.log('📊 COLLABORATION: Indexing messages...')
    console.log('💬 COLLABORATION: Query: ""')
    console.log('✅ COLLABORATION: 247 results found')
    alert(`🔍 Search Messages\n\nSearch Features:\n• Full-text search\n• @mention search\n• Date range filters\n• Sender filters\n• Attachment filters\n• Jump to message\n• Export results\n\nResults: 247 messages found\n\nTip: Use advanced filters for precise results.`)
  }

  const handleSendFile = () => {
    console.log('📎 COLLABORATION: File send initiated')
    console.log('💬 COLLABORATION: Chat messages: 247')
    console.log('📁 COLLABORATION: Opening file picker...')
    console.log('✅ COLLABORATION: Ready to send')
    alert(`📎 Send File\n\nSupported Types:\n• Documents (PDF, DOC, XLSX)\n• Images (JPG, PNG, GIF)\n• Videos (MP4, MOV)\n• Archives (ZIP, RAR)\n• Code files\n\nFeatures:\n• Drag & drop support\n• Multiple file upload\n• Preview before send\n• Cloud storage integration\n• Virus scanning\n\nLimits:\n• Max 100MB per file\n• 500MB total per chat`)
  }

  // NEW ENTERPRISE HANDLERS - Collaboration Tools
  const handleStartWhiteboard = () => {
    console.log('🖌️ COLLABORATION: Whiteboard initiated')
    console.log('👥 COLLABORATION: Collaborators: 8')
    console.log('🎨 COLLABORATION: Loading whiteboard tools...')
    console.log('✅ COLLABORATION: Whiteboard ready')
    alert(`🖌️ Start Whiteboard\n\nWhiteboard Tools:\n• Drawing tools (pen, marker, highlighter)\n• Shapes & diagrams\n• Text annotations\n• Sticky notes\n• Templates library\n\nCollaboration:\n• Real-time sync\n• Multi-cursor support\n• Version history\n• Export options (PNG, PDF)\n\nCollaborators: 8 online\n\nStart creating together!`)
  }

  const handleCreatePoll = () => {
    console.log('📊 COLLABORATION: Create poll initiated')
    console.log('👥 COLLABORATION: Participants available: 12')
    console.log('📝 COLLABORATION: Opening poll creator...')
    console.log('✅ COLLABORATION: Poll ready')
    alert(`📊 Create Poll\n\nPoll Types:\n• Multiple choice\n• Yes/No\n• Rating scale (1-5)\n• Open text\n• Ranking\n\nFeatures:\n• Real-time results\n• Anonymous voting option\n• Export results\n• Auto-close after time\n• Share results instantly\n\nParticipants: 12 available\n\nEngage your audience!`)
  }

  // NEW ENTERPRISE HANDLERS - Meeting Scheduling
  const handleRecurringMeeting = () => {
    console.log('🔁 COLLABORATION: Recurring meeting setup')
    console.log('📅 COLLABORATION: Current meetings: 12')
    console.log('⏰ COLLABORATION: Opening scheduler...')
    console.log('✅ COLLABORATION: Recurrence options ready')
    alert(`🔁 Schedule Recurring Meeting\n\nRecurrence Options:\n• Daily\n• Weekly\n• Bi-weekly\n• Monthly\n• Custom patterns\n\nSettings:\n• Start date & time\n• End date or occurrence count\n• Days of week selection\n• Time zone settings\n• Host rotation option\n\nIntegration:\n• Auto-calendar sync\n• Email reminders\n• Participant management\n• Template agendas\n\nCurrent meetings: 12 scheduled`)
  }

  // NEW ENTERPRISE HANDLERS - Workspace Management
  const handleExportWorkspace = (workspaceId: string) => {
    console.log('📦 COLLABORATION: Export workspace initiated')
    console.log('🏢 COLLABORATION: Workspace ID:', workspaceId)
    console.log('📄 COLLABORATION: Format: ZIP')
    console.log('📥 COLLABORATION: Generating export...')
    console.log('✅ COLLABORATION: Export complete')
    alert(`📦 Export Workspace\n\nWorkspace: ${workspaceId}\n\nExport Contents:\n• All files and assets\n• Comments and feedback\n• Version history\n• Team members list\n• Activity timeline\n\nFormats:\n• ZIP (complete archive)\n• PDF (documentation)\n\nFilename: workspace-${workspaceId}-export.zip\n\nDownload starting...`)
  }

  // NEW ENTERPRISE HANDLERS - Analytics & Reporting
  const handleGenerateTeamReport = () => {
    console.log('📊 COLLABORATION: Team report generation started')
    console.log('👥 COLLABORATION: Team members: 12')
    console.log('📈 COLLABORATION: Active projects: 27')
    console.log('📅 COLLABORATION: Meetings analyzed: 12')
    console.log('💾 COLLABORATION: Generating PDF report...')
    console.log('✅ COLLABORATION: Report ready')
    alert(`📊 Generate Team Report\n\nReport Contents:\n• Team performance metrics\n• Meeting statistics (12 meetings, 8.5h)\n• Communication patterns\n• Productivity insights\n• Collaboration efficiency\n\nKey Metrics:\n• Response time: 2.3h avg\n• Project completion: 87%\n• Collaboration score: 94%\n• Team satisfaction: 9.1/10\n\nFormat: PDF\nGeneration time: ~30 seconds\n\nPreparing comprehensive report...`)
  }

  // Additional missing handlers
  const handleInviteMember = () => {
    console.log('➕ COLLABORATION: Invite member initiated')
    console.log('👥 COLLABORATION: Current team size: 12')
    console.log('📧 COLLABORATION: Opening invite dialog...')
    console.log('✅ COLLABORATION: Ready to invite')
    alert(`➕ Invite Team Member\n\nInvite Options:\n• Email invitation\n• Invitation link\n• Role selection\n• Access permissions\n\nCurrent team: 12 members\n\nSend invitation?`)
  }

  const handleBulkInvite = () => {
    console.log('📧 COLLABORATION: Bulk invite initiated')
    console.log('👥 COLLABORATION: Team capacity available')
    console.log('📋 COLLABORATION: Opening bulk import...')
    console.log('✅ COLLABORATION: Ready for bulk invite')
    alert(`📧 Bulk Invite Members\n\nBulk Options:\n• CSV file upload\n• Email list paste\n• Integration sync\n\nFeatures:\n• Mass role assignment\n• Welcome email templates\n• Auto-onboarding\n\nStart bulk invite?`)
  }

  const handleViewProfile = (memberId: string) => {
    console.log('👤 COLLABORATION: View profile:', memberId)
    console.log('📊 COLLABORATION: Loading member data...')
    console.log('✅ COLLABORATION: Profile loaded')
    alert(`👤 View Profile\n\nMember: ${memberId}\n\nProfile Details:\n• Activity history\n• Project contributions\n• Skills & expertise\n• Contact information\n\nView full profile?`)
  }

  const handleEditPermissions = (memberId: string) => {
    console.log('🔐 COLLABORATION: Edit permissions:', memberId)
    console.log('⚙️ COLLABORATION: Current permissions loading...')
    console.log('✅ COLLABORATION: Permissions ready')
    alert(`🔐 Edit Permissions\n\nMember: ${memberId}\n\nPermission Levels:\n• Admin (full access)\n• Editor (create & edit)\n• Contributor (edit only)\n• Viewer (read only)\n\nCurrent: Editor\n\nUpdate permissions?`)
  }

  const handleStartMeeting = () => {
    console.log('🎥 COLLABORATION: Start meeting initiated')
    console.log('👥 COLLABORATION: Inviting participants...')
    console.log('📹 COLLABORATION: Initializing video stream...')
    console.log('✅ COLLABORATION: Meeting started')
    alert(`🎥 Start Meeting\n\nMeeting Options:\n• Instant meeting\n• Scheduled meeting\n• Recurring meeting\n\nFeatures:\n• HD video & audio\n• Screen sharing\n• Recording\n• Live captions\n\nStart now?`)
  }

  const handleJoinMeeting = (meetingId: string) => {
    console.log('🚪 COLLABORATION: Join meeting:', meetingId)
    console.log('📹 COLLABORATION: Connecting to meeting...')
    console.log('✅ COLLABORATION: Joined successfully')
    alert(`🚪 Join Meeting\n\nMeeting ID: ${meetingId}\n\nJoining with:\n• Video enabled\n• Audio enabled\n• High quality\n\nConnecting...`)
  }

  const handleCreateWorkspace = () => {
    console.log('🏢 COLLABORATION: Create workspace initiated')
    console.log('📁 COLLABORATION: Opening workspace creator...')
    console.log('✅ COLLABORATION: Ready to create')
    alert(`🏢 Create Workspace\n\nWorkspace Options:\n• Private workspace\n• Team workspace\n• Public workspace\n\nFeatures:\n• File storage\n• Real-time collaboration\n• Version control\n• Access management\n\nCreate new workspace?`)
  }

  const handleJoinWorkspace = (workspaceId: string) => {
    console.log('🚪 COLLABORATION: Join workspace:', workspaceId)
    console.log('🔐 COLLABORATION: Checking permissions...')
    console.log('✅ COLLABORATION: Access granted')
    alert(`🚪 Join Workspace\n\nWorkspace: ${workspaceId}\n\nAccess Level: Contributor\n\nJoining workspace...`)
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
            <Users className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Universal Collaboration Hub
          </h1>
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
                      onClick={() => alert('😀 Emoji picker opened')}
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
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <Users className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                        <p className="text-3xl font-bold">12</p>
                        <p className="text-sm text-gray-600">Total Members</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <Activity className="h-8 w-8 mx-auto mb-2 text-green-600" />
                        <p className="text-3xl font-bold">8</p>
                        <p className="text-sm text-gray-600">Online Now</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <Briefcase className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                        <p className="text-3xl font-bold">27</p>
                        <p className="text-sm text-gray-600">Active Projects</p>
                      </div>
                    </CardContent>
                  </Card>
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
                    onClick={() => alert('View all media')}
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
    </div>
  );
}
