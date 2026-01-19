'use client';

/**
 * Freelancer Job Dashboard - FreeFlow A+++ Implementation
 * Complete dashboard for freelancers to manage jobs and proposals
 */

import { useState } from 'react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import {
  Briefcase,
  FileText,
  Send,
  Eye,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  TrendingUp,
  Sparkles,
  Search,
  Bell,
  Settings,
  ChevronRight,
  Filter,
  Loader2,
  DollarSign,
  Calendar,
  MessageSquare,
  Star,
  Award,
  Target,
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
  useMyProposals,
  useSavedJobs,
  useJobMatches,
  useJobInvitations,
  useMarketInsights,
  useProfileOptimization,
  ProposalStatus,
} from '@/lib/hooks/use-job-board';
import { JobCard } from './job-card';
import { cn } from '@/lib/utils';

const PROPOSAL_STATUS_CONFIG: Record<ProposalStatus, {
  label: string;
  color: string;
  icon: typeof Clock;
}> = {
  draft: { label: 'Draft', color: 'bg-gray-100 text-gray-800', icon: FileText },
  submitted: { label: 'Submitted', color: 'bg-blue-100 text-blue-800', icon: Send },
  viewed: { label: 'Viewed', color: 'bg-purple-100 text-purple-800', icon: Eye },
  shortlisted: { label: 'Shortlisted', color: 'bg-yellow-100 text-yellow-800', icon: Star },
  interviewing: { label: 'Interviewing', color: 'bg-orange-100 text-orange-800', icon: MessageSquare },
  offer_sent: { label: 'Offer Received', color: 'bg-green-100 text-green-800', icon: Award },
  accepted: { label: 'Accepted', color: 'bg-green-500 text-white', icon: CheckCircle2 },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-800', icon: XCircle },
  withdrawn: { label: 'Withdrawn', color: 'bg-gray-100 text-gray-800', icon: AlertCircle },
};

