'use client';

/**
 * Proposal Form - FreeFlow A+++ Implementation
 * Form to submit job proposals (Upwork-style)
 */

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Plus,
  Trash2,
  Loader2,
  DollarSign,
  Calendar,
  FileText,
  Lightbulb,
  Info,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { FreelancerJob, useProposalMutations, useJobMatchDetails } from '@/lib/hooks/use-job-board';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface ProposalFormProps {
  job: FreelancerJob;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const proposalSchema = z.object({
  cover_letter: z.string()
    .min(100, 'Cover letter must be at least 100 characters')
    .max(5000, 'Cover letter must be less than 5000 characters'),
  proposed_rate: z.number().min(1, 'Rate must be at least $1'),
  rate_type: z.enum(['fixed', 'hourly']),
  estimated_duration: z.string().optional(),
  milestones: z.array(z.object({
    description: z.string().min(1, 'Description required'),
    amount: z.number().min(1, 'Amount required'),
    days: z.number().min(1, 'Days required'),
  })).optional(),
  question_answers: z.record(z.string()).optional(),
  terms_accepted: z.boolean().refine(val => val === true, 'You must accept the terms'),
});

type ProposalFormData = z.infer<typeof proposalSchema>;

const DURATION_OPTIONS = [
  { value: 'less_than_week', label: 'Less than a week' },
  { value: '1_2_weeks', label: '1-2 weeks' },
  { value: '2_4_weeks', label: '2-4 weeks' },
  { value: '1_3_months', label: '1-3 months' },
  { value: '3_6_months', label: '3-6 months' },
  { value: 'more_than_6_months', label: 'More than 6 months' },
];

const COVER_LETTER_TIPS = [
  'Start with a personalized greeting and reference specific project details',
  'Highlight relevant experience and past successes',
  'Explain your approach to solving their specific problem',
  'Include questions that show you understand their needs',
  'End with a clear call-to-action',
];

export function ProposalForm({ job, onSuccess, onCancel }: ProposalFormProps) {
  const { submitProposal, isSubmitting } = useProposalMutations();
  const { matchDetails } = useJobMatchDetails(job.id);
  const [showMilestones, setShowMilestones] = useState(false);

  const form = useForm<ProposalFormData>({
    resolver: zodResolver(proposalSchema),
    defaultValues: {
      cover_letter: '',
      proposed_rate: matchDetails?.match?.recommended_rate_optimal ||
                     (job.budget_type === 'hourly'
                       ? (job.budget_min || 0) + ((job.budget_max || 0) - (job.budget_min || 0)) / 2
                       : job.budget_max || 0),
      rate_type: job.budget_type === 'hourly' ? 'hourly' : 'fixed',
      estimated_duration: '',
      milestones: [],
      question_answers: {},
      terms_accepted: false,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'milestones',
  });

  const watchCoverLetter = form.watch('cover_letter');
  const watchRate = form.watch('proposed_rate');
  const watchRateType = form.watch('rate_type');
  const coverLetterLength = watchCoverLetter?.length || 0;

  const handleSubmit = async (data: ProposalFormData) => {
    try {
      await submitProposal({
        job_id: job.id,
        cover_letter: data.cover_letter,
        proposed_rate: data.proposed_rate,
        rate_type: data.rate_type,
        estimated_duration: data.estimated_duration,
        milestones: data.milestones,
        question_answers: data.question_answers,
      });
      onSuccess?.();
    } catch (error) {
      toast.error('Failed to submit proposal');
    }
  };

  const calculateServiceFee = (amount: number) => {
    // Tiered service fee structure (similar to Upwork)
    if (amount <= 500) return amount * 0.2;
    if (amount <= 10000) return 100 + (amount - 500) * 0.1;
    return 100 + 950 + (amount - 10000) * 0.05;
  };

  const serviceFee = calculateServiceFee(watchRate || 0);
  const youWillReceive = (watchRate || 0) - serviceFee;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Match Score Banner */}
        {matchDetails?.match && (
          <Alert className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
            <Sparkles className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-800 dark:text-green-200">
              You're a {Math.round(matchDetails.match.match_score)}% match!
            </AlertTitle>
            <AlertDescription className="text-green-700 dark:text-green-300">
              Your skills align well with this job. Recommended bid: ${matchDetails.match.recommended_rate_optimal}
              {job.budget_type === 'hourly' ? '/hr' : ' fixed'}
            </AlertDescription>
          </Alert>
        )}

        {/* Job Summary */}
        <Card className="bg-muted/30">
          <CardContent className="pt-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium">{job.title}</h3>
                <p className="text-sm text-muted-foreground">
                  Budget: {job.budget_type === 'hourly'
                    ? `$${job.budget_min || 0} - $${job.budget_max || 0}/hr`
                    : `$${job.budget_max?.toLocaleString() || 'Negotiable'}`
                  }
                </p>
              </div>
              <Badge variant="secondary" className="capitalize">
                {job.experience_level}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Rate Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Your Proposed Terms
            </CardTitle>
            <CardDescription>
              Set your rate based on the project requirements
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="rate_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="fixed">Fixed Price</SelectItem>
                        <SelectItem value="hourly">Hourly Rate</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="proposed_rate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {watchRateType === 'hourly' ? 'Hourly Rate' : 'Bid Amount'}
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          className="pl-8"
                        />
                        {watchRateType === 'hourly' && (
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                            /hr
                          </span>
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Fee Breakdown */}
            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Your bid</span>
                <span>${watchRate?.toFixed(2) || '0.00'}{watchRateType === 'hourly' ? '/hr' : ''}</span>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger className="flex items-center gap-1">
                      Service fee
                      <Info className="h-3 w-3" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>20% for first $500</p>
                      <p>10% for $500.01 - $10,000</p>
                      <p>5% for above $10,000</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <span>-${serviceFee.toFixed(2)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-medium">
                <span>You'll receive</span>
                <span className="text-green-600">${youWillReceive.toFixed(2)}{watchRateType === 'hourly' ? '/hr' : ''}</span>
              </div>
            </div>

            {/* Duration */}
            <FormField
              control={form.control}
              name="estimated_duration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estimated Duration</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select duration" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {DURATION_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Milestones */}
            {watchRateType === 'fixed' && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Project Milestones</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowMilestones(!showMilestones)}
                  >
                    {showMilestones ? 'Hide' : 'Add'} Milestones
                  </Button>
                </div>

                {showMilestones && (
                  <div className="space-y-3">
                    {fields.map((field, index) => (
                      <div key={field.id} className="flex gap-2 items-start">
                        <div className="flex-1">
                          <Input
                            placeholder="Milestone description"
                            {...form.register(`milestones.${index}.description`)}
                          />
                        </div>
                        <div className="w-24">
                          <Input
                            type="number"
                            placeholder="$"
                            {...form.register(`milestones.${index}.amount`, { valueAsNumber: true })}
                          />
                        </div>
                        <div className="w-20">
                          <Input
                            type="number"
                            placeholder="Days"
                            {...form.register(`milestones.${index}.days`, { valueAsNumber: true })}
                          />
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => remove(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => append({ description: '', amount: 0, days: 0 })}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Milestone
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Cover Letter */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Cover Letter
            </CardTitle>
            <CardDescription>
              Explain why you're the best fit for this job
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="cover_letter"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea
                      placeholder="Introduce yourself and explain why you're the perfect fit for this project..."
                      className="min-h-[200px]"
                      {...field}
                    />
                  </FormControl>
                  <div className="flex justify-between text-sm">
                    <FormMessage />
                    <span className={cn(
                      'text-muted-foreground',
                      coverLetterLength < 100 && 'text-red-500',
                      coverLetterLength > 4500 && 'text-orange-500'
                    )}>
                      {coverLetterLength} / 5000
                    </span>
                  </div>
                </FormItem>
              )}
            />

            {/* Cover Letter Tips */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Lightbulb className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-sm text-blue-800 dark:text-blue-200">
                  Tips for a Great Cover Letter
                </span>
              </div>
              <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                {COVER_LETTER_TIPS.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-blue-500">•</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>

            {/* AI Proposal Tips */}
            {matchDetails?.proposal_tips && matchDetails.proposal_tips.length > 0 && (
              <Alert>
                <Sparkles className="h-4 w-4" />
                <AlertTitle>Personalized Tips</AlertTitle>
                <AlertDescription>
                  <ul className="text-sm space-y-1 mt-2">
                    {matchDetails.proposal_tips.map((tip, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span>•</span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Screening Questions */}
        {job.questions.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Screening Questions</CardTitle>
              <CardDescription>
                Answer these questions from the client
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {job.questions.map((question, index) => (
                <FormField
                  key={index}
                  control={form.control}
                  name={`question_answers.q${index}`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {question.question}
                        {question.required && <span className="text-red-500 ml-1">*</span>}
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Your answer..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
            </CardContent>
          </Card>
        )}

        {/* Terms */}
        <FormField
          control={form.control}
          name="terms_accepted"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>
                  I understand and agree to FreeFlow's Terms of Service
                </FormLabel>
                <FormDescription>
                  By submitting this proposal, you agree to the project terms and conditions.
                </FormDescription>
                <FormMessage />
              </div>
            </FormItem>
          )}
        />

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit Proposal'
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
