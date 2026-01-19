'use client';

/**
 * Client Job Dashboard - FreeFlow A+++ Implementation
 * Complete dashboard for clients to manage posted jobs and proposals
 */

import { useState } from 'react';
import Link from 'next/link';
import { formatDistanceToNow, format } from 'date-fns';
import {
  Briefcase,
  Plus,
  Users,
  Eye,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Send,
  FileText,
  Star,
  DollarSign,
  Calendar,
  MessageSquare,
  ChevronRight,
  Filter,
  Loader2,
  Settings,
  MoreVertical,
  Edit,
  Trash2,
  Copy,
  Archive,
  TrendingUp,
  Award,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  useMyJobs,
  useJobMutations,
  useJobProposals,
  FreelancerJob,
  JobProposal,
} from '@/lib/hooks/use-job-board';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const JOB_STATUS_CONFIG = {
  draft: { label: 'Draft', color: 'bg-gray-100 text-gray-800', icon: FileText },
  open: { label: 'Open', color: 'bg-green-100 text-green-800', icon: Briefcase },
  in_review: { label: 'In Review', color: 'bg-yellow-100 text-yellow-800', icon: Eye },
  filled: { label: 'Filled', color: 'bg-blue-100 text-blue-800', icon: CheckCircle2 },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-800', icon: XCircle },
  closed: { label: 'Closed', color: 'bg-gray-100 text-gray-800', icon: Archive },
};

interface ProposalsViewProps {
  jobId: string;
  jobTitle: string;
}

