'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  UserCheck, 
  FolderOpen, 
  MessageSquare, 
  FileText, 
  Download,
  Star,
  Clock,
  CheckCircle,
  AlertCircle,
  Send,
  Eye,
  ThumbsUp,
  DollarSign,
  Bell,
  Upload,
  Image,
  Calendar,
  Receipt,
  Shield,
  Brain,
  BarChart3,
  Settings,
  CreditCard,
  Palette,
  Target,
  Zap,
  Edit
} from 'lucide-react'
import ClientZoneGallery from '@/components/client-zone-gallery'

export default function ClientZonePage() {
  const [activeTab, setActiveTab] = useState('projects')
  const [newMessage, setNewMessage] = useState('')
  const [newFeedback, setNewFeedback] = useState('')

  // SESSION_12 Handlers - Enhanced with next steps guidance

  // Handler 1: Notifications
  const handleNotifications = () => {
    toast.success('Opening notifications...')
    setTimeout(() => {
      alert(`🔔 Notifications Center\n\nNext Steps:\n• Review project updates and milestones\n• Check messages from your team\n• See delivery notifications\n• Manage notification preferences\n• Mark important updates\n• Stay informed on project progress`)
    }, 500)
  }

  // Handler 2: Contact Team
  const handleContactTeam = () => {
    toast.success('Opening team communication...')
    setTimeout(() => {
      alert(`💬 Contact Your Team\n\nNext Steps:\n• Send a message to your project team\n• Schedule a video call or meeting\n• Share feedback or requirements\n• Ask questions about your project\n• Request updates or clarifications\n• Build strong collaboration`)
    }, 500)
  }

  // Handler 3: Request Revision (with API call)
  const handleRequestRevision = async (id: number) => {
    console.log('🔄 REQUEST REVISION - ID:', id)

    const feedback = prompt('Please describe the changes needed:')
    if (!feedback) return

    try {
      const response = await fetch('/api/projects/manage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update',
          projectId: id.toString(),
          data: {
            status: 'revision-requested',
            revisionNotes: feedback
          }
        })
      })

      if (!response.ok) {
        throw new Error('Failed to request revision')
      }

      const result = await response.json()

      if (result.success) {
        toast.success('Revision request submitted!')
        setTimeout(() => {
          alert(`🔄 Revision Requested\n\nNext Steps:\n• Your team will review the request within 24 hours\n• Provide detailed feedback on what to change\n• Attach reference materials if needed\n• Track revision status in the dashboard\n• Receive notification when revisions are complete\n• Approve final deliverables`)
        }, 500)
      }
    } catch (error: any) {
      console.error('Request Revision Error:', error)
      toast.error('Failed to request revision', {
        description: error.message || 'Please try again later'
      })
    }
  }

  // Handler 4: Approve Deliverable (with API call)
  const handleApproveDeliverable = async (id: number) => {
    console.log('✅ APPROVE DELIVERABLE - ID:', id)

    try {
      const response = await fetch('/api/projects/manage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update-status',
          projectId: id.toString(),
          data: { status: 'approved' }
        })
      })

      if (!response.ok) {
        throw new Error('Failed to approve deliverable')
      }

      const result = await response.json()

      if (result.success) {
        toast.success('Deliverable approved!')
        setTimeout(() => {
          alert(`✅ Approval Confirmed\n\nNext Steps:\n• Team notified of your approval\n• Milestone payment will be processed\n• Download final files for your records\n• Next phase of project will begin\n• Provide testimonial or feedback\n• Stay updated on remaining deliverables`)
        }, 500)
      }
    } catch (error: any) {
      console.error('Approve Deliverable Error:', error)
      toast.error('Failed to approve deliverable', {
        description: error.message || 'Please try again later'
      })
    }
  }

  // Handler 5: Download Files
  const handleDownloadFiles = (id: number) => {
    toast.success('Preparing download...')
    setTimeout(() => {
      alert(`📥 Download Files\n\nNext Steps:\n• Files will download as a ZIP archive\n• Extract and review all deliverables\n• Save files to your preferred location\n• Share with stakeholders if needed\n• Archive for future reference\n• Provide feedback on the delivery`)
    }, 500)
    console.log('📥 DOWNLOAD:', id)
  }

  // Handler 6: Send Message (with validation)
  const handleSendMessage = () => {
    if (!newMessage.trim()) {
      toast.error('Please enter a message')
      return
    }

    toast.success('Message sent successfully!')
    setTimeout(() => {
      alert(`📧 Message Sent\n\nNext Steps:\n• Your team will respond within 4-6 hours\n• Check back for responses in Messages tab\n• Upload attachments if you forgot any\n• Set up meeting if discussion needed\n• Track conversation history\n• Get real-time project updates`)
    }, 500)
    setNewMessage('')
    console.log('📧 SEND MESSAGE')
  }

  // Handler 7: Submit Feedback (with API call and validation)
  const handleSubmitFeedback = async () => {
    if (!newFeedback.trim()) {
      toast.error('Please enter your feedback')
      return
    }

    try {
      const response = await fetch('/api/collaboration/client-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          feedback: newFeedback,
          rating: 5,
          timestamp: new Date().toISOString()
        })
      })

      if (!response.ok) {
        throw new Error('Failed to submit feedback')
      }

      toast.success('Feedback submitted!')
      setTimeout(() => {
        alert(`⭐ Thank You!\n\nNext Steps:\n• Your input helps us improve\n• Team will review and respond promptly\n• Feedback influences project direction\n• Share more thoughts anytime\n• Rate your experience periodically\n• Help us serve you better`)
      }, 500)
      setNewFeedback('')
    } catch (error: any) {
      console.error('Submit Feedback Error:', error)
      toast.error('Failed to submit feedback', {
        description: error.message || 'Please try again later'
      })
    }
  }

  // Handler 8: Pay Invoice
  const handlePayInvoice = (invoiceNumber: string, amount: number) => {
    toast.success('Redirecting to secure payment...')
    setTimeout(() => {
      alert(`💳 Payment for Invoice ${invoiceNumber}\n\nNext Steps:\n• You'll be redirected to secure payment gateway\n• Choose payment method (Card/Bank/Crypto)\n• Complete transaction securely\n• Receive instant payment confirmation\n• Download receipt for your records\n• Project continues upon payment`)
    }, 500)
    console.log('💳 PAYMENT:', invoiceNumber, amount)
  }

  // Handler 9: Schedule Meeting
  const handleScheduleMeeting = () => {
    toast.success('Opening calendar...')
    setTimeout(() => {
      alert(`📅 Schedule New Meeting\n\nNext Steps:\n• Choose available time slots\n• Add meeting agenda and topics\n• Invite team members to join\n• Set up video conference link\n• Receive meeting reminders\n• Prepare questions or materials`)
    }, 500)
    console.log('📅 SCHEDULE')
  }

  // Handler 10: View Invoice Details
  const handleViewInvoiceDetails = (invoiceNumber: string) => {
    toast.success('Loading invoice details...')
    setTimeout(() => {
      alert(`🧾 Invoice ${invoiceNumber}\n\nNext Steps:\n• Review itemized charges\n• Check payment terms and due date\n• Download PDF for your records\n• Submit for accounting/approval\n• Make payment before due date\n• Save receipt after payment`)
    }, 500)
    console.log('🧾 INVOICE:', invoiceNumber)
  }

  // Keep existing utility handlers
  const handleViewProject = (id: number) => { console.log('👁️ VIEW PROJECT:', id); alert('👁️ Viewing project details') }
  const handleDownloadFile = (id: number) => { console.log('📥 DOWNLOAD:', id); alert('📥 Downloading file...') }
  const handleUploadFile = () => { console.log('📤 UPLOAD'); const input = document.createElement('input'); input.type = 'file'; input.click(); alert('📤 File upload started') }
  const handleMakePayment = (id: number) => { console.log('💳 PAYMENT:', id); alert('💳 Processing payment...') }
  const handleViewInvoice = (id: number) => { console.log('🧾 INVOICE:', id); alert('🧾 Viewing invoice') }
  const handleDownloadInvoice = (id: number) => { console.log('📥 DOWNLOAD INVOICE:', id); alert('📥 Downloading invoice...') }
  const handleRequestQuote = () => { console.log('📋 QUOTE'); alert('📋 Request new project quote') }
  const handleViewGallery = (id: number) => { console.log('🖼️ GALLERY:', id); alert('🖼️ Opening project gallery') }
  const handleRateTeamMember = (id: string) => { console.log('⭐ RATE:', id); alert('⭐ Rate team member performance') }
  const handleContactSupport = () => { console.log('💬 SUPPORT'); alert('💬 Contacting support team...') }
  const handleUpdateProfile = () => { console.log('✏️ UPDATE PROFILE'); alert('✏️ Update client profile') }
  const handleManageNotifications = () => { console.log('🔔 NOTIFICATIONS'); alert('🔔 Manage notification preferences') }
  const handleExportProjectReport = (id: number) => { console.log('📊 EXPORT REPORT:', id); alert('📊 Exporting project report...') }
  const handleShareProject = (id: number) => { console.log('🔗 SHARE:', id); alert('🔗 Share project link') }
  const handleArchiveProject = (id: number) => { console.log('📦 ARCHIVE:', id); confirm('Archive project?') && alert('📦 Project archived') }

  // Mock client data (from client's perspective)
  const clientInfo = {
    name: 'Acme Corporation',
    contactPerson: 'John Smith',
    email: 'john@acme.com',
    avatar: '/avatars/acme-corp.jpg',
    memberSince: '2023-01-15',
    totalProjects: 12,
    activeProjects: 3,
    completedProjects: 9,
    totalInvestment: 45000,
    satisfaction: 4.9,
    tier: 'Premium'
  }

  const myProjects = [
    {
      id: 1,
      name: 'Brand Identity Redesign',
      description: 'Complete brand overhaul including logo, color palette, and brand guidelines',
      status: 'in-progress',
      progress: 75,
      dueDate: '2024-02-15',
      budget: 8500,
      spent: 6375,
      team: ['Sarah Johnson', 'Michael Chen'],
      phase: 'Design Review',
      deliverables: [
        { name: 'Logo Concepts', status: 'completed', dueDate: '2024-01-20' },
        { name: 'Color Palette', status: 'completed', dueDate: '2024-01-25' },
        { name: 'Brand Guidelines', status: 'in-progress', dueDate: '2024-02-05' },
        { name: 'Business Cards', status: 'pending', dueDate: '2024-02-10' }
      ]
    },
    {
      id: 2,
      name: 'Website Development',
      description: 'Modern responsive website with CMS integration',
      status: 'review',
      progress: 90,
      dueDate: '2024-01-30',
      budget: 12000,
      spent: 10800,
      team: ['Alex Thompson', 'Lisa Wang'],
      phase: 'Final Review',
      deliverables: [
        { name: 'Homepage Design', status: 'completed', dueDate: '2023-12-15' },
        { name: 'Inner Pages', status: 'completed', dueDate: '2023-12-30' },
        { name: 'CMS Integration', status: 'completed', dueDate: '2024-01-15' },
        { name: 'Testing & Launch', status: 'review', dueDate: '2024-01-30' }
      ]
    }
  ]

  const messages = [
    {
      id: 1,
      sender: 'Sarah Johnson',
      role: 'Designer',
      message: 'Hi John! I\'ve uploaded the latest logo concepts for your review. Please let me know your thoughts on the color variations.',
      timestamp: '2 hours ago',
      avatar: '/avatars/sarah.jpg'
    },
    {
      id: 2,
      sender: 'Michael Chen',
      role: 'Developer',
      message: 'The website staging environment is ready for your review. You can access it using the credentials I sent earlier.',
      timestamp: '45 minutes ago',
      avatar: '/avatars/michael.jpg'
    }
  ]

  const recentFiles = [
    {
      id: 1,
      name: 'Brand Guidelines Draft v3.pdf',
      size: '2.4 MB',
      uploadedBy: 'Sarah Johnson',
      uploadDate: '2024-01-25',
      project: 'Brand Identity Redesign'
    },
    {
      id: 2,
      name: 'Logo Concepts Final.zip',
      size: '15.7 MB',
      uploadedBy: 'Sarah Johnson',
      uploadDate: '2024-01-20',
      project: 'Brand Identity Redesign'
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'in-progress': return 'bg-blue-100 text-blue-800'
      case 'review': return 'bg-yellow-100 text-yellow-800'
      case 'pending': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'in-progress': return <Clock className="h-4 w-4 text-blue-600" />
      case 'review': return <Eye className="h-4 w-4 text-yellow-600" />
      case 'pending': return <AlertCircle className="h-4 w-4 text-gray-600" />
      default: return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 text-white">
              <UserCheck className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                My Projects
              </h1>
              <p className="text-gray-600 mt-2 text-lg">
                Welcome back, {clientInfo.contactPerson}! Here's your project overview.
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="outline" onClick={handleNotifications}>
              <Bell className="h-4 w-4 mr-2" />
              Notifications
            </Button>
            <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white" onClick={handleContactTeam}>
              <MessageSquare className="h-4 w-4 mr-2" />
              Contact Team
            </Button>
          </div>
        </div>

        {/* Client Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
            <CardContent className="p-6 text-center">
              <div className="p-3 bg-blue-100 rounded-xl inline-block mb-4">
                <FolderOpen className="h-8 w-8 text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-blue-600">{clientInfo.activeProjects}</p>
              <p className="text-gray-600">Active Projects</p>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
            <CardContent className="p-6 text-center">
              <div className="p-3 bg-green-100 rounded-xl inline-block mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-green-600">{clientInfo.completedProjects}</p>
              <p className="text-gray-600">Completed</p>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
            <CardContent className="p-6 text-center">
              <div className="p-3 bg-purple-100 rounded-xl inline-block mb-4">
                <DollarSign className="h-8 w-8 text-purple-600" />
              </div>
              <p className="text-2xl font-bold text-purple-600">${clientInfo.totalInvestment.toLocaleString()}</p>
              <p className="text-gray-600">Total Investment</p>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
            <CardContent className="p-6 text-center">
              <div className="p-3 bg-yellow-100 rounded-xl inline-block mb-4">
                <Star className="h-8 w-8 text-yellow-600" />
              </div>
              <p className="text-2xl font-bold text-yellow-600">{clientInfo.satisfaction}</p>
              <p className="text-gray-600">Satisfaction Rating</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="overflow-x-auto">
            <TabsList className="inline-flex w-max min-w-full bg-white/60 backdrop-blur-xl border border-white/30">
              <TabsTrigger value="projects" className="flex items-center gap-2 whitespace-nowrap">
                <FolderOpen className="h-4 w-4" />
                My Projects
              </TabsTrigger>
              <TabsTrigger value="gallery" className="flex items-center gap-2 whitespace-nowrap">
                <Image className="h-4 w-4" />
                Gallery
              </TabsTrigger>
              <TabsTrigger value="calendar" className="flex items-center gap-2 whitespace-nowrap">
                <Calendar className="h-4 w-4" />
                Schedule
              </TabsTrigger>
              <TabsTrigger value="invoices" className="flex items-center gap-2 whitespace-nowrap">
                <Receipt className="h-4 w-4" />
                Invoices
              </TabsTrigger>
              <TabsTrigger value="payments" className="flex items-center gap-2 whitespace-nowrap">
                <Shield className="h-4 w-4" />
                Payments
              </TabsTrigger>
              <TabsTrigger value="messages" className="flex items-center gap-2 whitespace-nowrap">
                <MessageSquare className="h-4 w-4" />
                Messages
              </TabsTrigger>
              <TabsTrigger value="files" className="flex items-center gap-2 whitespace-nowrap">
                <FileText className="h-4 w-4" />
                Files
              </TabsTrigger>
              <TabsTrigger value="ai-collaborate" className="flex items-center gap-2 whitespace-nowrap">
                <Brain className="h-4 w-4" />
                AI Collaborate
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-2 whitespace-nowrap">
                <BarChart3 className="h-4 w-4" />
                Analytics
              </TabsTrigger>
              <TabsTrigger value="feedback" className="flex items-center gap-2 whitespace-nowrap">
                <Star className="h-4 w-4" />
                Feedback
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2 whitespace-nowrap">
                <Settings className="h-4 w-4" />
                Settings
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Projects Tab */}
          <TabsContent value="projects" className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              {myProjects.map((project) => (
                <Card key={project.id} className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <CardTitle className="text-xl">{project.name}</CardTitle>
                          <Badge className={getStatusColor(project.status)}>
                            {getStatusIcon(project.status)}
                            <span className="ml-1">{project.status}</span>
                          </Badge>
                        </div>
                        <p className="text-gray-600 mb-4">{project.description}</p>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600">Current Phase</p>
                            <p className="font-semibold">{project.phase}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Due Date</p>
                            <p className="font-semibold">{new Date(project.dueDate).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Team</p>
                            <p className="font-semibold">{project.team.join(', ')}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Progress</span>
                        <span className="font-medium">{project.progress}%</span>
                      </div>
                      <Progress value={project.progress} className="h-3" />
                    </div>

                    <div>
                      <h4 className="font-semibold mb-3">Deliverables</h4>
                      <div className="space-y-2">
                        {project.deliverables.map((deliverable, index) => (
                          <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                            <div className="flex items-center gap-3">
                              {getStatusIcon(deliverable.status)}
                              <div>
                                <p className="font-medium">{deliverable.name}</p>
                                <p className="text-sm text-gray-600">Due: {new Date(deliverable.dueDate).toLocaleDateString()}</p>
                              </div>
                            </div>
                            <Badge className={getStatusColor(deliverable.status)} variant="outline">
                              {deliverable.status}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="flex items-center space-x-2">
                        <Button size="sm" variant="outline" onClick={() => handleDownloadFiles(project.id)}>
                          <Download className="h-3 w-3 mr-1" />
                          Download Files
                        </Button>
                      </div>
                      <Button size="sm" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white" onClick={handleContactTeam}>
                        <MessageSquare className="h-3 w-3 mr-1" />
                        Discuss Project
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Gallery Tab */}
          <TabsContent value="gallery" className="space-y-6">
            <ClientZoneGallery />
          </TabsContent>

          {/* Calendar/Schedule Tab */}
          <TabsContent value="calendar" className="space-y-6">
            <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Schedule & Meetings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Upcoming Meetings</h3>
                    <div className="space-y-3">
                      <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Project Review Meeting</p>
                            <p className="text-sm text-gray-600">Tomorrow at 2:00 PM</p>
                            <p className="text-sm text-blue-600">with Sarah Johnson, Michael Chen</p>
                          </div>
                          <Badge className="bg-blue-100 text-blue-800">Video Call</Badge>
                        </div>
                      </div>
                      <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Final Presentation</p>
                            <p className="text-sm text-gray-600">Friday at 10:00 AM</p>
                            <p className="text-sm text-green-600">Brand Identity Project</p>
                          </div>
                          <Badge className="bg-green-100 text-green-800">In-Person</Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Quick Actions</h3>
                    <div className="space-y-2">
                      <Button className="w-full justify-start bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white" onClick={handleScheduleMeeting}>
                        <Calendar className="h-4 w-4 mr-2" />
                        Schedule New Meeting
                      </Button>
                      <Button variant="outline" className="w-full justify-start" onClick={() => {
                        toast.info('Loading project timeline...')
                        setTimeout(() => {
                          alert(`📊 Project Timeline\n\nNext Steps:\n• View all project milestones\n• Track progress over time\n• Identify bottlenecks\n• Adjust deadlines if needed\n• Share timeline with stakeholders\n• Export timeline report`)
                        }, 500)
                      }}>
                        <Clock className="h-4 w-4 mr-2" />
                        View Project Timeline
                      </Button>
                      <Button variant="outline" className="w-full justify-start" onClick={() => {
                        toast.info('Setting up reminders...')
                        setTimeout(() => {
                          alert(`⏰ Set Reminders\n\nNext Steps:\n• Choose reminder times\n• Select notification method\n• Add custom reminder messages\n• Set recurring reminders\n• Manage existing reminders\n• Enable mobile notifications`)
                        }, 500)
                      }}>
                        <Bell className="h-4 w-4 mr-2" />
                        Set Reminders
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Invoices Tab */}
          <TabsContent value="invoices" className="space-y-6">
            <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Receipt className="h-5 w-5" />
                  Invoices & Billing
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="bg-green-50 border-green-200">
                    <CardContent className="p-4 text-center">
                      <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-green-600">$15,500</p>
                      <p className="text-sm text-gray-600">Paid Invoices</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-yellow-50 border-yellow-200">
                    <CardContent className="p-4 text-center">
                      <Clock className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-yellow-600">$3,500</p>
                      <p className="text-sm text-gray-600">Pending Payment</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="p-4 text-center">
                      <Receipt className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-blue-600">8</p>
                      <p className="text-sm text-gray-600">Total Invoices</p>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Recent Invoices</h3>
                  <div className="space-y-3">
                    <div className="p-4 rounded-lg border border-gray-200 flex items-center justify-between">
                      <div>
                        <p className="font-medium">INV-001 - Brand Identity Package</p>
                        <p className="text-sm text-gray-600">Due: January 30, 2024</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-yellow-600">$3,500</p>
                        <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
                      </div>
                      <Button size="sm" className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white" onClick={() => handlePayInvoice('INV-001', 3500)}>
                        <CreditCard className="h-3 w-3 mr-1" />
                        Pay Now
                      </Button>
                    </div>
                    <div className="p-4 rounded-lg border border-gray-200 flex items-center justify-between">
                      <div>
                        <p className="font-medium">INV-002 - Website Development</p>
                        <p className="text-sm text-gray-600">Paid: January 15, 2024</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-green-600">$12,000</p>
                        <Badge className="bg-green-100 text-green-800">Paid</Badge>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => handleViewInvoiceDetails('INV-002')}>
                        <Download className="h-3 w-3 mr-1" />
                        Download
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payments/Escrow Tab */}
          <TabsContent value="payments" className="space-y-6">
            <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Secure Payments & Escrow
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Milestone Payments</h3>
                    <div className="space-y-3">
                      <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-medium">Design Concepts</p>
                          <Badge className="bg-green-100 text-green-800">Released</Badge>
                        </div>
                        <p className="text-sm text-gray-600">Brand Identity Project</p>
                        <p className="text-lg font-semibold text-green-600">$2,000</p>
                      </div>
                      <div className="p-4 rounded-lg bg-yellow-50 border border-yellow-200">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-medium">Final Deliverables</p>
                          <Badge className="bg-yellow-100 text-yellow-800">In Escrow</Badge>
                        </div>
                        <p className="text-sm text-gray-600">Brand Identity Project</p>
                        <p className="text-lg font-semibold text-yellow-600">$1,500</p>
                        <Button size="sm" className="mt-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white" onClick={() => handleApproveDeliverable(1)}>
                          Approve & Release
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Payment Security</h3>
                    <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                      <Shield className="h-8 w-8 text-blue-600 mb-3" />
                      <p className="font-medium mb-2">Your payments are secure</p>
                      <p className="text-sm text-gray-600 mb-4">All payments are held in escrow until you approve the deliverables.</p>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• 100% money-back guarantee</li>
                        <li>• Milestone-based releases</li>
                        <li>• Dispute resolution support</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Messages Tab */}
          <TabsContent value="messages" className="space-y-6">
            <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
              <CardHeader>
                <CardTitle>Recent Messages</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="max-h-96 overflow-y-auto space-y-4">
                  {messages.map((message) => (
                    <div key={message.id} className="flex space-x-4 p-4 rounded-lg bg-gray-50">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={message.avatar} alt={message.sender} />
                        <AvatarFallback>{message.sender.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold">{message.sender}</p>
                          <Badge variant="secondary" className="text-xs">{message.role}</Badge>
                          <span className="text-sm text-gray-500">{message.timestamp}</span>
                        </div>
                        <p className="text-gray-700">{message.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="border-t pt-4">
                  <div className="flex space-x-4">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={clientInfo.avatar} alt={clientInfo.contactPerson} />
                      <AvatarFallback>{clientInfo.contactPerson.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-2">
                      <Textarea
                        placeholder="Type your message here..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        className="min-h-[80px]"
                      />
                      <div className="flex items-center justify-between">
                        <Button variant="outline" size="sm" onClick={handleUploadFile}>
                          <Upload className="h-3 w-3 mr-1" />
                          Attach File
                        </Button>
                        <Button size="sm" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white" onClick={handleSendMessage}>
                          <Send className="h-3 w-3 mr-1" />
                          Send Message
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Files Tab */}
          <TabsContent value="files" className="space-y-6">
            <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
              <CardHeader>
                <CardTitle>Project Files</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentFiles.map((file) => (
                    <div key={file.id} className="flex items-center justify-between p-4 rounded-lg bg-gray-50">
                      <div className="flex items-center space-x-4">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <FileText className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium">{file.name}</p>
                          <p className="text-sm text-gray-600">
                            {file.size} • Uploaded by {file.uploadedBy} on {new Date(file.uploadDate).toLocaleDateString()}
                          </p>
                          <Badge variant="outline" className="text-xs mt-1">
                            {file.project}
                          </Badge>
                        </div>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => handleDownloadFiles(file.id)}>
                        <Download className="h-3 w-3 mr-1" />
                        Download
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* AI Collaborate Tab */}
          <TabsContent value="ai-collaborate" className="space-y-6">
            <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  AI Design Collaboration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">AI-Generated Options</h3>
                    <div className="space-y-3">
                      <div className="p-4 rounded-lg bg-purple-50 border border-purple-200">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-medium">Logo Variations</p>
                          <Badge className="bg-purple-100 text-purple-800">Ready for Review</Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">3 AI-generated logo concepts based on your preferences</p>
                        <Button size="sm" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white">
                          <Eye className="h-3 w-3 mr-1" />
                          Review & Approve
                        </Button>
                      </div>
                      <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-medium">Color Palette Options</p>
                          <Badge className="bg-blue-100 text-blue-800">In Progress</Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">AI analyzing your brand preferences to suggest color schemes</p>
                        <Button size="sm" variant="outline">
                          <Palette className="h-3 w-3 mr-1" />
                          View Progress
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Your Preferences</h3>
                    <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
                      <p className="font-medium mb-3">Style Preferences</p>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Modern & Minimalist</span>
                          <Badge variant="outline">Selected</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Professional</span>
                          <Badge variant="outline">Selected</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Tech-focused</span>
                          <Badge variant="outline">Selected</Badge>
                        </div>
                      </div>
                      <Button size="sm" variant="outline" className="mt-3">
                        <Settings className="h-3 w-3 mr-1" />
                        Update Preferences
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Project Analytics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="p-4 text-center">
                      <Target className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-blue-600">94%</p>
                      <p className="text-sm text-gray-600">On-Time Delivery</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-green-50 border-green-200">
                    <CardContent className="p-4 text-center">
                      <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-green-600">98%</p>
                      <p className="text-sm text-gray-600">First-Time Approval</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-purple-50 border-purple-200">
                    <CardContent className="p-4 text-center">
                      <Zap className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-purple-600">2.1 days</p>
                      <p className="text-sm text-gray-600">Avg Response Time</p>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Project Timeline</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                        <span className="text-sm">Brand Identity</span>
                        <div className="flex items-center gap-2">
                          <Progress value={75} className="w-20 h-2" />
                          <span className="text-sm font-medium">75%</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                        <span className="text-sm">Website Development</span>
                        <div className="flex items-center gap-2">
                          <Progress value={90} className="w-20 h-2" />
                          <span className="text-sm font-medium">90%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Communication Stats</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                        <span className="text-sm">Messages Exchanged</span>
                        <span className="font-semibold">127</span>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                        <span className="text-sm">Meetings Held</span>
                        <span className="font-semibold">8</span>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                        <span className="text-sm">Files Shared</span>
                        <span className="font-semibold">23</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Feedback Tab */}
          <TabsContent value="feedback" className="space-y-6">
            <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
              <CardHeader>
                <CardTitle>Project Feedback</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Overall Satisfaction</label>
                    <div className="flex items-center space-x-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className="h-6 w-6 text-yellow-400 fill-current cursor-pointer hover:scale-110 transition-transform"
                        />
                      ))}
                      <span className="ml-2 text-sm text-gray-600">(Excellent)</span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Your Feedback</label>
                    <Textarea
                      placeholder="Share your thoughts about the project progress, team communication, or any suggestions..."
                      value={newFeedback}
                      onChange={(e) => setNewFeedback(e.target.value)}
                      className="min-h-[120px]"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Communication Quality</label>
                      <div className="flex items-center space-x-2">
                        <ThumbsUp className="h-5 w-5 text-green-500 cursor-pointer" />
                        <span className="text-sm">Excellent</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Timeline Adherence</label>
                      <div className="flex items-center space-x-2">
                        <ThumbsUp className="h-5 w-5 text-green-500 cursor-pointer" />
                        <span className="text-sm">On Track</span>
                      </div>
                    </div>
                  </div>
                  
                  <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white" onClick={handleSubmitFeedback}>
                    <Send className="h-4 w-4 mr-2" />
                    Submit Feedback
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Client Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Notification Preferences</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                        <div>
                          <p className="font-medium">Project Updates</p>
                          <p className="text-sm text-gray-600">Get notified about project progress</p>
                        </div>
                        <Badge className="bg-green-100 text-green-800">Enabled</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                        <div>
                          <p className="font-medium">Meeting Reminders</p>
                          <p className="text-sm text-gray-600">Reminders for scheduled meetings</p>
                        </div>
                        <Badge className="bg-green-100 text-green-800">Enabled</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                        <div>
                          <p className="font-medium">Invoice Notifications</p>
                          <p className="text-sm text-gray-600">New invoices and payment reminders</p>
                        </div>
                        <Badge className="bg-green-100 text-green-800">Enabled</Badge>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Account Settings</h3>
                    <div className="space-y-3">
                      <div className="p-3 rounded-lg bg-gray-50">
                        <p className="font-medium mb-2">Contact Information</p>
                        <p className="text-sm text-gray-600 mb-2">Email: {clientInfo.email}</p>
                        <Button size="sm" variant="outline">
                          <Edit className="h-3 w-3 mr-1" />
                          Update Contact Info
                        </Button>
                      </div>
                      <div className="p-3 rounded-lg bg-gray-50">
                        <p className="font-medium mb-2">Password & Security</p>
                        <p className="text-sm text-gray-600 mb-2">Last updated: 30 days ago</p>
                        <Button size="sm" variant="outline">
                          <Shield className="h-3 w-3 mr-1" />
                          Change Password
                        </Button>
                      </div>
                      <div className="p-3 rounded-lg bg-gray-50">
                        <p className="font-medium mb-2">Download Data</p>
                        <p className="text-sm text-gray-600 mb-2">Export your project data and communications</p>
                        <Button size="sm" variant="outline">
                          <Download className="h-3 w-3 mr-1" />
                          Export Data
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}