export function FreelancerDashboard() {
  const [proposalFilter, setProposalFilter] = useState<ProposalStatus | undefined>();

  const { proposals, isLoading: proposalsLoading } = useMyProposals({ status: proposalFilter });
  const { savedJobs, isLoading: savedLoading, saveJob, unsaveJob } = useSavedJobs();
  const { matches, isLoading: matchesLoading } = useJobMatches({ limit: 5 });
  const { invitations, isLoading: invitationsLoading, respondToInvitation } = useJobInvitations();
  const { insights, isLoading: insightsLoading } = useMarketInsights();
  const { optimization } = useProfileOptimization();

  const activeProposals = proposals.filter((p) =>
    ['submitted', 'viewed', 'shortlisted', 'interviewing', 'offer_sent'].includes(p.status)
  );

  const pendingInvitations = invitations.filter((i) => i.status === 'pending');

  // Calculate stats
  const stats = {
    totalProposals: proposals.length,
    activeProposals: activeProposals.length,
    offersReceived: proposals.filter((p) => p.status === 'offer_sent').length,
    jobsWon: proposals.filter((p) => p.status === 'accepted').length,
    pendingInvitations: pendingInvitations.length,
    savedJobs: savedJobs.length,
    matchScore: Math.round(matches.reduce((acc, m) => acc + m.match_score, 0) / (matches.length || 1)),
    profileStrength: optimization?.current_score || 0,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Jobs</h1>
          <p className="text-muted-foreground">Manage proposals, invitations, and saved jobs</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href="/freelancer/profile">
              <Settings className="h-4 w-4 mr-2" />
              Profile Settings
            </Link>
          </Button>
          <Button asChild>
            <Link href="/jobs">
              <Search className="h-4 w-4 mr-2" />
              Find Jobs
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Send className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Proposals</p>
                <p className="text-2xl font-bold">{stats.activeProposals}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <Award className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Offers Received</p>
                <p className="text-2xl font-bold">{stats.offersReceived}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <Bell className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Invitations</p>
                <p className="text-2xl font-bold">{stats.pendingInvitations}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                <Target className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Profile Score</p>
                <p className="text-2xl font-bold">{stats.profileStrength}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Proposals */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="proposals" className="space-y-4">
            <TabsList>
              <TabsTrigger value="proposals" className="gap-2">
                <FileText className="h-4 w-4" />
                My Proposals
                <Badge variant="secondary">{proposals.length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="invitations" className="gap-2">
                <Bell className="h-4 w-4" />
                Invitations
                {pendingInvitations.length > 0 && (
                  <Badge variant="destructive">{pendingInvitations.length}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="saved" className="gap-2">
                <Briefcase className="h-4 w-4" />
                Saved Jobs
                <Badge variant="secondary">{savedJobs.length}</Badge>
              </TabsTrigger>
            </TabsList>

            {/* Proposals Tab */}
            <TabsContent value="proposals" className="space-y-4">
              <div className="flex items-center justify-between">
                <Select
                  value={proposalFilter || 'all'}
                  onValueChange={(value) =>
                    setProposalFilter(value === 'all' ? undefined : value as ProposalStatus)
                  }
                >
                  <SelectTrigger className="w-[180px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Proposals</SelectItem>
                    {Object.entries(PROPOSAL_STATUS_CONFIG).map(([status, config]) => (
                      <SelectItem key={status} value={status}>
                        {config.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {proposalsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : proposals.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                    <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Proposals Yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Start applying to jobs to see your proposals here
                    </p>
                    <Button asChild>
                      <Link href="/jobs">Browse Jobs</Link>
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {proposals.map((proposal) => {
                    const statusConfig = PROPOSAL_STATUS_CONFIG[proposal.status];
                    const StatusIcon = statusConfig.icon;

                    return (
                      <Card key={proposal.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <Link
                                href={`/jobs/${proposal.job_id}`}
                                className="font-semibold hover:text-primary transition-colors line-clamp-1"
                              >
                                {proposal.job?.title || 'Job Title'}
                              </Link>
                              <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <DollarSign className="h-3 w-3" />
                                  ${proposal.proposed_rate}
                                  {proposal.rate_type === 'hourly' ? '/hr' : ' fixed'}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {formatDistanceToNow(new Date(proposal.submitted_at || proposal.created_at), { addSuffix: true })}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <Badge className={cn('gap-1', statusConfig.color)}>
                                <StatusIcon className="h-3 w-3" />
                                {statusConfig.label}
                              </Badge>
                              <Button variant="ghost" size="sm" asChild>
                                <Link href={`/freelancer/proposals/${proposal.id}`}>
                                  View <ChevronRight className="h-4 w-4 ml-1" />
                                </Link>
                              </Button>
                            </div>
                          </div>

                          {/* Match Score */}
                          {proposal.match_score > 0 && (
                            <div className="mt-3 flex items-center gap-2">
                              <Sparkles className="h-4 w-4 text-primary" />
                              <Progress value={proposal.match_score} className="flex-1 h-2" />
                              <span className="text-sm font-medium">{Math.round(proposal.match_score)}% match</span>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            {/* Invitations Tab */}
            <TabsContent value="invitations" className="space-y-4">
              {invitationsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : invitations.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                    <Bell className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Invitations</h3>
                    <p className="text-muted-foreground mb-4">
                      Complete your profile to receive more invitations
                    </p>
                    <Button variant="outline" asChild>
                      <Link href="/freelancer/profile">Complete Profile</Link>
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {invitations.map((invitation) => (
                    <Card key={invitation.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <Link
                              href={`/jobs/${invitation.job.id}`}
                              className="font-semibold hover:text-primary transition-colors line-clamp-1"
                            >
                              {invitation.job.title}
                            </Link>
                            {invitation.message && (
                              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                "{invitation.message}"
                              </p>
                            )}
                            <p className="text-xs text-muted-foreground mt-2">
                              Invited {formatDistanceToNow(new Date(invitation.created_at), { addSuffix: true })}
                              {invitation.expires_at && (
                                <span className="text-orange-600">
                                  {' '}• Expires {formatDistanceToNow(new Date(invitation.expires_at), { addSuffix: true })}
                                </span>
                              )}
                            </p>
                          </div>

                          {invitation.status === 'pending' ? (
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => respondToInvitation(invitation.id, false)}
                              >
                                Decline
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => respondToInvitation(invitation.id, true)}
                              >
                                Accept & Apply
                              </Button>
                            </div>
                          ) : (
                            <Badge variant="secondary" className="capitalize">
                              {invitation.status}
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Saved Jobs Tab */}
            <TabsContent value="saved" className="space-y-4">
              {savedLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : savedJobs.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                    <Briefcase className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Saved Jobs</h3>
                    <p className="text-muted-foreground mb-4">
                      Save jobs you're interested in to review later
                    </p>
                    <Button asChild>
                      <Link href="/jobs">Browse Jobs</Link>
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {savedJobs.map((saved) =>
                    saved.job ? (
                      <JobCard
                        key={saved.id}
                        job={saved.job}
                        viewMode="list"
                        isSaved
                        onUnsave={unsaveJob}
                      />
                    ) : null
                  )}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Best Matches Preview */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Best Matches
              </CardTitle>
              <CardDescription>Jobs matched to your skills</CardDescription>
            </CardHeader>
            <CardContent>
              {matchesLoading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : matches.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Complete your profile to get matches
                </p>
              ) : (
                <div className="space-y-3">
                  {matches.slice(0, 3).map((match) =>
                    match.job ? (
                      <Link
                        key={match.job_id}
                        href={`/jobs/${match.job_id}`}
                        className="block p-2 rounded-lg hover:bg-muted transition-colors"
                      >
                        <p className="font-medium text-sm line-clamp-1">
                          {match.job.title}
                        </p>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs text-muted-foreground">
                            ${match.job.budget_max?.toLocaleString() || 'Negotiable'}
                          </span>
                          <Badge variant="secondary" className="text-xs">
                            {Math.round(match.match_score)}% match
                          </Badge>
                        </div>
                      </Link>
                    ) : null
                  )}
                </div>
              )}
              <Button variant="link" className="w-full mt-2" asChild>
                <Link href="/freelancer/matches">
                  View All Matches <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Profile Strength */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Target className="h-5 w-5 text-orange-500" />
                Profile Strength
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-2 mb-3">
                <span className="text-3xl font-bold">{stats.profileStrength}%</span>
                {optimization?.potential_score && optimization.potential_score > stats.profileStrength && (
                  <span className="text-sm text-green-600 mb-1">
                    → {optimization.potential_score}%
                  </span>
                )}
              </div>
              <Progress value={stats.profileStrength} className="h-2 mb-3" />

              {optimization?.improvements && optimization.improvements.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Quick improvements:</p>
                  {optimization.improvements.slice(0, 2).map((imp, i) => (
                    <div key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                      <TrendingUp className="h-3 w-3 text-green-500 mt-0.5" />
                      {imp.suggestion}
                    </div>
                  ))}
                </div>
              )}

              <Button variant="outline" className="w-full mt-3" asChild>
                <Link href="/freelancer/profile">Improve Profile</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Market Insights */}
          {insights && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-500" />
                  Market Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-medium mb-1">Your Stats</p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="bg-muted rounded p-2">
                      <p className="text-muted-foreground text-xs">Win Rate</p>
                      <p className="font-medium">
                        {Math.round((insights.your_performance?.win_rate || 0) * 100)}%
                      </p>
                    </div>
                    <div className="bg-muted rounded p-2">
                      <p className="text-muted-foreground text-xs">Jobs Won</p>
                      <p className="font-medium">{insights.your_performance?.jobs_won || 0}</p>
                    </div>
                  </div>
                </div>

                {insights.market_trends?.hot_skills && (
                  <div>
                    <p className="text-sm font-medium mb-1">Trending Skills</p>
                    <div className="flex flex-wrap gap-1">
                      {insights.market_trends.hot_skills.slice(0, 5).map((skill) => (
                        <Badge key={skill} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
