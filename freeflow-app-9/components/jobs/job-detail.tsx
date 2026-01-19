'use client';

/**
 * Job Detail - FreeFlow A+++ Implementation
 * Full job detail page with apply functionality
 */

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow, format } from 'date-fns';
import {
  ArrowLeft,
  Bookmark,
  BookmarkCheck,
  Share2,
  Flag,
  MapPin,
  Clock,
  DollarSign,
  Calendar,
  Globe,
  Building2,
  CheckCircle2,
  Star,
  Users,
  Eye,
  MessageSquare,
  Loader2,
  AlertCircle,
  Sparkles,
  TrendingUp,
  FileText,
  Send,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  useJob,
  useJobMatchDetails,
  useSavedJobs,
  FreelancerJob,
} from '@/lib/hooks/use-job-board';
import { ProposalForm } from './proposal-form';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface JobDetailProps {
  jobId: string;
}

const EXPERIENCE_LEVELS = {
  entry: { label: 'Entry Level', description: 'Looking for someone new to the field' },
  intermediate: { label: 'Intermediate', description: 'Looking for someone with solid experience' },
  expert: { label: 'Expert', description: 'Looking for a specialist with extensive experience' },
};

export function JobDetail({ jobId }: JobDetailProps) {
  const router = useRouter();
  const { job, isLoading, error } = useJob(jobId);
  const { matchDetails } = useJobMatchDetails(jobId);
  const { savedJobs, saveJob, unsaveJob } = useSavedJobs();
  const [isApplyOpen, setIsApplyOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const isSaved = savedJobs.some((s) => s.job?.id === jobId);

  const handleSaveToggle = async () => {
    if (saving) return;
    setSaving(true);
    try {
      if (isSaved) {
        await unsaveJob(jobId);
        toast.success('Job removed from saved');
      } else {
        await saveJob(jobId);
        toast.success('Job saved');
      }
    } catch {
      toast.error('Failed to save job');
    } finally {
      setSaving(false);
    }
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: job?.title,
        text: `Check out this job: ${job?.title}`,
        url: window.location.href,
      });
    } catch {
      await navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard');
    }
  };

  const handleProposalSuccess = () => {
    setIsApplyOpen(false);
    toast.success('Proposal submitted successfully!');
    router.push('/freelancer/proposals');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h3 className="text-lg font-semibold mb-2">Job Not Found</h3>
        <p className="text-muted-foreground mb-4">{error || 'This job may have been removed or is no longer available'}</p>
        <Button onClick={() => router.push('/jobs')}>Browse Jobs</Button>
      </div>
    );
  }

  const experienceInfo = EXPERIENCE_LEVELS[job.experience_level];
  const postedTime = job.posted_at
    ? formatDistanceToNow(new Date(job.posted_at), { addSuffix: true })
    : 'Draft';

  const formatBudget = () => {
    if (job.budget_type === 'hourly') {
      if (job.budget_min && job.budget_max) {
        return `$${job.budget_min} - $${job.budget_max}/hr`;
      }
      return job.budget_max ? `Up to $${job.budget_max}/hr` : 'Hourly rate';
    }
    if (job.budget_type === 'fixed') {
      if (job.budget_min && job.budget_max) {
        return `$${job.budget_min.toLocaleString()} - $${job.budget_max.toLocaleString()}`;
      }
      return job.budget_max ? `$${job.budget_max.toLocaleString()}` : 'Fixed price';
    }
    return 'Budget negotiable';
  };

  return (
    <div className="space-y-6">
      {/* Back Navigation */}
      <Button variant="ghost" onClick={() => router.back()} className="gap-2">
        <ArrowLeft className="h-4 w-4" />
        Back to Jobs
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Job Header */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm text-muted-foreground">Posted {postedTime}</span>
                    {job.is_featured && <Badge className="bg-yellow-500">Featured</Badge>}
                    {job.status !== 'open' && (
                      <Badge variant="secondary">{job.status}</Badge>
                    )}
                  </div>
                  <CardTitle className="text-2xl mb-2">{job.title}</CardTitle>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    <span className="capitalize">{job.job_type.replace('_', ' ')}</span>
                    <span>•</span>
                    <span>{experienceInfo.label}</span>
                    <span>•</span>
                    <span>{job.budget_type === 'hourly' ? 'Hourly' : 'Fixed price'}</span>
                    {job.duration && (
                      <>
                        <span>•</span>
                        <span>{job.duration}</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon" onClick={handleSaveToggle} disabled={saving}>
                    {isSaved ? (
                      <BookmarkCheck className="h-5 w-5 text-primary" />
                    ) : (
                      <Bookmark className="h-5 w-5" />
                    )}
                  </Button>
                  <Button variant="outline" size="icon" onClick={handleShare}>
                    <Share2 className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Budget & Details */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-muted/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <DollarSign className="h-4 w-4" />
                    Budget
                  </div>
                  <p className="font-semibold">{formatBudget()}</p>
                </div>

                <div className="bg-muted/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <Clock className="h-4 w-4" />
                    Duration
                  </div>
                  <p className="font-semibold">{job.duration || 'Not specified'}</p>
                </div>

                <div className="bg-muted/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <Globe className="h-4 w-4" />
                    Location
                  </div>
                  <p className="font-semibold capitalize">{job.location_type}</p>
                </div>

                <div className="bg-muted/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <Users className="h-4 w-4" />
                    Proposals
                  </div>
                  <p className="font-semibold">{job.proposals_count}</p>
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="font-semibold mb-3">Job Description</h3>
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  {job.description.split('\n').map((paragraph, i) => (
                    <p key={i}>{paragraph}</p>
                  ))}
                </div>
              </div>

              {/* Skills */}
              <div>
                <h3 className="font-semibold mb-3">Required Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {job.required_skills.map((skill) => (
                    <Badge key={skill} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>

              {job.preferred_skills.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3">Preferred Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {job.preferred_skills.map((skill) => (
                      <Badge key={skill} variant="outline">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Questions */}
              {job.questions.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3">Screening Questions</h3>
                  <ul className="space-y-2">
                    {job.questions.map((q, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-muted-foreground">{i + 1}.</span>
                        <span>{q.question}</span>
                        {q.required && (
                          <Badge variant="outline" className="text-xs">
                            Required
                          </Badge>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Attachments */}
              {job.attachments.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3">Attachments</h3>
                  <div className="flex flex-wrap gap-2">
                    {job.attachments.map((attachment, i) => (
                      <Button key={i} variant="outline" size="sm" asChild>
                        <Link href={attachment} target="_blank">
                          <FileText className="h-4 w-4 mr-2" />
                          Attachment {i + 1}
                        </Link>
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Stats */}
              <div className="flex items-center gap-6 pt-4 border-t text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  <span>{job.views_count} views</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>{job.proposals_count} proposals</span>
                </div>
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  <span>~{Math.ceil(job.proposals_count * 0.3)} interviewing</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Client Info Card */}
          {job.client && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">About the Client</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback>
                      {job.client.company_name?.[0] || 'C'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{job.client.company_name || 'Client'}</p>
                    {job.client.payment_verified && (
                      <div className="flex items-center gap-1 text-sm text-green-600">
                        <CheckCircle2 className="h-4 w-4" />
                        Payment Verified
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Rating</p>
                    <div className="flex items-center gap-1 font-medium">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      {job.client.rating?.toFixed(1) || 'New'}
                    </div>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Jobs Posted</p>
                    <p className="font-medium">{job.client.jobs_posted || 0}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Total Spent</p>
                    <p className="font-medium">
                      ${((job.client.total_spent || 0) / 1000).toFixed(0)}k+
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Hire Rate</p>
                    <p className="font-medium">
                      {Math.round((job.client.rehire_rate || 0) * 100)}%
                    </p>
                  </div>
                </div>

                {job.client.country && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    {job.client.city && `${job.client.city}, `}{job.client.country}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Apply Card */}
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle className="text-lg">Apply for this Job</CardTitle>
              {job.status === 'open' && (
                <CardDescription>
                  Submit a proposal to show your interest
                </CardDescription>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              {job.status === 'open' ? (
                <>
                  <Dialog open={isApplyOpen} onOpenChange={setIsApplyOpen}>
                    <DialogTrigger asChild>
                      <Button className="w-full gap-2" size="lg">
                        <Send className="h-4 w-4" />
                        Submit a Proposal
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Submit Proposal</DialogTitle>
                        <DialogDescription>
                          Applying to: {job.title}
                        </DialogDescription>
                      </DialogHeader>
                      <ProposalForm job={job} onSuccess={handleProposalSuccess} />
                    </DialogContent>
                  </Dialog>

                  <Button variant="outline" className="w-full gap-2" onClick={handleSaveToggle}>
                    {isSaved ? (
                      <>
                        <BookmarkCheck className="h-4 w-4" />
                        Saved
                      </>
                    ) : (
                      <>
                        <Bookmark className="h-4 w-4" />
                        Save Job
                      </>
                    )}
                  </Button>
                </>
              ) : (
                <div className="text-center py-4">
                  <Badge variant="secondary" className="mb-2">
                    {job.status}
                  </Badge>
                  <p className="text-sm text-muted-foreground">
                    This job is no longer accepting proposals
                  </p>
                </div>
              )}

              <Separator />

              <div className="text-sm text-muted-foreground">
                <p className="flex items-center justify-between mb-2">
                  <span>Required Connects</span>
                  <span className="font-medium text-foreground">4 Connects</span>
                </p>
                <p className="flex items-center justify-between">
                  <span>Available Connects</span>
                  <span className="font-medium text-foreground">50 Available</span>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Match Score Card */}
          {matchDetails?.match && (
            <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">Your Match Score</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <p className="text-4xl font-bold text-primary mb-1">
                    {Math.round(matchDetails.match.match_score)}%
                  </p>
                  <p className="text-sm text-muted-foreground">Match Score</p>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Skill Match</span>
                      <span>{Math.round((matchDetails.match.skill_match_score || 0) * 100)}%</span>
                    </div>
                    <Progress value={(matchDetails.match.skill_match_score || 0) * 100} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Experience</span>
                      <span>{Math.round((matchDetails.match.experience_match_score || 0) * 100)}%</span>
                    </div>
                    <Progress value={(matchDetails.match.experience_match_score || 0) * 100} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Similarity</span>
                      <span>{Math.round((matchDetails.match.similarity_score || 0) * 100)}%</span>
                    </div>
                    <Progress value={(matchDetails.match.similarity_score || 0) * 100} className="h-2" />
                  </div>
                </div>

                {matchDetails.match.match_reasons.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">Why you're a match:</p>
                    <ul className="text-sm space-y-1">
                      {matchDetails.match.match_reasons.slice(0, 3).map((reason, i) => (
                        <li key={i} className="flex items-start gap-2 text-green-600">
                          <CheckCircle2 className="h-4 w-4 flex-shrink-0 mt-0.5" />
                          {reason}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {matchDetails.match.recommended_rate_optimal > 0 && (
                  <div className="bg-background rounded-lg p-3">
                    <p className="text-sm font-medium mb-1">Recommended Bid</p>
                    <p className="text-2xl font-bold">
                      ${matchDetails.match.recommended_rate_optimal}
                      <span className="text-sm font-normal text-muted-foreground">
                        {job.budget_type === 'hourly' ? '/hr' : ' fixed'}
                      </span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Range: ${matchDetails.match.recommended_rate_min} - ${matchDetails.match.recommended_rate_max}
                    </p>
                  </div>
                )}

                {matchDetails.proposal_tips && matchDetails.proposal_tips.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">Proposal Tips:</p>
                    <ul className="text-xs space-y-1">
                      {matchDetails.proposal_tips.slice(0, 3).map((tip, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <TrendingUp className="h-3 w-3 flex-shrink-0 mt-0.5 text-blue-500" />
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Report Job */}
          <div className="flex justify-center">
            <Button variant="ghost" size="sm" className="text-muted-foreground">
              <Flag className="h-4 w-4 mr-2" />
              Report this job
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