function ProposalsView({ jobId, jobTitle }: ProposalsViewProps) {
  const { proposals, isLoading, updateProposalStatus } = useJobProposals(jobId);
  const [selectedProposal, setSelectedProposal] = useState<JobProposal | null>(null);

  const handleAction = async (proposalId: string, action: Parameters<typeof updateProposalStatus>[1]) => {
    try {
      await updateProposalStatus(proposalId, action);
      toast.success(`Proposal ${action.replace('_', ' ')}`);
    } catch {
      toast.error('Failed to update proposal');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (proposals.length === 0) {
    return (
      <div className="text-center py-8">
        <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="font-semibold mb-2">No Proposals Yet</h3>
        <p className="text-sm text-muted-foreground">
          Proposals will appear here as freelancers apply
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {proposals.length} proposal{proposals.length !== 1 ? 's' : ''} for "{jobTitle}"
        </p>
        <Select defaultValue="newest">
          <SelectTrigger className="w-[150px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="match">Best Match</SelectItem>
            <SelectItem value="rate_low">Lowest Rate</SelectItem>
            <SelectItem value="rate_high">Highest Rate</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        {proposals.map((proposal) => (
          <Card key={proposal.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                {/* Freelancer Info */}
                <Avatar className="h-12 w-12">
                  <AvatarImage src={proposal.freelancer?.profile_image || ''} />
                  <AvatarFallback>
                    {proposal.freelancer?.display_name?.[0] || 'F'}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold">
                      {proposal.freelancer?.display_name || 'Freelancer'}
                    </span>
                    {proposal.freelancer?.rating && proposal.freelancer.rating > 0 && (
                      <div className="flex items-center gap-1 text-sm">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span>{proposal.freelancer.rating.toFixed(1)}</span>
                      </div>
                    )}
                    <Badge variant="outline" className="text-xs capitalize">
                      {proposal.freelancer?.level || 'New'}
                    </Badge>
                  </div>

                  <p className="text-sm text-muted-foreground mb-2">
                    {proposal.freelancer?.tagline || 'Freelancer on FreeFlow'}
                  </p>

                  {/* Cover Letter Preview */}
                  <p className="text-sm line-clamp-2 mb-2">{proposal.cover_letter}</p>

                  {/* Match Score */}
                  {proposal.match_score > 0 && (
                    <div className="flex items-center gap-2 mb-2">
                      <Progress value={proposal.match_score} className="flex-1 h-2" />
                      <span className="text-sm font-medium">{Math.round(proposal.match_score)}% match</span>
                    </div>
                  )}

                  {/* Skills Matched */}
                  {proposal.skills_matched && proposal.skills_matched.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {proposal.skills_matched.slice(0, 5).map((skill) => (
                        <Badge key={skill} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                {/* Rate & Actions */}
                <div className="text-right flex-shrink-0">
                  <p className="text-lg font-bold">
                    ${proposal.proposed_rate}
                    <span className="text-sm font-normal text-muted-foreground">
                      {proposal.rate_type === 'hourly' ? '/hr' : ' fixed'}
                    </span>
                  </p>
                  <p className="text-xs text-muted-foreground mb-3">
                    {formatDistanceToNow(new Date(proposal.submitted_at || proposal.created_at), { addSuffix: true })}
                  </p>

                  {proposal.status === 'submitted' && (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAction(proposal.id, 'reject')}
                      >
                        Decline
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleAction(proposal.id, 'shortlist')}
                      >
                        Shortlist
                      </Button>
                    </div>
                  )}

                  {proposal.status === 'shortlisted' && (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAction(proposal.id, 'schedule_interview')}
                      >
                        <MessageSquare className="h-4 w-4 mr-1" />
                        Interview
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleAction(proposal.id, 'send_offer')}
                      >
                        <Send className="h-4 w-4 mr-1" />
                        Send Offer
                      </Button>
                    </div>
                  )}

                  {['viewed', 'interviewing', 'offer_sent'].includes(proposal.status) && (
                    <Badge variant="secondary" className="capitalize">
                      {proposal.status.replace('_', ' ')}
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function ClientDashboard() {
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [selectedJob, setSelectedJob] = useState<FreelancerJob | null>(null);
  const [deleteConfirmJob, setDeleteConfirmJob] = useState<FreelancerJob | null>(null);

  const { jobs, isLoading, error, refresh } = useMyJobs({ status: statusFilter });
  const { publishJob, closeJob, deleteJob, isSubmitting } = useJobMutations();

  const handlePublish = async (job: FreelancerJob) => {
    try {
      await publishJob(job.id);
      toast.success('Job published successfully');
      refresh();
    } catch {
      toast.error('Failed to publish job');
    }
  };

  const handleClose = async (job: FreelancerJob) => {
    try {
      await closeJob(job.id);
      toast.success('Job closed');
      refresh();
    } catch {
      toast.error('Failed to close job');
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirmJob) return;
    try {
      await deleteJob(deleteConfirmJob.id);
      toast.success('Job deleted');
      setDeleteConfirmJob(null);
      refresh();
    } catch {
      toast.error('Failed to delete job');
    }
  };

  // Calculate stats
  const stats = {
    totalJobs: jobs.length,
    openJobs: jobs.filter((j) => j.status === 'open').length,
    draftJobs: jobs.filter((j) => j.status === 'draft').length,
    filledJobs: jobs.filter((j) => j.status === 'filled').length,
    totalProposals: jobs.reduce((acc, j) => acc + (j.proposals_count || 0), 0),
    totalViews: jobs.reduce((acc, j) => acc + (j.views_count || 0), 0),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Jobs</h1>
          <p className="text-muted-foreground">Manage your job postings and review proposals</p>
        </div>
        <Button asChild>
          <Link href="/client/jobs/new">
            <Plus className="h-4 w-4 mr-2" />
            Post a Job
          </Link>
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Briefcase className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Jobs</p>
                <p className="text-xl font-bold">{stats.totalJobs}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Open</p>
                <p className="text-xl font-bold">{stats.openJobs}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                <FileText className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Drafts</p>
                <p className="text-xl font-bold">{stats.draftJobs}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <Award className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Filled</p>
                <p className="text-xl font-bold">{stats.filledJobs}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                <Users className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Proposals</p>
                <p className="text-xl font-bold">{stats.totalProposals}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-pink-100 dark:bg-pink-900/30 rounded-lg">
                <Eye className="h-5 w-5 text-pink-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Views</p>
                <p className="text-xl font-bold">{stats.totalViews}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Jobs List */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle>Posted Jobs</CardTitle>
            <Select
              value={statusFilter || 'all'}
              onValueChange={(value) => setStatusFilter(value === 'all' ? undefined : value)}
            >
              <SelectTrigger className="w-[150px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Jobs</SelectItem>
                {Object.entries(JOB_STATUS_CONFIG).map(([status, config]) => (
                  <SelectItem key={status} value={status}>
                    {config.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <AlertCircle className="h-12 w-12 text-destructive mb-4" />
              <p className="text-muted-foreground">{error}</p>
              <Button onClick={() => refresh()} className="mt-4">
                Try Again
              </Button>
            </div>
          ) : jobs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Briefcase className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Jobs Posted</h3>
              <p className="text-muted-foreground mb-4">
                Get started by posting your first job
              </p>
              <Button asChild>
                <Link href="/client/jobs/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Post a Job
                </Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {jobs.map((job) => {
                const statusConfig = JOB_STATUS_CONFIG[job.status as keyof typeof JOB_STATUS_CONFIG] || JOB_STATUS_CONFIG.draft;
                const StatusIcon = statusConfig.icon;

                return (
                  <Card key={job.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Link
                              href={`/client/jobs/${job.id}`}
                              className="font-semibold text-lg hover:text-primary transition-colors"
                            >
                              {job.title}
                            </Link>
                            <Badge className={cn('gap-1', statusConfig.color)}>
                              <StatusIcon className="h-3 w-3" />
                              {statusConfig.label}
                            </Badge>
                          </div>

                          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-2">
                            <span className="flex items-center gap-1">
                              <DollarSign className="h-4 w-4" />
                              {job.budget_type === 'hourly'
                                ? `$${job.budget_min || 0} - $${job.budget_max || 0}/hr`
                                : `$${job.budget_max?.toLocaleString() || 'Negotiable'}`
                              }
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              Posted {formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}
                            </span>
                            <span className="flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              {job.proposals_count || 0} proposals
                            </span>
                            <span className="flex items-center gap-1">
                              <Eye className="h-4 w-4" />
                              {job.views_count || 0} views
                            </span>
                          </div>

                          <div className="flex flex-wrap gap-1">
                            {job.required_skills.slice(0, 5).map((skill) => (
                              <Badge key={skill} variant="outline" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                            {job.required_skills.length > 5 && (
                              <Badge variant="outline" className="text-xs text-muted-foreground">
                                +{job.required_skills.length - 5}
                              </Badge>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {job.proposals_count > 0 && (
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm">
                                  <Users className="h-4 w-4 mr-1" />
                                  View Proposals ({job.proposals_count})
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                                <DialogHeader>
                                  <DialogTitle>Proposals</DialogTitle>
                                  <DialogDescription>{job.title}</DialogDescription>
                                </DialogHeader>
                                <ProposalsView jobId={job.id} jobTitle={job.title} />
                              </DialogContent>
                            </Dialog>
                          )}

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link href={`/client/jobs/${job.id}`}>
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Details
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link href={`/client/jobs/${job.id}/edit`}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit Job
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link href={`/client/jobs/new?duplicate=${job.id}`}>
                                  <Copy className="h-4 w-4 mr-2" />
                                  Duplicate
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {job.status === 'draft' && (
                                <DropdownMenuItem onClick={() => handlePublish(job)}>
                                  <Send className="h-4 w-4 mr-2" />
                                  Publish Job
                                </DropdownMenuItem>
                              )}
                              {job.status === 'open' && (
                                <DropdownMenuItem onClick={() => handleClose(job)}>
                                  <Archive className="h-4 w-4 mr-2" />
                                  Close Job
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem
                                onClick={() => setDeleteConfirmJob(job)}
                                className="text-destructive"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete Job
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteConfirmJob} onOpenChange={() => setDeleteConfirmJob(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Job</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{deleteConfirmJob?.title}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmJob(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
