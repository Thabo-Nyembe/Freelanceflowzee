/**
 * Goals Dashboard - FreeFlow A+++ Implementation
 * Complete goal management interface with statistics and OKR tracking
 */

'use client';

import { useState, useMemo } from 'react';
import {
  Target,
  Plus,
  Filter,
  TrendingUp,
  CheckCircle,
  AlertTriangle,
  Clock,
  BarChart3,
  Search,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
} from '@/components/ui/sheet';
import { GoalCard } from './goal-card';
import { GoalForm } from './goal-form';
import {
  useGoals,
  Goal,
  GoalStatus,
  GoalTimeframe,
  CreateGoalInput,
  UpdateGoalInput,
  TIMEFRAME_LABELS,
} from '@/lib/hooks/use-goals';
import { cn } from '@/lib/utils';

export function GoalsDashboard() {
  const [activeTab, setActiveTab] = useState<'all' | 'objectives' | 'targets' | 'habits'>('all');
  const [statusFilter, setStatusFilter] = useState<GoalStatus | 'all'>('all');
  const [timeframeFilter, setTimeframeFilter] = useState<GoalTimeframe | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    goals,
    statistics,
    isLoading,
    createGoal,
    updateGoal,
    deleteGoal,
    completeGoal,
    updateProgress,
    refresh,
  } = useGoals({
    filters: {
      goalType: activeTab === 'all' ? undefined : activeTab === 'objectives' ? 'objective' : activeTab === 'targets' ? 'target' : 'habit',
      status: statusFilter === 'all' ? undefined : statusFilter,
      timeframe: timeframeFilter === 'all' ? undefined : timeframeFilter,
    },
  });

  // Filter goals by search
  const filteredGoals = useMemo(() => {
    if (!searchQuery) return goals;
    const query = searchQuery.toLowerCase();
    return goals.filter(g =>
      g.title.toLowerCase().includes(query) ||
      g.description?.toLowerCase().includes(query) ||
      g.category?.toLowerCase().includes(query)
    );
  }, [goals, searchQuery]);

  // Handle form submit
  const handleSubmit = async (data: CreateGoalInput | UpdateGoalInput) => {
    setIsSubmitting(true);
    try {
      if (editingGoal) {
        await updateGoal(editingGoal.id, data);
      } else {
        await createGoal(data as CreateGoalInput);
      }
      setFormOpen(false);
      setEditingGoal(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle edit
  const handleEdit = (goal: Goal) => {
    setEditingGoal(goal);
    setFormOpen(true);
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this goal?')) {
      await deleteGoal(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Goals & OKRs</h1>
          <p className="text-muted-foreground">
            Set objectives, track key results, and achieve your goals
          </p>
        </div>
        <Button onClick={() => setFormOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Goal
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Total Goals
            </CardDescription>
            <CardTitle className="text-3xl">{statistics.total}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {statistics.completed} completed this period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Average Progress
            </CardDescription>
            <CardTitle className="text-3xl">{Math.round(statistics.averageProgress)}%</CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={statistics.averageProgress} className="h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              On Track
            </CardDescription>
            <CardTitle className="text-3xl text-green-600">{statistics.onTrack}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {statistics.active} active goals
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              Needs Attention
            </CardDescription>
            <CardTitle className="text-3xl text-yellow-600">
              {statistics.atRisk + statistics.behind}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {statistics.atRisk} at risk, {statistics.behind} behind
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Tabs */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)} className="flex-1">
          <TabsList>
            <TabsTrigger value="all">All Goals</TabsTrigger>
            <TabsTrigger value="objectives">Objectives</TabsTrigger>
            <TabsTrigger value="targets">Targets</TabsTrigger>
            <TabsTrigger value="habits">Habits</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex gap-2">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search goals..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as GoalStatus | 'all')}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="on_track">On Track</SelectItem>
              <SelectItem value="at_risk">At Risk</SelectItem>
              <SelectItem value="behind">Behind</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>

          <Select value={timeframeFilter} onValueChange={(v) => setTimeframeFilter(v as GoalTimeframe | 'all')}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              {Object.entries(TIMEFRAME_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Goals List */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2, 3, 4].map(i => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
              </CardHeader>
              <CardContent>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredGoals.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Target className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Goals Found</h3>
            <p className="text-muted-foreground text-center mb-4">
              {searchQuery
                ? 'No goals match your search criteria'
                : 'Create your first goal to start tracking progress'}
            </p>
            {!searchQuery && (
              <Button onClick={() => setFormOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Goal
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filteredGoals.map(goal => (
            <GoalCard
              key={goal.id}
              goal={goal}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onComplete={completeGoal}
              onUpdateProgress={updateProgress}
              onViewDetails={handleEdit}
              onAddKeyResult={(objectiveId) => {
                const goal = goals.find(g => g.id === objectiveId);
                if (goal) handleEdit(goal);
              }}
            />
          ))}
        </div>
      )}

      {/* Goal Form Sheet */}
      <Sheet open={formOpen} onOpenChange={(open) => {
        if (!open) {
          setEditingGoal(null);
        }
        setFormOpen(open);
      }}>
        <SheetContent className="sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{editingGoal ? 'Edit Goal' : 'Create New Goal'}</SheetTitle>
            <SheetDescription>
              {editingGoal
                ? 'Update your goal details and track progress'
                : 'Set a new goal with measurable objectives'}
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6">
            <GoalForm
              goal={editingGoal || undefined}
              onSubmit={handleSubmit}
              onCancel={() => {
                setFormOpen(false);
                setEditingGoal(null);
              }}
              isLoading={isSubmitting}
            />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
