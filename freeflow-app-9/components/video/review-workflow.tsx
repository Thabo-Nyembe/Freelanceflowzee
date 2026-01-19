/**
 * Review Workflow - FreeFlow A+++ Implementation
 * Frame.io-style approval workflow management
 */

'use client';

import { useState } from 'react';
import {
  CheckCircle,
  XCircle,
  Clock,
  Users,
  Plus,
  Send,
  Calendar,
  Link2,
  Copy,
  Mail,
  MoreHorizontal,
  Trash2,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import type {
  VideoReviewSession,
  ReviewParticipant,
  VideoAsset,
} from '@/lib/video/frame-comments';

interface ReviewWorkflowProps {
  video: VideoAsset;
  session?: VideoReviewSession | null;
  participants?: ReviewParticipant[];
  onCreateSession?: (data: {
    title?: string;
    description?: string;
    dueDate?: string;
    requiredApprovers?: number;
    isPublic?: boolean;
    password?: string;
    participants?: Array<{
      userId?: string;
      email?: string;
      role?: 'reviewer' | 'approver' | 'viewer';
    }>;
  }) => void;
  onUpdateSession?: (updates: Partial<VideoReviewSession>) => void;
  onAddParticipant?: (participant: {
    userId?: string;
    email?: string;
    role?: 'reviewer' | 'approver' | 'viewer';
  }) => void;
  onRemoveParticipant?: (participantId: string) => void;
  onApprove?: () => void;
  onReject?: (notes?: string) => void;
  onRequestChanges?: (notes: string) => void;
  teamMembers?: Array<{ id: string; name: string; email: string; avatarUrl?: string }>;
  currentUserId?: string;
  className?: string;
}

export function ReviewWorkflow({
  video,
  session,
  participants = [],
  onCreateSession,
  onUpdateSession,
  onAddParticipant,
  onRemoveParticipant,
  onApprove,
  onReject,
  onRequestChanges,
  teamMembers = [],
  currentUserId,
  className,
}: ReviewWorkflowProps) {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showAddParticipant, setShowAddParticipant] = useState(false);
  const [showDecisionDialog, setShowDecisionDialog] = useState<'approve' | 'reject' | 'changes' | null>(null);
  const [decisionNotes, setDecisionNotes] = useState('');

  // Form state for creating session
  const [sessionTitle, setSessionTitle] = useState('');
  const [sessionDescription, setSessionDescription] = useState('');
  const [sessionDueDate, setSessionDueDate] = useState('');
  const [requiredApprovers, setRequiredApprovers] = useState(1);
  const [isPublic, setIsPublic] = useState(false);
  const [password, setPassword] = useState('');
  const [selectedParticipants, setSelectedParticipants] = useState<
    Array<{ userId?: string; email?: string; role: 'reviewer' | 'approver' | 'viewer' }>
  >([]);
  const [newParticipantEmail, setNewParticipantEmail] = useState('');
  const [newParticipantRole, setNewParticipantRole] = useState<'reviewer' | 'approver' | 'viewer'>('reviewer');

  // Calculate approval progress
  const approvalCount = participants.filter((p) => p.status === 'approved').length;
  const requiredCount = session?.requiredApprovers || 1;
  const approvalProgress = Math.min(100, (approvalCount / requiredCount) * 100);

  // Check if current user is a participant
  const currentParticipant = participants.find((p) => p.userId === currentUserId);
  const canMakeDecision = currentParticipant && ['reviewer', 'approver'].includes(currentParticipant.role);
  const hasDecided = currentParticipant && ['approved', 'rejected'].includes(currentParticipant.status);

  const handleCreateSession = () => {
    onCreateSession?.({
      title: sessionTitle || `Review: ${video.title}`,
      description: sessionDescription,
      dueDate: sessionDueDate || undefined,
      requiredApprovers,
      isPublic,
      password: password || undefined,
      participants: selectedParticipants,
    });
    setShowCreateDialog(false);
    resetForm();
  };

  const handleAddParticipant = () => {
    const existingMember = teamMembers.find(
      (m) => m.email.toLowerCase() === newParticipantEmail.toLowerCase()
    );

    onAddParticipant?.({
      userId: existingMember?.id,
      email: newParticipantEmail,
      role: newParticipantRole,
    });

    setNewParticipantEmail('');
    setShowAddParticipant(false);
  };

  const handleDecision = () => {
    if (showDecisionDialog === 'approve') {
      onApprove?.();
    } else if (showDecisionDialog === 'reject') {
      onReject?.(decisionNotes || undefined);
    } else if (showDecisionDialog === 'changes') {
      onRequestChanges?.(decisionNotes);
    }
    setShowDecisionDialog(null);
    setDecisionNotes('');
  };

  const resetForm = () => {
    setSessionTitle('');
    setSessionDescription('');
    setSessionDueDate('');
    setRequiredApprovers(1);
    setIsPublic(false);
    setPassword('');
    setSelectedParticipants([]);
  };

  const getStatusBadge = (status: ReviewParticipant['status']) => {
    switch (status) {
      case 'approved':
        return (
          <Badge className="bg-green-100 text-green-700">
            <CheckCircle className="h-3 w-3 mr-1" />
            Approved
          </Badge>
        );
      case 'rejected':
        return (
          <Badge className="bg-red-100 text-red-700">
            <XCircle className="h-3 w-3 mr-1" />
            Rejected
          </Badge>
        );
      case 'commented':
        return (
          <Badge variant="secondary">Commented</Badge>
        );
      case 'viewed':
        return (
          <Badge variant="outline">Viewed</Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-muted-foreground">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
    }
  };

  // No active session - show create button
  if (!session) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Review & Approval
          </CardTitle>
          <CardDescription>
            Create a review session to collect feedback and approvals
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Start Review Session
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Create Review Session</DialogTitle>
                <DialogDescription>
                  Invite team members to review and approve this video
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Session Title</Label>
                  <Input
                    value={sessionTitle}
                    onChange={(e) => setSessionTitle(e.target.value)}
                    placeholder={`Review: ${video.title}`}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={sessionDescription}
                    onChange={(e) => setSessionDescription(e.target.value)}
                    placeholder="Add context for reviewers..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Due Date</Label>
                    <Input
                      type="date"
                      value={sessionDueDate}
                      onChange={(e) => setSessionDueDate(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Required Approvals</Label>
                    <Select
                      value={String(requiredApprovers)}
                      onValueChange={(v) => setRequiredApprovers(Number(v))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5].map((n) => (
                          <SelectItem key={n} value={String(n)}>
                            {n} approval{n > 1 ? 's' : ''}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Public Link</Label>
                    <p className="text-xs text-muted-foreground">
                      Allow anyone with link to view
                    </p>
                  </div>
                  <Switch checked={isPublic} onCheckedChange={setIsPublic} />
                </div>

                {isPublic && (
                  <div className="space-y-2">
                    <Label>Password Protection (optional)</Label>
                    <Input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Set a password..."
                    />
                  </div>
                )}

                <Separator />

                <div className="space-y-2">
                  <Label>Add Reviewers</Label>
                  <div className="flex gap-2">
                    <Input
                      type="email"
                      placeholder="Email address"
                      value={newParticipantEmail}
                      onChange={(e) => setNewParticipantEmail(e.target.value)}
                    />
                    <Select
                      value={newParticipantRole}
                      onValueChange={(v) => setNewParticipantRole(v as typeof newParticipantRole)}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="reviewer">Reviewer</SelectItem>
                        <SelectItem value="approver">Approver</SelectItem>
                        <SelectItem value="viewer">Viewer</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => {
                        if (newParticipantEmail) {
                          const member = teamMembers.find(
                            (m) => m.email.toLowerCase() === newParticipantEmail.toLowerCase()
                          );
                          setSelectedParticipants((prev) => [
                            ...prev,
                            {
                              userId: member?.id,
                              email: newParticipantEmail,
                              role: newParticipantRole,
                            },
                          ]);
                          setNewParticipantEmail('');
                        }
                      }}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  {selectedParticipants.length > 0 && (
                    <div className="space-y-2 mt-2">
                      {selectedParticipants.map((p, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between p-2 bg-muted rounded"
                        >
                          <span className="text-sm">{p.email}</span>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{p.role}</Badge>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() =>
                                setSelectedParticipants((prev) =>
                                  prev.filter((_, idx) => idx !== i)
                                )
                              }
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <DialogFooter>
                <Button variant="ghost" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateSession}>
                  <Send className="h-4 w-4 mr-2" />
                  Create & Send Invites
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    );
  }

  // Active session view
  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              {session.title || 'Review Session'}
            </CardTitle>
            {session.description && (
              <CardDescription className="mt-1">
                {session.description}
              </CardDescription>
            )}
          </div>
          <Badge
            variant={
              session.status === 'approved'
                ? 'default'
                : session.status === 'rejected'
                ? 'destructive'
                : 'secondary'
            }
          >
            {session.status}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Approval Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Approval Progress</span>
            <span>
              {approvalCount} / {requiredCount}
            </span>
          </div>
          <Progress value={approvalProgress} />
        </div>

        {/* Due Date */}
        {session.dueDate && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            Due {formatDistanceToNow(new Date(session.dueDate), { addSuffix: true })}
          </div>
        )}

        <Separator />

        {/* Participants */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Participants ({participants.length})</Label>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAddParticipant(true)}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Button>
          </div>

          <div className="space-y-2">
            {participants.map((participant) => (
              <div
                key={participant.id}
                className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
              >
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={participant.user?.avatarUrl} />
                    <AvatarFallback>
                      {participant.user?.name?.charAt(0) ||
                        participant.email?.charAt(0) ||
                        '?'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">
                      {participant.user?.name || participant.email}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {participant.role}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(participant.status)}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Resend Invite
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => onRemoveParticipant?.(participant.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Remove
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Share Link */}
        {session.isPublic && (
          <div className="space-y-2">
            <Label>Share Link</Label>
            <div className="flex gap-2">
              <Input
                readOnly
                value={`${typeof window !== 'undefined' ? window.location.origin : ''}/review/${session.id}`}
              />
              <Button
                variant="secondary"
                size="icon"
                onClick={() => {
                  navigator.clipboard.writeText(
                    `${window.location.origin}/review/${session.id}`
                  );
                }}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>

      {/* Decision Actions */}
      {canMakeDecision && !hasDecided && (
        <CardFooter className="flex gap-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => setShowDecisionDialog('changes')}
          >
            Request Changes
          </Button>
          <Button
            variant="destructive"
            className="flex-1"
            onClick={() => setShowDecisionDialog('reject')}
          >
            <XCircle className="h-4 w-4 mr-1" />
            Reject
          </Button>
          <Button className="flex-1" onClick={() => setShowDecisionDialog('approve')}>
            <CheckCircle className="h-4 w-4 mr-1" />
            Approve
          </Button>
        </CardFooter>
      )}

      {/* Add Participant Dialog */}
      <Dialog open={showAddParticipant} onOpenChange={setShowAddParticipant}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Participant</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={newParticipantEmail}
                onChange={(e) => setNewParticipantEmail(e.target.value)}
                placeholder="email@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select
                value={newParticipantRole}
                onValueChange={(v) => setNewParticipantRole(v as typeof newParticipantRole)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="reviewer">Reviewer</SelectItem>
                  <SelectItem value="approver">Approver</SelectItem>
                  <SelectItem value="viewer">Viewer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowAddParticipant(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddParticipant}>
              <Mail className="h-4 w-4 mr-2" />
              Send Invite
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Decision Dialog */}
      <Dialog
        open={showDecisionDialog !== null}
        onOpenChange={() => setShowDecisionDialog(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {showDecisionDialog === 'approve' && 'Approve Video'}
              {showDecisionDialog === 'reject' && 'Reject Video'}
              {showDecisionDialog === 'changes' && 'Request Changes'}
            </DialogTitle>
            <DialogDescription>
              {showDecisionDialog === 'approve' &&
                'Confirm that this video is ready for publication.'}
              {showDecisionDialog === 'reject' &&
                'Provide feedback on why this video is rejected.'}
              {showDecisionDialog === 'changes' &&
                'Describe the changes that need to be made.'}
            </DialogDescription>
          </DialogHeader>

          {showDecisionDialog !== 'approve' && (
            <Textarea
              value={decisionNotes}
              onChange={(e) => setDecisionNotes(e.target.value)}
              placeholder={
                showDecisionDialog === 'reject'
                  ? 'Rejection reason (optional)...'
                  : 'Required changes...'
              }
              className="min-h-[100px]"
            />
          )}

          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowDecisionDialog(null)}>
              Cancel
            </Button>
            <Button
              variant={showDecisionDialog === 'reject' ? 'destructive' : 'default'}
              onClick={handleDecision}
              disabled={showDecisionDialog === 'changes' && !decisionNotes.trim()}
            >
              {showDecisionDialog === 'approve' && 'Approve'}
              {showDecisionDialog === 'reject' && 'Reject'}
              {showDecisionDialog === 'changes' && 'Submit'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
