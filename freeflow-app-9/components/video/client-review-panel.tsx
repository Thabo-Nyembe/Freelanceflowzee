"use client";

import { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  MessageSquare, 
  Users, 
  Send,
  History,
  ThumbsUp,
  ThumbsDown,
  RotateCcw,
  FileText,
  Calendar,
  User,
  CheckCheck
} from 'lucide-react';

export interface ReviewStage {
  id: string;
  name: string;
  description: string;
  order: number;
  required_approvals: number;
  auto_advance: boolean;
  deadline_hours?: number;
}

export interface ReviewApproval {
  id: string;
  review_id: string;
  user_id: string;
  user_name: string;
  user_avatar?: string;
  status: 'pending' | 'approved' | 'rejected' | 'changes_requested';
  feedback?: string;
  timestamp: string;
  stage_id: string;
}

export interface ClientReview {
  id: string;
  video_id: string;
  project_id?: string;
  client_id?: string;
  
  // Review details
  title: string;
  description?: string;
  current_stage: string;
  status: 'draft' | 'in_review' | 'approved' | 'rejected' | 'changes_requested';
  
  // Workflow configuration
  stages: ReviewStage[];
  approvals: ReviewApproval[];
  
  // Deadlines and timing
  deadline?: string;
  started_at: string;
  completed_at?: string;
  
  // Settings
  settings: {
    allow_comments: boolean;
    require_all_approvals: boolean;
    auto_advance_stages: boolean;
    send_notifications: boolean;
  };
  
