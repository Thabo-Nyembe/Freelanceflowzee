'use client';

/**
 * Listing Form - FreeFlow A+++ Implementation
 * Create and edit service listings
 */

import { useState } from 'react';
import { toast } from 'sonner';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Plus,
  Trash2,
  Upload,
  GripVertical,
  ChevronRight,
  ChevronLeft,
  Save,
  Eye,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ServiceListing, useServiceCategories } from '@/lib/hooks/use-service-marketplace';

const listingSchema = z.object({
  title: z.string().min(10, 'Title must be at least 10 characters').max(80, 'Title must be less than 80 characters'),
  category_id: z.string().uuid('Please select a category'),
  subcategory_id: z.string().uuid().optional(),
  description: z.string().min(120, 'Description must be at least 120 characters'),
  search_tags: z.array(z.string()).min(1, 'Add at least one tag').max(5, 'Maximum 5 tags'),
  packages: z.array(z.object({
    name: z.enum(['Basic', 'Standard', 'Premium']),
    title: z.string().min(1, 'Package title is required'),
    description: z.string().min(1, 'Package description is required'),
    price: z.number().min(5, 'Minimum price is $5').max(10000, 'Maximum price is $10,000'),
    delivery_days: z.number().min(1, 'Minimum 1 day').max(90, 'Maximum 90 days'),
    revisions: z.union([z.number().min(0), z.literal('unlimited')]),
    features: z.array(z.string()).min(1, 'Add at least one feature'),
  })).min(1, 'At least one package is required'),
  extras: z.array(z.object({
    id: z.string(),
    title: z.string().min(1, 'Extra title is required'),
    description: z.string(),
    price: z.number().min(5, 'Minimum price is $5'),
    delivery_days_modifier: z.number().min(0),
  })).optional(),
  requirements: z.array(z.object({
    id: z.string(),
    question: z.string().min(1, 'Question is required'),
    type: z.enum(['text', 'file', 'choice']),
    required: z.boolean(),
    options: z.array(z.string()).optional(),
  })).optional(),
  faqs: z.array(z.object({
    id: z.string(),
    question: z.string().min(1, 'Question is required'),
    answer: z.string().min(1, 'Answer is required'),
  })).optional(),
});

type ListingFormData = z.infer<typeof listingSchema>;

interface ListingFormProps {
  listing?: ServiceListing;
  onSubmit: (data: ListingFormData) => Promise<void>;
  isSubmitting?: boolean;
}

