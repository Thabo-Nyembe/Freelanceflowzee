/**
 * Goal Form Component - FreeFlow A+++ Implementation
 * Create and edit goals with OKR support
 */

'use client';

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Switch } from '@/components/ui/switch';
import {
  Goal,
  GoalType,
  GoalTimeframe,
  MetricType,
  GoalVisibility,
  CreateGoalInput,
  UpdateGoalInput,
  GOAL_TYPE_LABELS,
  TIMEFRAME_LABELS,
} from '@/lib/hooks/use-goals';

const goalSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  goal_type: z.enum(['objective', 'key_result', 'milestone', 'target', 'habit', 'learning']),
  timeframe: z.enum(['daily', 'weekly', 'monthly', 'quarterly', 'yearly', 'custom']),
  start_date: z.string(),
  due_date: z.string(),
  metric_type: z.enum(['number', 'percentage', 'currency', 'boolean', 'milestone', 'count']),
  target_value: z.coerce.number().min(0),
  starting_value: z.coerce.number().min(0),
  unit: z.string().optional(),
  priority: z.coerce.number().min(1).max(5),
  color: z.string().optional(),
  icon: z.string().optional(),
  tags: z.string().optional(), // Will be split into array
  category: z.string().optional(),
  visibility: z.enum(['private', 'team', 'public']),
  key_results: z.array(z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().optional(),
    metric_type: z.enum(['number', 'percentage', 'currency', 'boolean', 'milestone', 'count']),
    target_value: z.coerce.number().min(0),
    starting_value: z.coerce.number().min(0),
    unit: z.string().optional(),
    weight: z.coerce.number().min(0).max(10),
  })).optional(),
});

type GoalFormData = z.infer<typeof goalSchema>;