  // Metadata
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface ClientReviewPanelProps {
  review: ClientReview;
  userRole: 'client' | 'freelancer' | 'collaborator';
  onApprove?: (stageId: string, feedback?: string) => void;
  onReject?: (stageId: string, feedback: string) => void;
  onRequestChanges?: (stageId: string, feedback: string) => void;
  onAddReviewer?: (email: string, role: string) => void;
  onUpdateDeadline?: (deadline: string) => void;
  className?: string;
}

export default function ClientReviewPanel({
  review, userRole, onApprove, onReject, onRequestChanges, onAddReviewer, onUpdateDeadline, className
}: ClientReviewPanelProps) {
  const [feedback, setFeedback] = useState<any>('');
  const [selectedAction, setSelectedAction] = useState<'approve' | 'reject' | 'changes' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<any>(false);

  const currentStage = review.stages.find(stage => stage.id === review.current_stage);
  const currentStageApprovals = review.approvals.filter(approval => approval.stage_id === review.current_stage);
  const pendingApprovals = currentStageApprovals.filter(approval => approval.status === 'pending');
  const approvedCount = currentStageApprovals.filter(approval => approval.status === 'approved').length;
  const _rejectedCount = currentStageApprovals.filter(approval => approval.status === 'rejected').length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-500';
      case 'rejected': return 'bg-red-500';
      case 'changes_requested': return 'bg-yellow-500';
      case 'in_review': return 'bg-blue-500';
      case 'pending': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="w-4 h-4" />;
      case 'rejected': return <XCircle className="w-4 h-4" />;
      case 'changes_requested': return <RotateCcw className="w-4 h-4" />;
      case 'in_review': return <Clock className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const calculateProgress = useCallback(() => {
    const completedStages = review.stages.filter(stage => {
      const stageApprovals = review.approvals.filter(approval => approval.stage_id === stage.id);
      const approvedCount = stageApprovals.filter(approval => approval.status === 'approved').length;
      return approvedCount >= stage.required_approvals;
    }).length;
    
    return (completedStages / review.stages.length) * 100;
  }, [review.stages, review.approvals]);

  const handleSubmitReview = useCallback(async () => {
    if (!selectedAction || !currentStage) return;
    
    setIsSubmitting(true);
    
    try {
      switch (selectedAction) {
        case 'approve':
          await onApprove?.(currentStage.id, feedback);
          break;
        case 'reject':
          await onReject?.(currentStage.id, feedback);
          break;
        case 'changes':
          await onRequestChanges?.(currentStage.id, feedback);
          break;
      }
      
      setFeedback('');
      setSelectedAction(null);
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedAction, currentStage, feedback, onApprove, onReject, onRequestChanges]);

  const formatTimeRemaining = (deadline: string) => {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diffMs = deadlineDate.getTime() - now.getTime();
    const diffHours = Math.ceil(diffMs / (1000 * 60 * 60));
    
    if (diffHours < 0) {
      return 'Overdue';
    } else if (diffHours < 24) {
      return `${diffHours}h remaining`;
    } else {
      const diffDays = Math.ceil(diffHours / 24);
      return `${diffDays}d remaining`;
    }
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Review Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                {review.title}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {review.description}
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge className={cn("text-white", getStatusColor(review.status))}>
                {getStatusIcon(review.status)}
                <span className="ml-1 capitalize">{review.status.replace('_', ' ')}</span>
              </Badge>
              
              {review.deadline && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {formatTimeRemaining(review.deadline)}
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-4">
            {/* Progress Overview */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Review Progress</span>
                <span>{Math.round(calculateProgress())}% Complete</span>
              </div>
              <Progress value={calculateProgress()} className="h-2" />
            </div>
            
            {/* Current Stage Info */}
            {currentStage && (
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="space-y-1">
                  <div className="font-medium">{currentStage.name}</div>
                  <div className="text-sm text-muted-foreground">{currentStage.description}</div>
                </div>
                <div className="text-right space-y-1">
                  <div className="text-sm font-medium">
                    {approvedCount}/{currentStage.required_approvals} Approvals
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {pendingApprovals.length} pending
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Review Content */}
      <Tabs defaultValue="workflow" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="workflow">Workflow</TabsTrigger>
          <TabsTrigger value="approvals">Approvals</TabsTrigger>
          <TabsTrigger value="feedback">Feedback</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        {/* Workflow Tab */}
        <TabsContent value="workflow" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Review Workflow
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {review.stages.map((stage, index) => {
                  const stageApprovals = review.approvals.filter(approval => approval.stage_id === stage.id);
                  const stageApprovedCount = stageApprovals.filter(approval => approval.status === 'approved').length;
                  const isCompleted = stageApprovedCount >= stage.required_approvals;
                  const isCurrent = stage.id === review.current_stage;
                  
                  return (
                    <div key={stage.id} className={cn(
                      "flex items-center gap-4 p-4 rounded-lg border",
                      isCurrent ? "border-blue-500 bg-blue-50" : "border-border",
                      isCompleted ? "bg-green-50" : ""
                    )}>
                      {/* Stage Number */}
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                        isCompleted ? "bg-green-500 text-white" : 
                        isCurrent ? "bg-blue-500 text-white" : "bg-muted text-muted-foreground"
                      )}>
                        {isCompleted ? <CheckCheck className="w-4 h-4" /> : index + 1}
                      </div>
                      
                      {/* Stage Info */}
                      <div className="flex-1">
                        <div className="font-medium">{stage.name}</div>
                        <div className="text-sm text-muted-foreground">{stage.description}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Requires {stage.required_approvals} approval{stage.required_approvals !== 1 ? 's' : ''}
                        </div>
                      </div>
                      
                      {/* Stage Status */}
                      <div className="text-right">
                        <Badge variant={isCompleted ? "default" : isCurrent ? "secondary" : "outline"}>
                          {isCompleted ? "Completed" : isCurrent ? "In Progress" : "Pending"}
                        </Badge>
                        <div className="text-xs text-muted-foreground mt-1">
                          {stageApprovedCount}/{stage.required_approvals} approved
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Approvals Tab */}
        <TabsContent value="approvals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Review Approvals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {currentStageApprovals.length > 0 ? (
                  currentStageApprovals.map(approval => (
                    <div key={approval.id} className="flex items-center gap-4 p-3 border rounded-lg">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={approval.user_avatar} alt={approval.user_name} />
                        <AvatarFallback>
                          {approval.user_name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1">
                        <div className="font-medium">{approval.user_name}</div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(approval.timestamp).toLocaleDateString()}
                        </div>
                        {approval.feedback && (
                          <div className="text-sm mt-1 p-2 bg-muted rounded">
                            {approval.feedback}
                          </div>
                        )}
                      </div>
                      
                      <Badge className={cn("text-white", getStatusColor(approval.status))}>
                        {getStatusIcon(approval.status)}
                        <span className="ml-1 capitalize">{approval.status.replace('_', ' ')}</span>
                      </Badge>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No approvals for this stage yet</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Feedback Tab */}
        <TabsContent value="feedback" className="space-y-4">
          {(userRole === 'client' || userRole === 'collaborator') && review.status === 'in_review' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Submit Review
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Action Selection */}
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    variant={selectedAction === 'approve' ? 'default' : 'outline'}
                    onClick={() => setSelectedAction('approve')}
                    className="flex items-center gap-2"
                  >
                    <ThumbsUp className="w-4 h-4" />
                    Approve
                  </Button>
                  <Button
                    variant={selectedAction === 'changes' ? 'default' : 'outline'}
                    onClick={() => setSelectedAction('changes')}
                    className="flex items-center gap-2"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Request Changes
                  </Button>
                  <Button
                    variant={selectedAction === 'reject' ? 'destructive' : 'outline'}
                    onClick={() => setSelectedAction('reject')}
                    className="flex items-center gap-2"
                  >
                    <ThumbsDown className="w-4 h-4" />
                    Reject
                  </Button>
                </div>

                {/* Feedback Input */}
                {selectedAction && (
                  <div className="space-y-3">
                    <Textarea
                      placeholder={
                        selectedAction === 'approve' 
                          ? 'Optional: Add approval comments...'
                          : 'Please provide detailed feedback...'
                      }
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      rows={4}
                    />
                    
                    <div className="flex gap-2">
                      <Button
                        onClick={handleSubmitReview}
                        disabled={isSubmitting || (selectedAction !== 'approve' && !feedback.trim())}
                        className="flex items-center gap-2"
                      >
                        <Send className="w-4 h-4" />
                        {isSubmitting ? 'Submitting...' : `Submit ${selectedAction}`}
                      </Button>
                      
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSelectedAction(null);
                          setFeedback('');
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Consolidated Feedback */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                All Feedback
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {review.approvals
                  .filter(approval => approval.feedback)
                  .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                  .map(approval => (
                    <div key={approval.id} className="border-l-4 border-muted pl-4 py-2">
                      <div className="flex items-center gap-2 mb-2">
                        <Avatar className="w-6 h-6">
                          <AvatarImage src={approval.user_avatar} alt={approval.user_name} />
                          <AvatarFallback className="text-xs">
                            {approval.user_name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium text-sm">{approval.user_name}</span>
                        <Badge size="sm" className={cn("text-white text-xs", getStatusColor(approval.status))}>
                          {approval.status.replace('_', ' ')}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(approval.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm">{approval.feedback}</p>
                    </div>
                  ))}
                
                {review.approvals.filter(approval => approval.feedback).length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No feedback provided yet</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="w-4 h-4" />
                Review History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {review.approvals
                  .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                  .map(approval => (
                    <div key={approval.id} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                      <div className={cn("w-2 h-2 rounded-full", getStatusColor(approval.status))} />
                      <Avatar className="w-6 h-6">
                        <AvatarImage src={approval.user_avatar} alt={approval.user_name} />
                        <AvatarFallback className="text-xs">
                          {approval.user_name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <span className="text-sm">
                          <strong>{approval.user_name}</strong> {approval.status.replace('_', ' ')} the review
                        </span>
                        <div className="text-xs text-muted-foreground">
                          {new Date(approval.timestamp).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))}
                
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  <Avatar className="w-6 h-6">
                    <AvatarFallback className="text-xs">
                      <User className="w-3 h-3" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <span className="text-sm">Review workflow started</span>
                    <div className="text-xs text-muted-foreground">
                      {new Date(review.started_at).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 