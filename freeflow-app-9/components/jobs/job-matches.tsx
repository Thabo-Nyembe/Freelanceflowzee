'use client';

/**
 * Job Matches - FreeFlow A+++ Implementation
 * AI-powered job matching dashboard (Upwork Best Matches style)
 */

import { useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  RefreshCw,
  Settings2,
  TrendingUp,
  Target,
  Loader2,
  AlertCircle,
  ChevronRight,
  Zap,
  Award,
  BookOpen,
  BarChart3,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  useJobMatches,
  useMarketInsights,
  useProfileOptimization,
  useSavedJobs,
} from '@/lib/hooks/use-job-board';
import { JobCard } from './job-card';
import { toast } from 'sonner';

interface JobMatchesProps {
  limit?: number;
  showInsights?: boolean;
}

export function JobMatches({ limit = 10, showInsights = true }: JobMatchesProps) {
  const [minScore, setMinScore] = useState(50);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [matchPreferences, setMatchPreferences] = useState({
    prioritizeSkills: true,
    prioritizeRate: false,
    includeNewSkills: true,
  });

  const { matches, isLoading, error, refresh, refreshMatches } = useJobMatches({ limit, minScore });
  const { insights, isLoading: insightsLoading } = useMarketInsights();
  const { optimization, isLoading: optimizationLoading } = useProfileOptimization();
  const { savedJobs, saveJob, unsaveJob } = useSavedJobs();

  const savedJobIds = new Set(savedJobs.map((s) => s.job?.id).filter(Boolean));

  const handleRefreshMatches = async () => {
    setIsRefreshing(true);
    try {
      await refreshMatches();
      toast.success('Matches refreshed');
    } catch {
      toast.error('Failed to refresh matches');
    } finally {
      setIsRefreshing(false);
    }
  };

  if (isLoading && !matches.length) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Finding your best matches...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h3 className="text-lg font-semibold mb-2">Error Loading Matches</h3>
        <p className="text-muted-foreground mb-4">{error}</p>
        <Button onClick={() => refresh()}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            Best Matches
          </h2>
          <p className="text-muted-foreground">
            Jobs personalized to your skills and preferences
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Settings2 className="h-4 w-4 mr-2" />
                Preferences
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Match Preferences</DialogTitle>
                <DialogDescription>
                  Customize how we find jobs for you
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 py-4">
                <div className="space-y-3">
                  <Label>Minimum Match Score: {minScore}%</Label>
                  <Slider
                    value={[minScore]}
                    onValueChange={([value]) => setMinScore(value)}
                    min={20}
                    max={90}
                    step={5}
                  />
                  <p className="text-xs text-muted-foreground">
                    Higher scores mean better matches but fewer results
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Prioritize Skill Match</Label>
                    <p className="text-xs text-muted-foreground">
                      Show jobs that best match your skills
                    </p>
                  </div>
                  <Switch
                    checked={matchPreferences.prioritizeSkills}
                    onCheckedChange={(checked) =>
                      setMatchPreferences((prev) => ({ ...prev, prioritizeSkills: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Prioritize Rate Match</Label>
                    <p className="text-xs text-muted-foreground">
                      Show jobs matching your rate preferences
                    </p>
                  </div>
                  <Switch
                    checked={matchPreferences.prioritizeRate}
                    onCheckedChange={(checked) =>
                      setMatchPreferences((prev) => ({ ...prev, prioritizeRate: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Include Career Growth Jobs</Label>
                    <p className="text-xs text-muted-foreground">
                      Show jobs that can help you learn new skills
                    </p>
                  </div>
                  <Switch
                    checked={matchPreferences.includeNewSkills}
                    onCheckedChange={(checked) =>
                      setMatchPreferences((prev) => ({ ...prev, includeNewSkills: checked }))
                    }
                  />
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Button
            variant="outline"
            size="sm"
            onClick={handleRefreshMatches}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Insights Cards */}
      {showInsights && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Profile Score */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Target className="h-4 w-4 text-primary" />
                Profile Strength
              </CardTitle>
            </CardHeader>
            <CardContent>
              {optimizationLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <div>
                  <div className="flex items-end gap-2 mb-2">
                    <span className="text-3xl font-bold">
                      {optimization?.current_score || 0}%
                    </span>
                    {optimization?.potential_score && optimization.potential_score > (optimization?.current_score || 0) && (
                      <span className="text-sm text-green-600">
                        → {optimization.potential_score}% potential
                      </span>
                    )}
                  </div>
                  <Progress value={optimization?.current_score || 0} className="h-2 mb-2" />
                  <Button variant="link" size="sm" className="p-0 h-auto" asChild>
                    <Link href="/freelancer/profile">
                      Improve Profile <ChevronRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Performance */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-blue-500" />
                Your Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              {insightsLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Win Rate</span>
                    <span className="font-medium">
                      {insights?.your_performance?.win_rate
                        ? `${Math.round(insights.your_performance.win_rate * 100)}%`
                        : 'N/A'
                      }
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Proposals Sent</span>
                    <span className="font-medium">
                      {insights?.your_performance?.proposals_sent || 0}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Jobs Won</span>
                    <span className="font-medium text-green-600">
                      {insights?.your_performance?.jobs_won || 0}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Hot Skills */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-orange-500" />
                Trending Skills
              </CardTitle>
            </CardHeader>
            <CardContent>
              {insightsLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <div className="flex flex-wrap gap-1">
                  {insights?.market_trends?.hot_skills?.slice(0, 6).map((skill) => (
                    <Badge key={skill} variant="secondary" className="text-xs">
                      {skill}
                    </Badge>
                  )) || <span className="text-sm text-muted-foreground">No data</span>}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Profile Improvement Suggestions */}
      {optimization?.improvements && optimization.improvements.length > 0 && (
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-blue-200 dark:border-blue-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Zap className="h-4 w-4 text-blue-600" />
              Quick Wins to Improve Your Matches
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="w-full">
              <div className="flex gap-3">
                {optimization.improvements.slice(0, 4).map((improvement, i) => (
                  <div
                    key={i}
                    className="flex-shrink-0 w-64 bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="outline" className="text-xs capitalize">
                        {improvement.category}
                      </Badge>
                      <Badge
                        variant="secondary"
                        className={`text-xs ${
                          improvement.effort === 'low' ? 'bg-green-100 text-green-800' :
                          improvement.effort === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}
                      >
                        {improvement.effort} effort
                      </Badge>
                    </div>
                    <p className="text-sm font-medium mb-1">{improvement.suggestion}</p>
                    <p className="text-xs text-muted-foreground">{improvement.impact}</p>
                  </div>
                ))}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Matches Tabs */}
      <Tabs defaultValue="best" className="space-y-4">
        <TabsList>
          <TabsTrigger value="best" className="gap-2">
            <Sparkles className="h-4 w-4" />
            Best Matches
            <Badge variant="secondary" className="ml-1">
              {matches.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="saved" className="gap-2">
            <Award className="h-4 w-4" />
            Saved Jobs
            <Badge variant="secondary" className="ml-1">
              {savedJobs.length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="best" className="space-y-4">
          {matches.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <Sparkles className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Matches Found</h3>
                <p className="text-muted-foreground mb-4 max-w-md">
                  Complete your profile and add more skills to get personalized job matches.
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" asChild>
                    <Link href="/freelancer/profile">Complete Profile</Link>
                  </Button>
                  <Button asChild>
                    <Link href="/jobs">Browse All Jobs</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {matches.map((match) =>
                match.job ? (
                  <JobCard
                    key={match.job_id}
                    job={match.job}
                    match={match}
                    viewMode="list"
                    showMatchScore
                    isSaved={savedJobIds.has(match.job_id)}
                    onSave={saveJob}
                    onUnsave={unsaveJob}
                  />
                ) : null
              )}

              {matches.length >= limit && (
                <div className="flex justify-center pt-4">
                  <Button variant="outline" asChild>
                    <Link href="/jobs">
                      View All Jobs <ChevronRight className="h-4 w-4 ml-2" />
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="saved" className="space-y-4">
          {savedJobs.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Saved Jobs</h3>
                <p className="text-muted-foreground mb-4">
                  Save interesting jobs to review and apply later.
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
  );
}