export function ListingForm({ listing, onSubmit, isSubmitting }: ListingFormProps) {
  const [step, setStep] = useState(1);
  const [tagInput, setTagInput] = useState('');
  const { categories } = useServiceCategories();

  const form = useForm<ListingFormData>({
    resolver: zodResolver(listingSchema),
    defaultValues: listing ? {
      title: listing.title,
      category_id: listing.category_id,
      subcategory_id: listing.subcategory_id || undefined,
      description: listing.description,
      search_tags: listing.search_tags || [],
      packages: listing.packages || [
        { name: 'Basic', title: '', description: '', price: 5, delivery_days: 3, revisions: 1, features: [] },
      ],
      extras: listing.extras || [],
      requirements: listing.requirements || [],
      faqs: listing.faqs || [],
    } : {
      title: '',
      category_id: '',
      description: '',
      search_tags: [],
      packages: [
        { name: 'Basic', title: '', description: '', price: 5, delivery_days: 3, revisions: 1, features: [] },
        { name: 'Standard', title: '', description: '', price: 25, delivery_days: 5, revisions: 2, features: [] },
        { name: 'Premium', title: '', description: '', price: 50, delivery_days: 7, revisions: 'unlimited', features: [] },
      ],
      extras: [],
      requirements: [],
      faqs: [],
    },
  });

  const { fields: packageFields, update: updatePackage } = useFieldArray({
    control: form.control,
    name: 'packages',
  });

  const { fields: extraFields, append: appendExtra, remove: removeExtra } = useFieldArray({
    control: form.control,
    name: 'extras',
  });

  const { fields: reqFields, append: appendReq, remove: removeReq } = useFieldArray({
    control: form.control,
    name: 'requirements',
  });

  const { fields: faqFields, append: appendFaq, remove: removeFaq } = useFieldArray({
    control: form.control,
    name: 'faqs',
  });

  const selectedCategory = categories.find(c => c.id === form.watch('category_id'));
  const tags = form.watch('search_tags') || [];

  const addTag = () => {
    if (tagInput && tags.length < 5 && !tags.includes(tagInput)) {
      form.setValue('search_tags', [...tags, tagInput]);
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    form.setValue('search_tags', tags.filter(t => t !== tag));
  };

  const totalSteps = 5;

  const handleSubmit = form.handleSubmit(async (data) => {
    await onSubmit(data);
  });

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-8">
          {['Overview', 'Pricing', 'Description', 'Requirements', 'Gallery'].map((label, i) => (
            <div key={i} className="flex items-center">
              <button
                type="button"
                className={`flex items-center justify-center w-10 h-10 rounded-full text-sm font-medium transition-colors ${
                  step > i + 1
                    ? 'bg-primary text-primary-foreground'
                    : step === i + 1
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                }`}
                onClick={() => setStep(i + 1)}
              >
                {i + 1}
              </button>
              <span className="ml-2 text-sm hidden sm:inline">{label}</span>
              {i < 4 && <div className="w-12 h-1 mx-2 bg-muted" />}
            </div>
          ))}
        </div>

        {/* Step 1: Overview */}
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Gig Overview</CardTitle>
              <CardDescription>
                Provide the basic details of your service
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gig Title</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="I will create a professional..."
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      {field.value?.length || 0}/80 characters
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="category_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map(cat => (
                            <SelectItem key={cat.id} value={cat.id}>
                              {cat.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {selectedCategory?.subcategories && selectedCategory.subcategories.length > 0 && (
                  <FormField
                    control={form.control}
                    name="subcategory_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subcategory</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select subcategory" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {selectedCategory.subcategories?.map(sub => (
                              <SelectItem key={sub.id} value={sub.id}>
                                {sub.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>

              <div>
                <Label>Search Tags</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    placeholder="Add a tag"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addTag();
                      }
                    }}
                  />
                  <Button type="button" variant="outline" onClick={addTag}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => removeTag(tag)}>
                      {tag} ×
                    </Badge>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {tags.length}/5 tags - Help buyers find your gig
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Pricing */}
        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>Scope & Pricing</CardTitle>
              <CardDescription>
                Define what you offer in each package
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-3">
                {packageFields.map((pkg, index) => (
                  <Card key={pkg.id} className={index === 1 ? 'border-primary' : ''}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">{pkg.name}</CardTitle>
                      {index === 1 && (
                        <Badge className="w-fit">Most Popular</Badge>
                      )}
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label>Package Title</Label>
                        <Input
                          {...form.register(`packages.${index}.title`)}
                          placeholder="e.g., Basic Package"
                        />
                      </div>

                      <div>
                        <Label>Description</Label>
                        <Textarea
                          {...form.register(`packages.${index}.description`)}
                          placeholder="What's included"
                          rows={2}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label>Price ($)</Label>
                          <Input
                            type="number"
                            {...form.register(`packages.${index}.price`, { valueAsNumber: true })}
                            min={5}
                          />
                        </div>
                        <div>
                          <Label>Delivery (days)</Label>
                          <Input
                            type="number"
                            {...form.register(`packages.${index}.delivery_days`, { valueAsNumber: true })}
                            min={1}
                          />
                        </div>
                      </div>

                      <div>
                        <Label>Revisions</Label>
                        <Select
                          value={String(form.watch(`packages.${index}.revisions`))}
                          onValueChange={(v) => {
                            const currentPackage = form.getValues(`packages.${index}`);
                            updatePackage(index, {
                              ...currentPackage,
                              revisions: v === 'unlimited' ? 'unlimited' : parseInt(v),
                            });
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="0">0</SelectItem>
                            <SelectItem value="1">1</SelectItem>
                            <SelectItem value="2">2</SelectItem>
                            <SelectItem value="3">3</SelectItem>
                            <SelectItem value="5">5</SelectItem>
                            <SelectItem value="unlimited">Unlimited</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Description */}
        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle>Description & FAQ</CardTitle>
              <CardDescription>
                Describe your service in detail
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe your service, your expertise, and what buyers will get..."
                        rows={10}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      {field.value?.length || 0}/1200 characters minimum
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Separator />

              <div>
                <div className="flex items-center justify-between mb-4">
                  <Label>Frequently Asked Questions</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => appendFaq({ id: crypto.randomUUID(), question: '', answer: '' })}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add FAQ
                  </Button>
                </div>

                <div className="space-y-4">
                  {faqFields.map((faq, index) => (
                    <Card key={faq.id}>
                      <CardContent className="pt-4 space-y-3">
                        <div className="flex gap-2">
                          <Input
                            {...form.register(`faqs.${index}.question`)}
                            placeholder="Question"
                            className="flex-1"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeFaq(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <Textarea
                          {...form.register(`faqs.${index}.answer`)}
                          placeholder="Answer"
                          rows={2}
                        />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Requirements */}
        {step === 4 && (
          <Card>
            <CardHeader>
              <CardTitle>Requirements</CardTitle>
              <CardDescription>
                What information do you need from buyers?
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-muted-foreground">
                  Add questions to collect information from buyers before starting
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => appendReq({
                    id: crypto.randomUUID(),
                    question: '',
                    type: 'text',
                    required: true,
                  })}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Question
                </Button>
              </div>

              <div className="space-y-4">
                {reqFields.map((req, index) => (
                  <Card key={req.id}>
                    <CardContent className="pt-4 space-y-3">
                      <div className="flex gap-2">
                        <Input
                          {...form.register(`requirements.${index}.question`)}
                          placeholder="e.g., What is your company name?"
                          className="flex-1"
                        />
                        <Select
                          value={form.watch(`requirements.${index}.type`)}
                          onValueChange={(v) => form.setValue(`requirements.${index}.type`, v as 'text' | 'file' | 'choice')}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="text">Text</SelectItem>
                            <SelectItem value="file">File Upload</SelectItem>
                            <SelectItem value="choice">Multiple Choice</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeReq(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex items-center gap-2">
                        <Checkbox
                          checked={form.watch(`requirements.${index}.required`)}
                          onCheckedChange={(checked) => form.setValue(`requirements.${index}.required`, !!checked)}
                        />
                        <Label className="text-sm">Required</Label>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 5: Gallery */}
        {step === 5 && (
          <Card>
            <CardHeader>
              <CardTitle>Gallery</CardTitle>
              <CardDescription>
                Add images and video to showcase your work
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="border-2 border-dashed rounded-lg p-8 text-center">
                <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Upload Images</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Drag and drop or click to upload
                </p>
                <Button type="button" variant="outline" onClick={() => toast.info('In Development', { description: 'File upload integration is being built' })}>
                  Choose Files
                </Button>
                <p className="text-xs text-muted-foreground mt-2">
                  PNG, JPG up to 5MB. Recommended: 1280x720px
                </p>
              </div>

              <div>
                <Label>Video URL (Optional)</Label>
                <Input placeholder="YouTube or Vimeo URL" />
                <p className="text-xs text-muted-foreground mt-1">
                  Add a video to increase buyer engagement
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => setStep(s => s - 1)}
            disabled={step === 1}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>

          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => toast.info('Coming Soon', { description: 'Draft saving will be available soon' })}>
              <Save className="h-4 w-4 mr-1" />
              Save Draft
            </Button>

            {step < totalSteps ? (
              <Button type="button" onClick={() => setStep(s => s + 1)}>
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            ) : (
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Publishing...' : 'Publish Gig'}
              </Button>
            )}
          </div>
        </div>
      </form>
    </Form>
  );
}
