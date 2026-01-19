/**
 * Dispute Detail Component - FreeFlow A+++ Implementation
 * Full dispute view with messaging, evidence, and proposals
 */

'use client';

import { useState } from 'react';
import { format, formatDistanceToNow } from 'date-fns';
import {
  AlertTriangle,
  Clock,
  CheckCircle,
  XCircle,
  MessageSquare,
  FileText,
  Scale,
  Upload,
  Send,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  ExternalLink,
  Download,
  MoreVertical,
  Flag,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
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
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import {
  useDispute,
  useDisputeMessages,
  useDisputeEvidence,
  useDisputeProposals,
  type DisputeStatus,
  type ResolutionType,
  type EvidenceType,
  getDisputeStatusColor,
  getDisputeStatusLabel,
  getDisputeTypeLabel,
  getResolutionTypeLabel,
} from '@/lib/hooks/use-disputes';

interface DisputeDetailProps {
  disputeId: string;
}

export function DisputeDetail({ disputeId }: DisputeDetailProps) {
  const { dispute, userRole, canResolve, isLoading, updateDispute, isUpdating } =
    useDispute(disputeId);
  const { messages, sendMessage, isSending } = useDisputeMessages(disputeId);
  const { evidence, byParty, submitEvidence, isSubmitting } =
    useDisputeEvidence(disputeId);
  const {
    proposals,
    activeProposal,
    createProposal,
    respondToProposal,
    isCreating,
    isResponding,
  } = useDisputeProposals(disputeId);

  const [newMessage, setNewMessage] = useState('');
  const [showProposalDialog, setShowProposalDialog] = useState(false);
  const [showEvidenceDialog, setShowEvidenceDialog] = useState(false);
  const [expandTimeline, setExpandTimeline] = useState(false);

  // Proposal form state
  const [proposalType, setProposalType] = useState<ResolutionType>('partial_refund');
  const [proposalAmount, setProposalAmount] = useState('');
  const [proposalDescription, setProposalDescription] = useState('');

  // Evidence form state
  const [evidenceTitle, setEvidenceTitle] = useState('');
  const [evidenceDescription, setEvidenceDescription] = useState('');
  const [evidenceType, setEvidenceType] = useState<EvidenceType>('screenshot');
  const [evidenceUrl, setEvidenceUrl] = useState('');

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (!dispute) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <AlertCircle className="h-12 w-12 mx-auto text-destructive mb-4" />
          <h3 className="text-lg font-semibold">Dispute Not Found</h3>
          <p className="text-muted-foreground">
            This dispute may have been deleted or you don&apos;t have access.
          </p>
        </CardContent>
      </Card>
    );
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      await sendMessage({ message: newMessage });
      setNewMessage('');
    } catch (error) {
      toast.error('Failed to send message');
    }
  };

  const handleSubmitProposal = async () => {
    try {
      await createProposal({
        resolution_type: proposalType,
        proposed_amount: proposalAmount ? parseFloat(proposalAmount) : undefined,
        description: proposalDescription,
      });
      setShowProposalDialog(false);
      setProposalType('partial_refund');
      setProposalAmount('');
      setProposalDescription('');
      toast.success('Resolution proposal submitted');
    } catch (error) {
      toast.error('Failed to submit proposal');
    }
  };

  const handleSubmitEvidence = async () => {
    try {
      await submitEvidence({
        title: evidenceTitle,
        description: evidenceDescription,
        evidence_type: evidenceType,
        external_url: evidenceUrl || undefined,
        file_url: evidenceUrl || undefined,
      });
      setShowEvidenceDialog(false);
      setEvidenceTitle('');
      setEvidenceDescription('');
      setEvidenceUrl('');
      toast.success('Evidence submitted');
    } catch (error) {
      toast.error('Failed to submit evidence');
    }
  };

  const handleRespondToProposal = async (accept: boolean) => {
    if (!activeProposal) return;

    try {
      await respondToProposal({
        proposal_id: activeProposal.id,
        accept,
      });
      toast.success(accept ? 'Proposal accepted' : 'Proposal rejected');
    } catch (error) {
      toast.error('Failed to respond to proposal');
    }
  };

  const handleEscalate = async () => {
    try {
      await updateDispute({ action: 'escalate' });
      toast.success('Dispute escalated to mediation');
    } catch (error) {
      toast.error('Failed to escalate dispute');
    }
  };

  const isActive = !['resolved', 'closed'].includes(dispute.status);
  const canSubmitEvidence =
    isActive &&
    (userRole === 'initiator' || userRole === 'respondent') &&
    (!dispute.evidence_deadline ||
      new Date(dispute.evidence_deadline) > new Date());

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <Badge className={getDisputeStatusColor(dispute.status)}>
                  {getDisputeStatusLabel(dispute.status)}
                </Badge>
                <Badge variant="outline">
                  {getDisputeTypeLabel(dispute.dispute_type)}
                </Badge>
                {dispute.priority !== 'normal' && (
                  <Badge
                    variant={dispute.priority === 'urgent' ? 'destructive' : 'secondary'}
                  >
                    {dispute.priority}
                  </Badge>
                )}
              </div>
              <h1 className="text-2xl font-bold mb-2">{dispute.title}</h1>
              <p className="text-muted-foreground">{dispute.description}</p>
              <div className="flex items-center gap-6 mt-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Amount in dispute: </span>
                  <span className="font-semibold">
                    ${dispute.disputed_amount.toFixed(2)} {dispute.currency}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Opened: </span>
                  <span>
                    {format(new Date(dispute.created_at), 'MMM d, yyyy')}
                  </span>
                </div>
                {dispute.mediator && (
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Mediator: </span>
                    <Avatar className="h-5 w-5">
                      <AvatarImage src={dispute.mediator.avatar_url} />
                      <AvatarFallback>
                        {dispute.mediator.name?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <span>{dispute.mediator.name}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            {isActive && (
              <div className="flex gap-2">
                <Dialog open={showProposalDialog} onOpenChange={setShowProposalDialog}>
                  <DialogTrigger asChild>
                    <Button>Propose Resolution</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Propose a Resolution</DialogTitle>
                      <DialogDescription>
                        Submit a resolution proposal for the other party to review.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label>Resolution Type</Label>
                        <Select
                          value={proposalType}
                          onValueChange={(v) => setProposalType(v as ResolutionType)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="full_refund">Full Refund</SelectItem>
                            <SelectItem value="partial_refund">Partial Refund</SelectItem>
                            <SelectItem value="redelivery">Redelivery</SelectItem>
                            <SelectItem value="order_completed">
                              Accept as Complete
                            </SelectItem>
                            <SelectItem value="mutual_cancellation">
                              Mutual Cancellation
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      {['full_refund', 'partial_refund'].includes(proposalType) && (
                        <div className="space-y-2">
                          <Label>Refund Amount ($)</Label>
                          <Input
                            type="number"
                            value={proposalAmount}
                            onChange={(e) => setProposalAmount(e.target.value)}
                            placeholder={`Max: ${dispute.disputed_amount}`}
                            max={dispute.disputed_amount}
                          />
                        </div>
                      )}
                      <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea
                          value={proposalDescription}
                          onChange={(e) => setProposalDescription(e.target.value)}
                          placeholder="Explain your proposal..."
                          rows={4}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setShowProposalDialog(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleSubmitProposal}
                        disabled={isCreating || !proposalDescription}
                      >
                        {isCreating ? 'Submitting...' : 'Submit Proposal'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                {dispute.status !== 'mediation' && (
                  <Button variant="outline" onClick={handleEscalate} disabled={isUpdating}>
                    <Scale className="h-4 w-4 mr-2" />
                    Escalate
                  </Button>
                )}

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Flag className="h-4 w-4 mr-2" />
                      Report Issue
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>

          {/* Active Proposal Banner */}
          {activeProposal && activeProposal.proposed_by !== dispute.initiator_id && userRole === 'initiator' && (
            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h4 className="font-medium">Resolution Proposal Received</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    {getResolutionTypeLabel(activeProposal.resolution_type)}
                    {activeProposal.proposed_amount &&
                      ` - $${activeProposal.proposed_amount.toFixed(2)}`}
                  </p>
                  <p className="text-sm mt-2">{activeProposal.description}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleRespondToProposal(false)}
                    disabled={isResponding}
                  >
                    Reject
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleRespondToProposal(true)}
                    disabled={isResponding}
                  >
                    Accept
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Parties */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {dispute.buyer_is_initiator ? 'Buyer (Initiator)' : 'Seller (Initiator)'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src={dispute.initiator?.avatar_url} />
                <AvatarFallback>{dispute.initiator?.name?.[0]}</AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium">{dispute.initiator?.name}</div>
                <div className="text-sm text-muted-foreground">
                  {dispute.initiator?.email}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {dispute.buyer_is_initiator ? 'Seller (Respondent)' : 'Buyer (Respondent)'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src={dispute.respondent?.avatar_url} />
                <AvatarFallback>{dispute.respondent?.name?.[0]}</AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium">{dispute.respondent?.name}</div>
                <div className="text-sm text-muted-foreground">
                  {dispute.respondent?.email}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="messages" className="space-y-4">
        <TabsList>
          <TabsTrigger value="messages" className="gap-2">
            <MessageSquare className="h-4 w-4" />
            Messages ({messages.length})
          </TabsTrigger>
          <TabsTrigger value="evidence" className="gap-2">
            <FileText className="h-4 w-4" />
            Evidence ({evidence.length})
          </TabsTrigger>
          <TabsTrigger value="proposals" className="gap-2">
            <Scale className="h-4 w-4" />
            Proposals ({proposals.length})
          </TabsTrigger>
          <TabsTrigger value="timeline" className="gap-2">
            <Clock className="h-4 w-4" />
            Timeline
          </TabsTrigger>
        </TabsList>

        {/* Messages Tab */}
        <TabsContent value="messages">
          <Card>
            <CardContent className="p-0">
              <ScrollArea className="h-[400px] p-4">
                <div className="space-y-4">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex gap-3 ${
                        msg.message_type === 'system' ? 'justify-center' : ''
                      }`}
                    >
                      {msg.message_type !== 'system' && (
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={msg.sender?.avatar_url} />
                          <AvatarFallback>
                            {msg.sender?.name?.[0]}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div
                        className={
                          msg.message_type === 'system'
                            ? 'text-center text-sm text-muted-foreground'
                            : 'flex-1'
                        }
                      >
                        {msg.message_type !== 'system' && (
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm">
                              {msg.sender?.name}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(msg.created_at), {
                                addSuffix: true,
                              })}
                            </span>
                          </div>
                        )}
                        <div
                          className={
                            msg.message_type === 'system'
                              ? 'inline-block px-3 py-1 bg-muted rounded-full'
                              : 'bg-muted rounded-lg p-3'
                          }
                        >
                          {msg.message}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              {isActive && (
                <>
                  <Separator />
                  <div className="p-4 flex gap-2">
                    <Input
                      placeholder="Type your message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                    />
                    <Button onClick={handleSendMessage} disabled={isSending}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Evidence Tab */}
        <TabsContent value="evidence">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Submitted Evidence</CardTitle>
                {canSubmitEvidence && (
                  <Dialog
                    open={showEvidenceDialog}
                    onOpenChange={setShowEvidenceDialog}
                  >
                    <DialogTrigger asChild>
                      <Button size="sm">
                        <Upload className="h-4 w-4 mr-2" />
                        Submit Evidence
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Submit Evidence</DialogTitle>
                        <DialogDescription>
                          Add documentation to support your case.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label>Title</Label>
                          <Input
                            value={evidenceTitle}
                            onChange={(e) => setEvidenceTitle(e.target.value)}
                            placeholder="Brief title for this evidence"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Type</Label>
                          <Select
                            value={evidenceType}
                            onValueChange={(v) => setEvidenceType(v as EvidenceType)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="screenshot">Screenshot</SelectItem>
                              <SelectItem value="file">File</SelectItem>
                              <SelectItem value="link">External Link</SelectItem>
                              <SelectItem value="chat_log">Chat Log</SelectItem>
                              <SelectItem value="contract">Contract</SelectItem>
                              <SelectItem value="invoice">Invoice</SelectItem>
                              <SelectItem value="delivery_proof">
                                Delivery Proof
                              </SelectItem>
                              <SelectItem value="communication">
                                Communication
                              </SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>URL</Label>
                          <Input
                            value={evidenceUrl}
                            onChange={(e) => setEvidenceUrl(e.target.value)}
                            placeholder="File or external URL"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Description (optional)</Label>
                          <Textarea
                            value={evidenceDescription}
                            onChange={(e) =>
                              setEvidenceDescription(e.target.value)
                            }
                            placeholder="Explain what this evidence shows..."
                            rows={3}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button
                          variant="outline"
                          onClick={() => setShowEvidenceDialog(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleSubmitEvidence}
                          disabled={isSubmitting || !evidenceTitle || !evidenceUrl}
                        >
                          {isSubmitting ? 'Submitting...' : 'Submit'}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {evidence.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No evidence submitted yet
                </p>
              ) : (
                <div className="space-y-4">
                  {evidence.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-start gap-4 p-4 border rounded-lg"
                    >
                      <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{item.title}</span>
                          <Badge variant="outline">{item.evidence_type}</Badge>
                          {item.is_verified && (
                            <Badge className="bg-green-100 text-green-800">
                              Verified
                            </Badge>
                          )}
                        </div>
                        {item.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {item.description}
                          </p>
                        )}
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                          <span>
                            By {item.submitter?.name} •{' '}
                            {formatDistanceToNow(new Date(item.created_at), {
                              addSuffix: true,
                            })}
                          </span>
                        </div>
                      </div>
                      {(item.file_url || item.external_url) && (
                        <Button variant="ghost" size="sm" asChild>
                          <a
                            href={item.file_url || item.external_url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Proposals Tab */}
        <TabsContent value="proposals">
          <Card>
            <CardHeader>
              <CardTitle>Resolution Proposals</CardTitle>
              <CardDescription>
                History of resolution proposals and their outcomes
              </CardDescription>
            </CardHeader>
            <CardContent>
              {proposals.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No proposals submitted yet
                </p>
              ) : (
                <div className="space-y-4">
                  {proposals.map((proposal) => (
                    <div
                      key={proposal.id}
                      className={`p-4 border rounded-lg ${
                        proposal.status === 'accepted'
                          ? 'border-green-200 bg-green-50 dark:bg-green-950'
                          : proposal.status === 'rejected'
                            ? 'border-red-200 bg-red-50 dark:bg-red-950'
                            : ''
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <Badge>
                              {getResolutionTypeLabel(proposal.resolution_type)}
                            </Badge>
                            {proposal.proposed_amount && (
                              <span className="font-medium">
                                ${proposal.proposed_amount.toFixed(2)}
                              </span>
                            )}
                            <Badge
                              variant={
                                proposal.status === 'accepted'
                                  ? 'default'
                                  : proposal.status === 'rejected'
                                    ? 'destructive'
                                    : 'secondary'
                              }
                            >
                              {proposal.status}
                            </Badge>
                          </div>
                          <p className="mt-2">{proposal.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                        <span>
                          By {proposal.proposer?.name} •{' '}
                          {format(new Date(proposal.created_at), 'MMM d, yyyy')}
                        </span>
                        {proposal.status === 'pending' && (
                          <span className="text-orange-600">
                            Expires{' '}
                            {formatDistanceToNow(new Date(proposal.expires_at), {
                              addSuffix: true,
                            })}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Timeline Tab */}
        <TabsContent value="timeline">
          <Card>
            <CardHeader>
              <CardTitle>Activity Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dispute.activity
                  ?.slice(0, expandTimeline ? undefined : 10)
                  .map((activity) => (
                    <div key={activity.id} className="flex gap-4">
                      <div className="h-2 w-2 mt-2 rounded-full bg-primary" />
                      <div className="flex-1">
                        <p className="text-sm">{activity.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(
                            new Date(activity.created_at),
                            'MMM d, yyyy h:mm a'
                          )}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
              {dispute.activity && dispute.activity.length > 10 && (
                <Button
                  variant="ghost"
                  className="w-full mt-4"
                  onClick={() => setExpandTimeline(!expandTimeline)}
                >
                  {expandTimeline ? (
                    <>
                      <ChevronUp className="h-4 w-4 mr-2" />
                      Show Less
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-4 w-4 mr-2" />
                      Show All ({dispute.activity.length})
                    </>
                  )}
                </Button>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default DisputeDetail;
