/**
 * Goal Card Component - FreeFlow A+++ Implementation
 * Display individual goal with progress and actions
 */

'use client';

import { useState } from 'react';
import {
  Target,
  ChevronDown,
  ChevronRight,
  MoreVertical,
  Calendar,
  TrendingUp,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Edit,
  Trash2,
  Plus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Goal,
  KeyResult,
  STATUS_COLORS,
  GOAL_TYPE_LABELS,
  formatProgress,
  getDaysRemaining,
  getProgressColor,
} from '@/lib/hooks/use-goals';
import { cn } from '@/lib/utils';

interface GoalCardProps {
  goal: Goal;
  onEdit?: (goal: Goal) => void;
  onDelete?: (id: string) => void;
  onComplete?: (id: string) => void;
  onUpdateProgress?: (id: string, value: number) => void;
  onViewDetails?: (goal: Goal) => void;
  onAddKeyResult?: (objectiveId: string) => void;
  showKeyResults?: boolean;
}

export function GoalCard({
  goal,
  onEdit,
  onDelete,
  onComplete,
  onUpdateProgress,
  onViewDetails,
  onAddKeyResult,
  showKeyResults = true,
}: GoalCardProps) {
  const [expanded, setExpanded] = useState(false);

  const daysRemaining = getDaysRemaining(goal.due_date);
  const isOverdue = daysRemaining < 0 && goal.status !== 'completed';
  const isNearDue = daysRemaining >= 0 && daysRemaining <= 7 && goal.status !== 'completed';

  const getStatusIcon = () => {
    switch (goal.status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-emerald-600" />;
      case 'at_risk':
      case 'behind':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-gray-400" />;
      default:
        return <Target className="h-4 w-4 text-blue-600" />;
    }
  };

  return (
    <Card className={cn(
      "transition-all hover:shadow-md",
      goal.status === 'completed' && "opacity-75",
      isOverdue && "border-red-300 dark:border-red-800"
    )}>
      <Collapsible open={expanded} onOpenChange={setExpanded}>
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <div
                className={cn(
                  "h-10 w-10 rounded-lg flex items-center justify-center shrink-0",
                  goal.color || "bg-primary/10"
                )}
              >
                {goal.icon ? (
                  <span className="text-lg">{goal.icon}</span>
                ) : (
                  getStatusIcon()
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3
                    className="font-semibold truncate cursor-pointer hover:text-primary"
                    onClick={() => onViewDetails?.(goal)}
                  >
                    {goal.title}
                  </h3>
                  <Badge variant="outline" className={STATUS_COLORS[goal.status]}>
                    {goal.status.replace('_', ' ')}
                  </Badge>
                  {goal.goal_type !== 'objective' && (
                    <Badge variant="secondary" className="text-xs">
                      {GOAL_TYPE_LABELS[goal.goal_type]}
                    </Badge>
                  )}
                </div>
                {goal.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                    {goal.description}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {goal.goal_type === 'objective' && goal.key_results && goal.key_results.length > 0 && (
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm">
                    {expanded ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                    <span className="ml-1 text-xs">{goal.key_results.length} KRs</span>
                  </Button>
                </CollapsibleTrigger>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onViewDetails?.(goal)}>
                    <TrendingUp className="h-4 w-4 mr-2" />
                    View Details
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onEdit?.(goal)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  {goal.goal_type === 'objective' && (
                    <DropdownMenuItem onClick={() => onAddKeyResult?.(goal.id)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Key Result
                    </DropdownMenuItem>
                  )}
                  {goal.status !== 'completed' && (
                    <DropdownMenuItem onClick={() => onComplete?.(goal.id)}>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Mark Complete
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={() => onDelete?.(goal.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          {/* Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">
                {formatProgress(goal.current_value, goal.target_value, goal.metric_type, goal.unit)}
              </span>
            </div>
            <Progress
              value={goal.progress_percentage}
              className="h-2"
            />
          </div>

          {/* Footer info */}
          <div className="flex items-center justify-between mt-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {new Date(goal.due_date).toLocaleDateString()}
              </span>
              {goal.tags && goal.tags.length > 0 && (
                <div className="flex gap-1">
                  {goal.tags.slice(0, 2).map(tag => (
                    <Badge key={tag} variant="outline" className="text-xs py-0">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
            <span className={cn(
              isOverdue && "text-red-600 font-medium",
              isNearDue && "text-yellow-600 font-medium"
            )}>
              {isOverdue ? (
                `${Math.abs(daysRemaining)} days overdue`
              ) : daysRemaining === 0 ? (
                'Due today'
              ) : daysRemaining === 1 ? (
                'Due tomorrow'
              ) : (
                `${daysRemaining} days left`
              )}
            </span>
          </div>

          {/* Key Results (Collapsible) */}
          {showKeyResults && goal.goal_type === 'objective' && goal.key_results && (
            <CollapsibleContent>
              <div className="mt-4 pt-4 border-t space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium">Key Results</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onAddKeyResult?.(goal.id)}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add
                  </Button>
                </div>
                {goal.key_results.map((kr) => (
                  <KeyResultItem
                    key={kr.id}
                    keyResult={kr}
                    onUpdateProgress={onUpdateProgress}
                  />
                ))}
              </div>
            </CollapsibleContent>
          )}
        </CardContent>
      </Collapsible>
    </Card>
  );
}

// Key Result Item Component
interface KeyResultItemProps {
  keyResult: KeyResult;
  onUpdateProgress?: (id: string, value: number) => void;
}

function KeyResultItem({ keyResult, onUpdateProgress }: KeyResultItemProps) {
  return (
    <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
      <div className={cn(
        "h-2 w-2 rounded-full",
        getProgressColor(keyResult.progress_percentage)
      )} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{keyResult.title}</p>
        <div className="flex items-center gap-2 mt-1">
          <Progress value={keyResult.progress_percentage} className="h-1.5 flex-1" />
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {Math.round(keyResult.progress_percentage)}%
          </span>
        </div>
      </div>
    </div>
  );
}
