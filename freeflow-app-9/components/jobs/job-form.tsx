'use client';

/**
 * Job Form - FreeFlow A+++ Implementation
 * Client job posting form (Upwork-style)
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Plus,
  Trash2,
  Loader2,
  DollarSign,
  Clock,
  Globe,
  FileText,
  HelpCircle,
  Eye,
  Save,
  Send,
  ChevronLeft,
  ChevronRight,
  Info,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { useJobMutations } from '@/lib/hooks/use-job-board';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const jobFormSchema = z.object({
  title: z.string()
    .min(10, 'Title must be at least 10 characters')
    .max(200, 'Title must be less than 200 characters'),
  description: z.string()
    .min(50, 'Description must be at least 50 characters')
    .max(10000, 'Description must be less than 10000 characters'),
  category_id: z.string().optional(),
  tags: z.array(z.string()).default([]),
  job_type: z.enum(['one_time', 'ongoing', 'full_time', 'part_time']),
  experience_level: z.enum(['entry', 'intermediate', 'expert']),
  budget_type: z.enum(['fixed', 'hourly', 'negotiable']),
  budget_min: z.number().min(0).optional(),
  budget_max: z.number().min(0).optional(),
  currency: z.string().default('USD'),
  estimated_hours: z.number().min(1).optional(),
  duration: z.string().optional(),
  deadline: z.string().optional(),
  location_type: z.enum(['remote', 'onsite', 'hybrid']),
  location_country: z.string().optional(),
  timezone_preference: z.string().optional(),
  required_skills: z.array(z.string()).min(1, 'Add at least one skill'),
  preferred_skills: z.array(z.string()).default([]),
  questions: z.array(z.object({
    question: z.string().min(1, 'Question required'),
    required: z.boolean().default(false),
  })).default([]),
  visibility: z.enum(['public', 'invite_only', 'private']),
});

type JobFormData = z.infer<typeof jobFormSchema>;

interface JobFormProps {
  initialData?: Partial<JobFormData>;
  onSuccess?: (job: { id: string }) => void;
}

const STEPS = [
  { id: 'basics', title: 'Job Details', description: 'Title and description' },
  { id: 'skills', title: 'Skills & Scope', description: 'Required expertise' },
  { id: 'budget', title: 'Budget', description: 'Payment terms' },
  { id: 'preferences', title: 'Preferences', description: 'Final details' },
];

const DURATION_OPTIONS = [
  { value: 'less_than_week', label: 'Less than a week' },
  { value: '1_2_weeks', label: '1-2 weeks' },
  { value: '2_4_weeks', label: '2-4 weeks' },
  { value: '1_3_months', label: '1-3 months' },
  { value: '3_6_months', label: '3-6 months' },
  { value: 'more_than_6_months', label: 'More than 6 months' },
  { value: 'ongoing', label: 'Ongoing / Not sure' },
];

const POPULAR_SKILLS = [
  'JavaScript', 'TypeScript', 'React', 'Next.js', 'Node.js', 'Python',
  'UI/UX Design', 'Figma', 'Graphic Design', 'WordPress', 'PHP',
  'SEO', 'Content Writing', 'Video Editing', 'Data Analysis', 'Marketing',
  'Mobile App Development', 'iOS', 'Android', 'React Native', 'Flutter',
];

export function JobForm({ initialData, onSuccess }: JobFormProps) {
  const router = useRouter();
  const { createJob, isSubmitting } = useJobMutations();
  const [currentStep, setCurrentStep] = useState(0);
  const [skillInput, setSkillInput] = useState('');
  const [preferredSkillInput, setPreferredSkillInput] = useState('');

  const form = useForm<JobFormData>({
    resolver: zodResolver(jobFormSchema),
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      category_id: initialData?.category_id || '',
      tags: initialData?.tags || [],
      job_type: initialData?.job_type || 'one_time',
      experience_level: initialData?.experience_level || 'intermediate',
      budget_type: initialData?.budget_type || 'fixed',
      budget_min: initialData?.budget_min,
      budget_max: initialData?.budget_max,
      currency: initialData?.currency || 'USD',
      estimated_hours: initialData?.estimated_hours,
      duration: initialData?.duration || '',
      deadline: initialData?.deadline || '',
      location_type: initialData?.location_type || 'remote',
      location_country: initialData?.location_country || '',
      timezone_preference: initialData?.timezone_preference || '',
      required_skills: initialData?.required_skills || [],
      preferred_skills: initialData?.preferred_skills || [],
      questions: initialData?.questions || [],
      visibility: initialData?.visibility || 'public',
    },
  });

  const { fields: questionFields, append: appendQuestion, remove: removeQuestion } = useFieldArray({
    control: form.control,
    name: 'questions',
  });

  const watchRequiredSkills = form.watch('required_skills');
  const watchPreferredSkills = form.watch('preferred_skills');
  const watchBudgetType = form.watch('budget_type');

  const addSkill = (type: 'required' | 'preferred', skill: string) => {
    const trimmed = skill.trim();
    if (!trimmed) return;

    const fieldName = type === 'required' ? 'required_skills' : 'preferred_skills';
    const currentSkills = form.getValues(fieldName);

    if (!currentSkills.includes(trimmed)) {
      form.setValue(fieldName, [...currentSkills, trimmed]);
    }

    if (type === 'required') {
      setSkillInput('');
    } else {
      setPreferredSkillInput('');
    }
  };

  const removeSkill = (type: 'required' | 'preferred', skill: string) => {
    const fieldName = type === 'required' ? 'required_skills' : 'preferred_skills';
    const currentSkills = form.getValues(fieldName);
    form.setValue(fieldName, currentSkills.filter((s) => s !== skill));
  };

  const handleSubmit = async (data: JobFormData, status: 'draft' | 'open') => {
    try {
      const job = await createJob({
        ...data,
        status,
        slug: data.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
        views_count: 0,
        proposals_count: 0,
        is_featured: false,
      } as Parameters<typeof createJob>[0]);

      if (status === 'open') {
        toast.success('Job posted successfully!');
      } else {
        toast.success('Job saved as draft');
      }

      onSuccess?.(job);
      router.push(`/client/jobs/${job.id}`);
    } catch (error) {
      toast.error('Failed to post job');
    }
  };

  const progress = ((currentStep + 1) / STEPS.length) * 100;

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return form.watch('title').length >= 10 && form.watch('description').length >= 50;
      case 1:
        return watchRequiredSkills.length > 0;
      case 2:
        return watchBudgetType === 'negotiable' || (form.watch('budget_max') && form.watch('budget_max')! > 0);
      case 3:
        return true;
      default:
        return true;
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {STEPS.map((step, index) => (
            <div
              key={step.id}
              className={cn(
                'flex items-center',
                index < STEPS.length - 1 && 'flex-1'
              )}
            >
              <button
                type="button"
                onClick={() => index <= currentStep && setCurrentStep(index)}
                className={cn(
                  'flex items-center gap-2 transition-colors',
                  index <= currentStep ? 'text-primary' : 'text-muted-foreground',
                  index < currentStep && 'cursor-pointer'
                )}
              >
                <div
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium',
                    index < currentStep
                      ? 'bg-primary text-primary-foreground'
                      : index === currentStep
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  )}
                >
                  {index + 1}
                </div>
                <div className="hidden md:block">
                  <p className="font-medium text-sm">{step.title}</p>
                  <p className="text-xs text-muted-foreground">{step.description}</p>
                </div>
              </button>
              {index < STEPS.length - 1 && (
                <div
                  className={cn(
                    'flex-1 h-0.5 mx-4',
                    index < currentStep ? 'bg-primary' : 'bg-muted'
                  )}
                />
              )}
            </div>
          ))}
        </div>
        <Progress value={progress} className="h-1" />
      </div>

      <Form {...form}>
        <form>
          {/* Step 1: Basics */}
          {currentStep === 0 && (
            <Card>
              <CardHeader>
                <CardTitle>What are you looking for?</CardTitle>
                <CardDescription>
                  Write a clear title and description to attract the right talent
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Job Title</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Build a responsive e-commerce website"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Be specific - great titles attract better freelancers
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe your project in detail..."
                          className="min-h-[200px]"
                          {...field}
                        />
                      </FormControl>
                      <div className="flex justify-between">
                        <FormDescription>
                          Include goals, deliverables, and any specific requirements
                        </FormDescription>
                        <span className="text-xs text-muted-foreground">
                          {field.value.length} / 10000
                        </span>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="job_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project Type</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="grid grid-cols-2 md:grid-cols-4 gap-4"
                        >
                          {[
                            { value: 'one_time', label: 'One-time Project', desc: 'Single deliverable' },
                            { value: 'ongoing', label: 'Ongoing Project', desc: 'Continuous work' },
                            { value: 'full_time', label: 'Full-time', desc: '40+ hrs/week' },
                            { value: 'part_time', label: 'Part-time', desc: '<30 hrs/week' },
                          ].map((option) => (
                            <div key={option.value}>
                              <RadioGroupItem
                                value={option.value}
                                id={option.value}
                                className="peer sr-only"
                              />
                              <Label
                                htmlFor={option.value}
                                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                              >
                                <span className="font-medium">{option.label}</span>
                                <span className="text-xs text-muted-foreground">
                                  {option.desc}
                                </span>
                              </Label>
                            </div>
                          ))}
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          )}

          {/* Step 2: Skills */}
          {currentStep === 1 && (
            <Card>
              <CardHeader>
                <CardTitle>What skills are required?</CardTitle>
                <CardDescription>
                  Add skills to help freelancers understand what's needed
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="experience_level"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Experience Level</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="grid grid-cols-3 gap-4"
                        >
                          {[
                            { value: 'entry', label: 'Entry Level', desc: 'New to the field' },
                            { value: 'intermediate', label: 'Intermediate', desc: 'Some experience' },
                            { value: 'expert', label: 'Expert', desc: 'Highly skilled' },
                          ].map((option) => (
                            <div key={option.value}>
                              <RadioGroupItem
                                value={option.value}
                                id={`exp-${option.value}`}
                                className="peer sr-only"
                              />
                              <Label
                                htmlFor={`exp-${option.value}`}
                                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                              >
                                <span className="font-medium">{option.label}</span>
                                <span className="text-xs text-muted-foreground">
                                  {option.desc}
                                </span>
                              </Label>
                            </div>
                          ))}
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Required Skills */}
                <div className="space-y-3">
                  <Label>Required Skills *</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a skill..."
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addSkill('required', skillInput);
                        }
                      }}
                    />
                    <Button
                      type="button"
                      onClick={() => addSkill('required', skillInput)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {watchRequiredSkills.map((skill) => (
                      <Badge key={skill} variant="secondary" className="gap-1">
                        {skill}
                        <button
                          type="button"
                          onClick={() => removeSkill('required', skill)}
                          className="ml-1 hover:text-destructive"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>

                  {watchRequiredSkills.length === 0 && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Popular skills:</p>
                      <div className="flex flex-wrap gap-2">
                        {POPULAR_SKILLS.slice(0, 10).map((skill) => (
                          <Badge
                            key={skill}
                            variant="outline"
                            className="cursor-pointer hover:bg-secondary"
                            onClick={() => addSkill('required', skill)}
                          >
                            + {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Preferred Skills */}
                <div className="space-y-3">
                  <Label>Preferred Skills (Optional)</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a nice-to-have skill..."
                      value={preferredSkillInput}
                      onChange={(e) => setPreferredSkillInput(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addSkill('preferred', preferredSkillInput);
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => addSkill('preferred', preferredSkillInput)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {watchPreferredSkills.map((skill) => (
                      <Badge key={skill} variant="outline" className="gap-1">
                        {skill}
                        <button
                          type="button"
                          onClick={() => removeSkill('preferred', skill)}
                          className="ml-1 hover:text-destructive"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Duration */}
                <FormField
                  control={form.control}
                  name="duration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project Duration</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select expected duration" />
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
              </CardContent>
            </Card>
          )}

          {/* Step 3: Budget */}
          {currentStep === 2 && (
            <Card>
              <CardHeader>
                <CardTitle>Set your budget</CardTitle>
                <CardDescription>
                  Choose how you want to pay for this project
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="budget_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment Type</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="grid grid-cols-3 gap-4"
                        >
                          {[
                            { value: 'fixed', label: 'Fixed Price', desc: 'Pay per project' },
                            { value: 'hourly', label: 'Hourly', desc: 'Pay per hour' },
                            { value: 'negotiable', label: 'Negotiable', desc: 'Discuss with freelancer' },
                          ].map((option) => (
                            <div key={option.value}>
                              <RadioGroupItem
                                value={option.value}
                                id={`budget-${option.value}`}
                                className="peer sr-only"
                              />
                              <Label
                                htmlFor={`budget-${option.value}`}
                                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                              >
                                <span className="font-medium">{option.label}</span>
                                <span className="text-xs text-muted-foreground">
                                  {option.desc}
                                </span>
                              </Label>
                            </div>
                          ))}
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {watchBudgetType !== 'negotiable' && (
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="budget_min"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            {watchBudgetType === 'hourly' ? 'Min Hourly Rate' : 'Min Budget'}
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input
                                type="number"
                                placeholder="0"
                                className="pl-8"
                                {...field}
                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                              />
                              {watchBudgetType === 'hourly' && (
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

                    <FormField
                      control={form.control}
                      name="budget_max"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            {watchBudgetType === 'hourly' ? 'Max Hourly Rate' : 'Max Budget'}
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input
                                type="number"
                                placeholder="0"
                                className="pl-8"
                                {...field}
                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                              />
                              {watchBudgetType === 'hourly' && (
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
                )}

                {watchBudgetType === 'hourly' && (
                  <FormField
                    control={form.control}
                    name="estimated_hours"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estimated Hours per Week</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              type="number"
                              placeholder="e.g., 30"
                              className="pl-10"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                              hrs/week
                            </span>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </CardContent>
            </Card>
          )}

          {/* Step 4: Preferences */}
          {currentStep === 3 && (
            <Card>
              <CardHeader>
                <CardTitle>Final Details</CardTitle>
                <CardDescription>
                  Set location preferences and screening questions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="location_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Work Location</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="grid grid-cols-3 gap-4"
                        >
                          {[
                            { value: 'remote', label: 'Remote', icon: Globe },
                            { value: 'onsite', label: 'On-site', icon: Globe },
                            { value: 'hybrid', label: 'Hybrid', icon: Globe },
                          ].map((option) => (
                            <div key={option.value}>
                              <RadioGroupItem
                                value={option.value}
                                id={`loc-${option.value}`}
                                className="peer sr-only"
                              />
                              <Label
                                htmlFor={`loc-${option.value}`}
                                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                              >
                                <option.icon className="h-6 w-6 mb-2" />
                                <span className="font-medium">{option.label}</span>
                              </Label>
                            </div>
                          ))}
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="visibility"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Job Visibility</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="public">Public - Anyone can view and apply</SelectItem>
                          <SelectItem value="invite_only">Invite Only - Only invited freelancers</SelectItem>
                          <SelectItem value="private">Private - Not searchable</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Screening Questions */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Screening Questions (Optional)</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => appendQuestion({ question: '', required: false })}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Question
                    </Button>
                  </div>

                  {questionFields.map((field, index) => (
                    <div key={field.id} className="flex gap-2 items-start">
                      <div className="flex-1">
                        <Input
                          placeholder="Enter your question..."
                          {...form.register(`questions.${index}.question`)}
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="flex items-center">
                                <Switch
                                  checked={form.watch(`questions.${index}.required`)}
                                  onCheckedChange={(checked) =>
                                    form.setValue(`questions.${index}.required`, checked)
                                  }
                                />
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>Mark as required</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeQuestion(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => setCurrentStep((s) => s - 1)}
              disabled={currentStep === 0}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back
            </Button>

            <div className="flex gap-2">
              {currentStep === STEPS.length - 1 ? (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleSubmit(form.getValues(), 'draft')}
                    disabled={isSubmitting}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save Draft
                  </Button>
                  <Button
                    type="button"
                    onClick={() => handleSubmit(form.getValues(), 'open')}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4 mr-2" />
                    )}
                    Post Job
                  </Button>
                </>
              ) : (
                <Button
                  type="button"
                  onClick={() => setCurrentStep((s) => s + 1)}
                  disabled={!canProceed()}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
