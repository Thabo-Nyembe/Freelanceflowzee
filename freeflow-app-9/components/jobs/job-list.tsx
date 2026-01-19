'use client';

/**
 * Job List - FreeFlow A+++ Implementation
 * Browse and search jobs (Upwork-style)
 */

import { useState, useMemo } from 'react';
import {
  Search,
  SlidersHorizontal,
  Grid3X3,
  List,
  Loader2,
  AlertCircle,
  X,
  ChevronDown,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from '@/components/ui/sheet';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { useJobs, JobFilters, useSavedJobs } from '@/lib/hooks/use-job-board';
import { JobCard } from './job-card';
import { cn } from '@/lib/utils';

interface JobListProps {
  initialFilters?: JobFilters;
  showFilters?: boolean;
  title?: string;
  description?: string;
}

const EXPERIENCE_LEVELS = [
  { value: 'entry', label: 'Entry Level' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'expert', label: 'Expert' },
];

const JOB_TYPES = [
  { value: 'one_time', label: 'One-time Project' },
  { value: 'ongoing', label: 'Ongoing Project' },
  { value: 'full_time', label: 'Full-time' },
  { value: 'part_time', label: 'Part-time' },
];

const LOCATION_TYPES = [
  { value: 'remote', label: 'Remote' },
  { value: 'onsite', label: 'On-site' },
  { value: 'hybrid', label: 'Hybrid' },
];

const POSTED_WITHIN = [
  { value: '24', label: 'Last 24 hours' },
  { value: '72', label: 'Last 3 days' },
  { value: '168', label: 'Last 7 days' },
  { value: '720', label: 'Last 30 days' },
];

const POPULAR_SKILLS = [
  'JavaScript', 'TypeScript', 'React', 'Node.js', 'Python',
  'UI/UX Design', 'Graphic Design', 'WordPress', 'SEO',
  'Content Writing', 'Video Editing', 'Data Analysis', 'Marketing',
];

export function JobList({
  initialFilters,
  showFilters = true,
  title = 'Find Jobs',
  description = 'Browse thousands of opportunities matching your skills',
}: JobListProps) {
  const [filters, setFilters] = useState<JobFilters>(initialFilters || {});
  const [searchQuery, setSearchQuery] = useState(initialFilters?.search || '');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [budgetRange, setBudgetRange] = useState<[number, number]>([0, 10000]);
  const [selectedSkills, setSelectedSkills] = useState<string[]>(initialFilters?.skills || []);

  const { jobs, isLoading, error, pagination, refresh, loadMore } = useJobs(filters);
  const { savedJobs, saveJob, unsaveJob } = useSavedJobs();

  const savedJobIds = useMemo(
    () => new Set(savedJobs.map((s) => s.job?.id).filter(Boolean)),
    [savedJobs]
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters((prev) => ({ ...prev, search: searchQuery }));
  };

  const handleApplyFilters = () => {
    setFilters((prev) => ({
      ...prev,
      budget_min: budgetRange[0] > 0 ? budgetRange[0] : undefined,
      budget_max: budgetRange[1] < 10000 ? budgetRange[1] : undefined,
      skills: selectedSkills.length > 0 ? selectedSkills : undefined,
    }));
    setIsFilterOpen(false);
  };

  const handleClearFilters = () => {
    setFilters({});
    setSearchQuery('');
    setBudgetRange([0, 10000]);
    setSelectedSkills([]);
  };

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.search) count++;
    if (filters.category) count++;
    if (filters.experience_level) count++;
    if (filters.job_type) count++;
    if (filters.location_type) count++;
    if (filters.budget_min || filters.budget_max) count++;
    if (filters.skills?.length) count++;
    if (filters.posted_within) count++;
    return count;
  }, [filters]);

  const toggleSkill = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill)
        ? prev.filter((s) => s !== skill)
        : [...prev, skill]
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        <p className="text-muted-foreground">{description}</p>
      </div>

      {/* Search & Filters Bar */}
      {showFilters && (
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search jobs by title, skills, or keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4"
              />
            </div>
          </form>

          {/* Quick Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            <Select
              value={filters.experience_level || ''}
              onValueChange={(value) =>
                setFilters((prev) => ({
                  ...prev,
                  experience_level: value || undefined,
                }))
              }
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Experience" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Any Experience</SelectItem>
                {EXPERIENCE_LEVELS.map((level) => (
                  <SelectItem key={level.value} value={level.value}>
                    {level.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.job_type || ''}
              onValueChange={(value) =>
                setFilters((prev) => ({
                  ...prev,
                  job_type: value || undefined,
                }))
              }
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Job Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Any Type</SelectItem>
                {JOB_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.posted_within?.toString() || ''}
              onValueChange={(value) =>
                setFilters((prev) => ({
                  ...prev,
                  posted_within: value ? parseInt(value) : undefined,
                }))
              }
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Posted" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Any Time</SelectItem>
                {POSTED_WITHIN.map((time) => (
                  <SelectItem key={time.value} value={time.value}>
                    {time.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* More Filters */}
            <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <SlidersHorizontal className="h-4 w-4" />
                  Filters
                  {activeFilterCount > 0 && (
                    <Badge variant="secondary" className="ml-1">
                      {activeFilterCount}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent className="w-full sm:max-w-md">
                <SheetHeader>
                  <SheetTitle>Filter Jobs</SheetTitle>
                  <SheetDescription>
                    Refine your job search with advanced filters
                  </SheetDescription>
                </SheetHeader>

                <ScrollArea className="h-[calc(100vh-200px)] pr-4 mt-6">
                  <div className="space-y-6">
                    {/* Location Type */}
                    <Collapsible defaultOpen>
                      <CollapsibleTrigger className="flex items-center justify-between w-full py-2">
                        <span className="font-medium">Location Type</span>
                        <ChevronDown className="h-4 w-4" />
                      </CollapsibleTrigger>
                      <CollapsibleContent className="space-y-2 pt-2">
                        {LOCATION_TYPES.map((location) => (
                          <div key={location.value} className="flex items-center gap-2">
                            <Checkbox
                              id={location.value}
                              checked={filters.location_type === location.value}
                              onCheckedChange={(checked) =>
                                setFilters((prev) => ({
                                  ...prev,
                                  location_type: checked ? location.value : undefined,
                                }))
                              }
                            />
                            <Label htmlFor={location.value}>{location.label}</Label>
                          </div>
                        ))}
                      </CollapsibleContent>
                    </Collapsible>

                    {/* Budget Range */}
                    <Collapsible defaultOpen>
                      <CollapsibleTrigger className="flex items-center justify-between w-full py-2">
                        <span className="font-medium">Budget Range</span>
                        <ChevronDown className="h-4 w-4" />
                      </CollapsibleTrigger>
                      <CollapsibleContent className="pt-4">
                        <div className="px-2">
                          <Slider
                            min={0}
                            max={10000}
                            step={100}
                            value={budgetRange}
                            onValueChange={(value) => setBudgetRange(value as [number, number])}
                          />
                          <div className="flex justify-between mt-2 text-sm text-muted-foreground">
                            <span>${budgetRange[0].toLocaleString()}</span>
                            <span>{budgetRange[1] >= 10000 ? '$10,000+' : `$${budgetRange[1].toLocaleString()}`}</span>
                          </div>
                        </div>
                      </CollapsibleContent>
                    </Collapsible>

                    {/* Skills */}
                    <Collapsible defaultOpen>
                      <CollapsibleTrigger className="flex items-center justify-between w-full py-2">
                        <span className="font-medium">Skills</span>
                        <ChevronDown className="h-4 w-4" />
                      </CollapsibleTrigger>
                      <CollapsibleContent className="pt-2">
                        <div className="flex flex-wrap gap-2">
                          {POPULAR_SKILLS.map((skill) => (
                            <Badge
                              key={skill}
                              variant={selectedSkills.includes(skill) ? 'default' : 'outline'}
                              className="cursor-pointer"
                              onClick={() => toggleSkill(skill)}
                            >
                              {skill}
                              {selectedSkills.includes(skill) && (
                                <X className="h-3 w-3 ml-1" />
                              )}
                            </Badge>
                          ))}
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  </div>
                </ScrollArea>

                <SheetFooter className="mt-6">
                  <Button variant="outline" onClick={handleClearFilters}>
                    Clear All
                  </Button>
                  <Button onClick={handleApplyFilters}>Apply Filters</Button>
                </SheetFooter>
              </SheetContent>
            </Sheet>

            {/* View Mode Toggle */}
            <div className="flex items-center border rounded-lg overflow-hidden">
              <Button
                variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                size="icon"
                className="h-9 w-9 rounded-none"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                size="icon"
                className="h-9 w-9 rounded-none"
                onClick={() => setViewMode('grid')}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Active Filters */}
      {activeFilterCount > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          {filters.search && (
            <Badge variant="secondary" className="gap-1">
              Search: {filters.search}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => {
                  setFilters((prev) => ({ ...prev, search: undefined }));
                  setSearchQuery('');
                }}
              />
            </Badge>
          )}
          {filters.experience_level && (
            <Badge variant="secondary" className="gap-1">
              {EXPERIENCE_LEVELS.find((l) => l.value === filters.experience_level)?.label}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => setFilters((prev) => ({ ...prev, experience_level: undefined }))}
              />
            </Badge>
          )}
          {filters.job_type && (
            <Badge variant="secondary" className="gap-1">
              {JOB_TYPES.find((t) => t.value === filters.job_type)?.label}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => setFilters((prev) => ({ ...prev, job_type: undefined }))}
              />
            </Badge>
          )}
          {filters.location_type && (
            <Badge variant="secondary" className="gap-1">
              {LOCATION_TYPES.find((l) => l.value === filters.location_type)?.label}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => setFilters((prev) => ({ ...prev, location_type: undefined }))}
              />
            </Badge>
          )}
          <Button variant="ghost" size="sm" onClick={handleClearFilters}>
            Clear all
          </Button>
        </div>
      )}

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {isLoading ? 'Searching...' : `${pagination.total.toLocaleString()} jobs found`}
        </p>
        <Button variant="ghost" size="sm" onClick={() => refresh()}>
          Refresh
        </Button>
      </div>

      {/* Job Listings */}
      {isLoading && jobs.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <AlertCircle className="h-12 w-12 text-destructive mb-4" />
          <h3 className="text-lg font-semibold mb-2">Error Loading Jobs</h3>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => refresh()}>Try Again</Button>
        </div>
      ) : jobs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Search className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Jobs Found</h3>
          <p className="text-muted-foreground mb-4">
            Try adjusting your filters or search terms
          </p>
          <Button variant="outline" onClick={handleClearFilters}>
            Clear Filters
          </Button>
        </div>
      ) : (
        <>
          <div
            className={cn(
              viewMode === 'grid'
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
                : 'space-y-4'
            )}
          >
            {jobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                viewMode={viewMode}
                isSaved={savedJobIds.has(job.id)}
                onSave={saveJob}
                onUnsave={unsaveJob}
              />
            ))}
          </div>

          {/* Load More */}
          {pagination.page < pagination.totalPages && (
            <div className="flex justify-center pt-6">
              <Button
                variant="outline"
                onClick={() => loadMore()}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Loading...
                  </>
                ) : (
                  `Load More (${pagination.total - jobs.length} remaining)`
                )}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