interface GoalFormProps {
  goal?: Goal;
  onSubmit: (data: CreateGoalInput | UpdateGoalInput) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function GoalForm({ goal, onSubmit, onCancel, isLoading }: GoalFormProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const isEditing = !!goal;

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<GoalFormData>({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      title: goal?.title || '',
      description: goal?.description || '',
      goal_type: goal?.goal_type || 'objective',
      timeframe: goal?.timeframe || 'quarterly',
      start_date: goal?.start_date || new Date().toISOString().split('T')[0],
      due_date: goal?.due_date || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      metric_type: goal?.metric_type || 'percentage',
      target_value: goal?.target_value || 100,
      starting_value: goal?.starting_value || 0,
      unit: goal?.unit || '',
      priority: goal?.priority || 2,
      color: goal?.color || '',
      icon: goal?.icon || '',
      tags: goal?.tags?.join(', ') || '',
      category: goal?.category || '',
      visibility: goal?.visibility || 'private',
      key_results: goal?.key_results?.map(kr => ({
        title: kr.title,
        description: kr.description,
        metric_type: kr.metric_type,
        target_value: kr.target_value,
        starting_value: kr.starting_value,
        unit: kr.unit,
        weight: kr.weight,
      })) || [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'key_results',
  });

  const goalType = watch('goal_type');
  const metricType = watch('metric_type');

  const handleFormSubmit = async (data: GoalFormData) => {
    const submitData: CreateGoalInput = {
      ...data,
      tags: data.tags ? data.tags.split(',').map(t => t.trim()).filter(Boolean) : undefined,
      key_results: goalType === 'objective' ? data.key_results : undefined,
    };

    await onSubmit(submitData);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Basic Info */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="title">Title *</Label>
          <Input
            id="title"
            {...register('title')}
            placeholder="e.g., Increase Monthly Revenue"
          />
          {errors.title && (
            <p className="text-sm text-destructive mt-1">{errors.title.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            {...register('description')}
            placeholder="Describe what you want to achieve..."
            rows={3}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Goal Type</Label>
            <Select
              value={watch('goal_type')}
              onValueChange={(v) => setValue('goal_type', v as GoalType)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(GOAL_TYPE_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Timeframe</Label>
            <Select
              value={watch('timeframe')}
              onValueChange={(v) => setValue('timeframe', v as GoalTimeframe)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(TIMEFRAME_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="start_date">Start Date</Label>
            <Input
              id="start_date"
              type="date"
              {...register('start_date')}
            />
          </div>
          <div>
            <Label htmlFor="due_date">Due Date</Label>
            <Input
              id="due_date"
              type="date"
              {...register('due_date')}
            />
          </div>
        </div>
      </div>

      {/* Metrics */}
      <div className="space-y-4 pt-4 border-t">
        <h4 className="font-medium">Measurement</h4>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Metric Type</Label>
            <Select
              value={watch('metric_type')}
              onValueChange={(v) => setValue('metric_type', v as MetricType)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="percentage">Percentage</SelectItem>
                <SelectItem value="number">Number</SelectItem>
                <SelectItem value="currency">Currency</SelectItem>
                <SelectItem value="count">Count</SelectItem>
                <SelectItem value="boolean">Yes/No</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {metricType !== 'boolean' && (
            <div>
              <Label htmlFor="unit">Unit (optional)</Label>
              <Input
                id="unit"
                {...register('unit')}
                placeholder="e.g., $, hours, clients"
              />
            </div>
          )}
        </div>

        {metricType !== 'boolean' && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="starting_value">Starting Value</Label>
              <Input
                id="starting_value"
                type="number"
                {...register('starting_value')}
              />
            </div>
            <div>
              <Label htmlFor="target_value">Target Value</Label>
              <Input
                id="target_value"
                type="number"
                {...register('target_value')}
              />
            </div>
          </div>
        )}
      </div>

      {/* Key Results (for Objectives) */}
      {goalType === 'objective' && (
        <div className="space-y-4 pt-4 border-t">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Key Results</h4>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append({
                title: '',
                description: '',
                metric_type: 'percentage',
                target_value: 100,
                starting_value: 0,
                unit: '',
                weight: 1,
              })}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Key Result
            </Button>
          </div>

          <div className="space-y-3">
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="flex gap-3 p-4 border rounded-lg bg-muted/30"
              >
                <div className="cursor-move pt-2">
                  <GripVertical className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex-1 space-y-3">
                  <Input
                    {...register(`key_results.${index}.title`)}
                    placeholder="Key result title"
                  />
                  <div className="grid grid-cols-3 gap-2">
                    <Select
                      value={watch(`key_results.${index}.metric_type`)}
                      onValueChange={(v) => setValue(`key_results.${index}.metric_type`, v as MetricType)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percentage">%</SelectItem>
                        <SelectItem value="number">#</SelectItem>
                        <SelectItem value="currency">$</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      type="number"
                      {...register(`key_results.${index}.target_value`)}
                      placeholder="Target"
                    />
                    <Input
                      type="number"
                      step="0.1"
                      {...register(`key_results.${index}.weight`)}
                      placeholder="Weight"
                    />
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => remove(index)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Advanced Options */}
      <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
        <CollapsibleTrigger asChild>
          <Button type="button" variant="ghost" className="w-full justify-between">
            Advanced Options
            <span className="text-muted-foreground text-xs">
              {showAdvanced ? 'Hide' : 'Show'}
            </span>
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-4 pt-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="priority">Priority (1-5)</Label>
              <Input
                id="priority"
                type="number"
                min="1"
                max="5"
                {...register('priority')}
              />
            </div>
            <div>
              <Label>Visibility</Label>
              <Select
                value={watch('visibility')}
                onValueChange={(v) => setValue('visibility', v as GoalVisibility)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="private">Private</SelectItem>
                  <SelectItem value="team">Team</SelectItem>
                  <SelectItem value="public">Public</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="tags">Tags (comma separated)</Label>
            <Input
              id="tags"
              {...register('tags')}
              placeholder="e.g., revenue, Q1, marketing"
            />
          </div>

          <div>
            <Label htmlFor="category">Category</Label>
            <Input
              id="category"
              {...register('category')}
              placeholder="e.g., Business, Personal, Learning"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="icon">Icon (emoji)</Label>
              <Input
                id="icon"
                {...register('icon')}
                placeholder="🎯"
              />
            </div>
            <div>
              <Label htmlFor="color">Color</Label>
              <Input
                id="color"
                type="color"
                {...register('color')}
                className="h-10"
              />
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : isEditing ? 'Update Goal' : 'Create Goal'}
        </Button>
      </div>
    </form>
  );
}
