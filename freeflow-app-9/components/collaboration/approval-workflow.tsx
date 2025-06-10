'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  CheckCircle, 
  XCircle, 
  RotateCcw, 
  Clock, 
  User, 
  MessageSquare,
  Calendar,
  AlertTriangle,
  ThumbsUp,
  Send
} from 'lucide-react'

type ApprovalStatus = 'pending' | 'approved' | 'revision_requested' | 'rejected'

interface ApprovalRequest {
  id: string
  projectName: string
  submittedBy: {
    name: string
    avatar?: string
    role: 'freelancer' | 'client'
  }
  submittedAt: string
  status: ApprovalStatus
  deadline?: string
  description: string
  attachments: number
  feedback?: {
    message: string
    reviewer: string
    reviewedAt: string
  }
}

interface ApprovalWorkflowProps {
  requests: ApprovalRequest[]
  onApprove: (id: string, message?: string) => void
  onRequestRevision: (id: string, message: string) => void
  onReject: (id: string, message: string) => void
}

export function ApprovalWorkflow({ 
  requests, 
  onApprove, 
  onRequestRevision, 
  onReject 
}: ApprovalWorkflowProps) {
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null)
  const [feedbackMessage, setFeedbackMessage] = useState('')
  const [actionType, setActionType] = useState<'approve' | 'revision' | 'reject' | null>(null)

  const getStatusColor = (status: ApprovalStatus) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'approved': return 'bg-green-100 text-green-800 border-green-200'
      case 'revision_requested': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200'
    }
  }

  const getStatusIcon = (status: ApprovalStatus) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />
      case 'approved': return <CheckCircle className="h-4 w-4" />
      case 'revision_requested': return <RotateCcw className="h-4 w-4" />
      case 'rejected': return <XCircle className="h-4 w-4" />
    }
  }

  const handleAction = () => {
    if (!selectedRequest || !actionType) return

    switch (actionType) {
      case 'approve':
        onApprove(selectedRequest, feedbackMessage || 'Approved')
        break
      case 'revision':
        onRequestRevision(selectedRequest, feedbackMessage)
        break
      case 'reject':
        onReject(selectedRequest, feedbackMessage)
        break
    }

    setSelectedRequest(null)
    setFeedbackMessage('')
    setActionType(null)
  }

  const isDeadlineNear = (deadline?: string) => {
    if (!deadline) return false
    const deadlineDate = new Date(deadline)
    const now = new Date()
    const hoursLeft = (deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60)
    return hoursLeft <= 24 && hoursLeft > 0
  }

  const pendingRequests = requests.filter(r => r.status === 'pending')
  const completedRequests = requests.filter(r => r.status !== 'pending')

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            🎯 Approval Workflow
          </h2>
          <p className="text-muted-foreground mt-1">
            Review and approve project submissions
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="bg-yellow-50">
            {pendingRequests.length} Pending Reviews
          </Badge>
        </div>
      </div>

      {/* Pending Approvals */}
      {pendingRequests.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            Pending Approvals
          </h3>
          
          {pendingRequests.map((request) => (
            <Card key={request.id} className="border-yellow-200 bg-yellow-50/50">
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={request.submittedBy.avatar} />
                        <AvatarFallback>
                          {request.submittedBy.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          {request.projectName}
                        </h4>
                        <p className="text-sm text-gray-600">
                          Submitted by {request.submittedBy.name} • {request.attachments} files
                        </p>
                      </div>
                      
                      <Badge className={getStatusColor(request.status)}>
                        {getStatusIcon(request.status)}
                        <span className="ml-1 capitalize">
                          {request.status.replace('_', ' ')}
                        </span>
                      </Badge>
                    </div>
                    
                    <p className="text-gray-700">{request.description}</p>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(request.submittedAt).toLocaleDateString()}
                      </span>
                      {request.deadline && (
                        <span className={`flex items-center gap-1 ${
                          isDeadlineNear(request.deadline) ? 'text-red-600 font-medium' : ''
                        }`}>
                          <Clock className="h-4 w-4" />
                          Due: {new Date(request.deadline).toLocaleDateString()}
                          {isDeadlineNear(request.deadline) && ' (Soon!)'}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedRequest(request.id)
                        setActionType('approve')
                      }}
                      className="text-green-600 border-green-200 hover:bg-green-50"
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedRequest(request.id)
                        setActionType('revision')
                      }}
                      className="text-orange-600 border-orange-200 hover:bg-orange-50"
                    >
                      <RotateCcw className="h-4 w-4 mr-1" />
                      Revise
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedRequest(request.id)
                        setActionType('reject')
                      }}
                      className="text-red-600 border-red-200 hover:bg-red-50"
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Reject
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Action Modal */}
      {selectedRequest && actionType && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {actionType === 'approve' && <ThumbsUp className="h-5 w-5 text-green-600" />}
              {actionType === 'revision' && <RotateCcw className="h-5 w-5 text-orange-600" />}
              {actionType === 'reject' && <XCircle className="h-5 w-5 text-red-600" />}
              
              {actionType === 'approve' && 'Approve Submission'}
              {actionType === 'revision' && 'Request Revisions'}
              {actionType === 'reject' && 'Reject Submission'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder={
                actionType === 'approve' 
                  ? 'Add a positive note (optional)...'
                  : 'Please explain what needs to be changed...'
              }
              value={feedbackMessage}
              onChange={(e) => setFeedbackMessage(e.target.value)}
              className="min-h-[100px]"
              required={actionType !== 'approve'}
            />
            
            <div className="flex gap-3">
              <Button 
                onClick={handleAction}
                disabled={actionType !== 'approve' && !feedbackMessage.trim()}
                className={
                  actionType === 'approve' 
                    ? 'bg-green-600 hover:bg-green-700'
                    : actionType === 'revision'
                    ? 'bg-orange-600 hover:bg-orange-700'
                    : 'bg-red-600 hover:bg-red-700'
                }
              >
                <Send className="h-4 w-4 mr-2" />
                {actionType === 'approve' && 'Approve'}
                {actionType === 'revision' && 'Request Changes'}
                {actionType === 'reject' && 'Reject'}
              </Button>
              <Button 
                variant="outline"
                onClick={() => {
                  setSelectedRequest(null)
                  setActionType(null)
                  setFeedbackMessage('')
                }}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Completed Reviews */}
      {completedRequests.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Recent Reviews
          </h3>
          
          <div className="grid gap-4">
            {completedRequests.slice(0, 5).map((request) => (
              <Card key={request.id} className="border-gray-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={request.submittedBy.avatar} />
                        <AvatarFallback>
                          {request.submittedBy.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div>
                        <p className="font-medium">{request.projectName}</p>
                        <p className="text-sm text-gray-600">
                          by {request.submittedBy.name}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Badge className={getStatusColor(request.status)}>
                        {getStatusIcon(request.status)}
                        <span className="ml-1 capitalize">
                          {request.status.replace('_', ' ')}
                        </span>
                      </Badge>
                      <span className="text-sm text-gray-500">
                        {new Date(request.submittedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  
                  {request.feedback && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <MessageSquare className="h-4 w-4 text-gray-600" />
                        <span className="text-sm font-medium text-gray-900">
                          Feedback from {request.feedback.reviewer}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">{request.feedback.message}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
} 