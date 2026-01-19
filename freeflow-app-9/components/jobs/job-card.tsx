'use client';

/**
 * Job Card - FreeFlow A+++ Implementation
 * Display card for job listings (Upwork-style)
 */

import { useState } from 'react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import {
  Bookmark,
  BookmarkCheck,
  MapPin,
  Clock,
  DollarSign,
  Users,
  Star,
  Eye,
  CheckCircle2,
  Sparkles,
  Building2,
  Globe,
  Briefcase,
} from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Progress } from '@/components/ui/progress';
import { FreelancerJob, JobMatch } from '@/lib/hooks/use-job-board';
import { cn } from '@/lib/utils';

interface JobCardProps {
  job: FreelancerJob;
  match?: JobMatch;
  viewMode?: 'grid' | 'list' | 'compact';
  showMatchScore?: boolean;
  isSaved?: boolean;
  onSave?: (jobId: string) => void;
  onUnsave?: (jobId: string) => void;
}

const EXPERIENCE_LEVELS = {
  entry: { label: 'Entry Level', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
  intermediate: { label: 'Intermediate', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
  expert: { label: 'Expert', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' },
};

const JOB_TYPES = {
  one_time: { label: 'One-time', icon: Briefcase },
  ongoing: { label: 'Ongoing', icon: Clock },
  full_time: { label: 'Full-time', icon: Building2 },
  part_time: { label: 'Part-time', icon: Clock },
};

const LOCATION_TYPES = {
  remote: { label: 'Remote', icon: Globe, color: 'text-green-600' },
  onsite: { label: 'On-site', icon: MapPin, color: 'text-orange-600' },
  hybrid: { label: 'Hybrid', icon: MapPin, color: 'text-blue-600' },
};

export function JobCard({
  job,
  match,
  viewMode = 'list',
  showMatchScore = false,
  isSaved = false,
  onSave,
  onUnsave,
}: JobCardProps) {
  const [saving, setSaving] = useState(false);

  const experienceInfo = EXPERIENCE_LEVELS[job.experience_level];
  const jobTypeInfo = JOB_TYPES[job.job_type];
  const locationInfo = LOCATION_TYPES[job.location_type];
  const LocationIcon = locationInfo.icon;
  const JobTypeIcon = jobTypeInfo.icon;

  const handleSaveToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (saving) return;

    setSaving(true);
    try {
      if (isSaved) {
        await onUnsave?.(job.id);
      } else {
        await onSave?.(job.id);
      }
    } catch {
      // Handle error silently or show toast
    } finally {
      setSaving(false);
    }
  };

  const formatBudget = () => {
    if (job.budget_type === 'hourly') {
      if (job.budget_min && job.budget_max) {
        return `$${job.budget_min} - $${job.budget_max}/hr`;
      }
      return job.budget_max ? `Up to $${job.budget_max}/hr` : 'Hourly';
    }
    if (job.budget_type === 'fixed') {
      if (job.budget_min && job.budget_max) {
        return `$${job.budget_min.toLocaleString()} - $${job.budget_max.toLocaleString()}`;
      }
      return job.budget_max ? `$${job.budget_max.toLocaleString()}` : 'Fixed Price';
    }
    return 'Negotiable';
  };

  const postedTime = job.posted_at
    ? formatDistanceToNow(new Date(job.posted_at), { addSuffix: true })
    : 'Draft';

  // Compact view for matches
  if (viewMode === 'compact') {
    return (
      <Card className="hover:shadow-md transition-shadow">
        <Link href={`/jobs/${job.id}`}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold line-clamp-1 hover:text-primary transition-colors">
                  {job.title}
                </h3>
                <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                  <span>{formatBudget()}</span>
                  <span>•</span>
                  <span>{experienceInfo.label}</span>
                </div>
              </div>
              {showMatchScore && match && (
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-yellow-500" />
                  <span className="font-bold text-lg">{Math.round(match.match_score)}%</span>
                </div>
              )}
            </div>
          </CardContent>
        </Link>
      </Card>
    );
  }

  // List view (default)
  if (viewMode === 'list') {
    return (
      <Card className="hover:shadow-md transition-shadow group">
        <Link href={`/jobs/${job.id}`}>
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <span>Posted {postedTime}</span>
                  {job.is_featured && (
                    <Badge className="bg-yellow-500">Featured</Badge>
                  )}
                </div>
                <h3 className="text-lg font-semibold line-clamp-2 group-hover:text-primary transition-colors">
                  {job.title}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                {showMatchScore && match && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex flex-col items-center bg-primary/10 rounded-lg p-2">
                          <Sparkles className="h-4 w-4 text-primary mb-1" />
                          <span className="font-bold text-lg">{Math.round(match.match_score)}%</span>
                          <span className="text-xs text-muted-foreground">Match</span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="left" className="max-w-xs">
                        <div className="space-y-2 text-sm">
                          <p className="font-medium">Match Breakdown:</p>
                          <div className="space-y-1">
                            <div className="flex justify-between">
                              <span>Skill Match:</span>
                              <span>{Math.round((match.skill_match_score || 0) * 100)}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Experience:</span>
                              <span>{Math.round((match.experience_match_score || 0) * 100)}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Similarity:</span>
                              <span>{Math.round((match.similarity_score || 0) * 100)}%</span>
                            </div>
                          </div>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}

                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={handleSaveToggle}
                  disabled={saving}
                >
                  {isSaved ? (
                    <BookmarkCheck className="h-5 w-5 text-primary" />
                  ) : (
                    <Bookmark className="h-5 w-5" />
                  )}
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pb-2">
            {/* Job Meta */}
            <div className="flex flex-wrap items-center gap-3 text-sm mb-3">
              <div className="flex items-center gap-1">
                <DollarSign className="h-4 w-4 text-green-600" />
                <span className="font-medium">{formatBudget()}</span>
              </div>

              <Badge variant="secondary" className={experienceInfo.color}>
                {experienceInfo.label}
              </Badge>

              <div className="flex items-center gap-1">
                <JobTypeIcon className="h-4 w-4 text-muted-foreground" />
                <span>{jobTypeInfo.label}</span>
              </div>

              <div className={cn('flex items-center gap-1', locationInfo.color)}>
                <LocationIcon className="h-4 w-4" />
                <span>{locationInfo.label}</span>
                {job.location_country && <span>• {job.location_country}</span>}
              </div>

              {job.estimated_hours && (
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>Est. {job.estimated_hours} hrs</span>
                </div>
              )}
            </div>

            {/* Description */}
            <p className="text-muted-foreground line-clamp-2 mb-3">
              {job.description}
            </p>

            {/* Skills */}
            <div className="flex flex-wrap gap-2 mb-3">
              {job.required_skills.slice(0, 6).map((skill) => (
                <Badge key={skill} variant="outline" className="text-xs">
                  {skill}
                </Badge>
              ))}
              {job.required_skills.length > 6 && (
                <Badge variant="outline" className="text-xs text-muted-foreground">
                  +{job.required_skills.length - 6} more
                </Badge>
              )}
            </div>

            {/* Match Reasons */}
            {showMatchScore && match?.match_reasons && match.match_reasons.length > 0 && (
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 mb-3">
                <p className="text-sm font-medium text-green-800 dark:text-green-200 mb-1">
                  Why this is a great match:
                </p>
                <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
                  {match.match_reasons.slice(0, 2).map((reason, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 flex-shrink-0 mt-0.5" />
                      <span>{reason}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>

          <CardFooter className="pt-2 border-t">
            <div className="flex items-center justify-between w-full text-sm text-muted-foreground">
              {/* Client Info */}
              <div className="flex items-center gap-4">
                {job.client?.payment_verified && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger className="flex items-center gap-1 text-green-600">
                        <CheckCircle2 className="h-4 w-4" />
                        <span>Payment Verified</span>
                      </TooltipTrigger>
                      <TooltipContent>Client has verified payment method</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}

                {job.client?.rating && job.client.rating > 0 && (
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span>{job.client.rating.toFixed(1)}</span>
                  </div>
                )}

                {job.client?.total_spent && job.client.total_spent > 0 && (
                  <span>${(job.client.total_spent / 1000).toFixed(0)}k+ spent</span>
                )}
              </div>

              {/* Stats */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>{job.proposals_count} proposals</span>
                </div>
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  <span>{job.views_count} views</span>
                </div>
              </div>
            </div>
          </CardFooter>
        </Link>
      </Card>
    );
  }

  // Grid view
  return (
    <Card className="hover:shadow-md transition-shadow h-full flex flex-col group">
      <Link href={`/jobs/${job.id}`} className="flex flex-col h-full">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                {job.is_featured && (
                  <Badge className="bg-yellow-500 text-xs">Featured</Badge>
                )}
                <Badge variant="secondary" className={cn(experienceInfo.color, 'text-xs')}>
                  {experienceInfo.label}
                </Badge>
              </div>
              <h3 className="font-semibold line-clamp-2 group-hover:text-primary transition-colors">
                {job.title}
              </h3>
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 flex-shrink-0"
              onClick={handleSaveToggle}
              disabled={saving}
            >
              {isSaved ? (
                <BookmarkCheck className="h-5 w-5 text-primary" />
              ) : (
                <Bookmark className="h-5 w-5" />
              )}
            </Button>
          </div>
        </CardHeader>

        <CardContent className="flex-1 pb-2">
          <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
            {job.description}
          </p>

          <div className="flex flex-wrap gap-1.5 mb-3">
            {job.required_skills.slice(0, 4).map((skill) => (
              <Badge key={skill} variant="outline" className="text-xs">
                {skill}
              </Badge>
            ))}
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-600" />
              <span className="font-medium">{formatBudget()}</span>
            </div>

            <div className={cn('flex items-center gap-2', locationInfo.color)}>
              <LocationIcon className="h-4 w-4" />
              <span>{locationInfo.label}</span>
            </div>
          </div>

          {/* Match Score */}
          {showMatchScore && match && (
            <div className="mt-3 p-2 bg-primary/5 rounded-lg">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium">Match Score</span>
                <span className="font-bold">{Math.round(match.match_score)}%</span>
              </div>
              <Progress value={match.match_score} className="h-2" />
            </div>
          )}
        </CardContent>

        <CardFooter className="pt-2 border-t mt-auto">
          <div className="flex items-center justify-between w-full text-xs text-muted-foreground">
            <span>{postedTime}</span>
            <div className="flex items-center gap-2">
              <span>{job.proposals_count} proposals</span>
            </div>
          </div>
        </CardFooter>
      </Link>
    </Card>
  );
}
