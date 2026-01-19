/**
 * Create Dispute Form - FreeFlow A+++ Implementation
 * Form to open a new dispute
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  AlertTriangle,
  FileText,
  Upload,
  X,
  HelpCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { toast } from 'sonner';
import {
  useDisputes,
  useDisputeTemplates,
  type DisputeType,
} from '@/lib/hooks/use-disputes';

interface CreateDisputeFormProps {
  orderId: string;
  orderTotal: number;
  orderTitle: string;
  currency?: string;
  onSuccess?: (disputeId: string) => void;
  onCancel?: () => void;
}

export function CreateDisputeForm({
  orderId,
  orderTotal,
  orderTitle,
  currency = 'USD',
  onSuccess,
  onCancel,
}: CreateDisputeFormProps) {
  const router = useRouter();
  const { createDispute, isCreating } = useDisputes();
  const { templates } = useDisputeTemplates();

  const [disputeType, setDisputeType] = useState<DisputeType | ''>('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [disputedAmount, setDisputedAmount] = useState(orderTotal.toString());
  const [evidenceUrls, setEvidenceUrls] = useState<string[]>([]);
  const [newEvidenceUrl, setNewEvidenceUrl] = useState('');

  // Get template for selected type
  const selectedTemplate = templates.find((t) => t.dispute_type === disputeType);

  const handleTypeChange = (type: DisputeType) => {
    setDisputeType(type);
    const template = templates.find((t) => t.dispute_type === type);
    if (template && !title) {
      setTitle(template.title);
    }
  };

  const handleAddEvidence = () => {
    if (newEvidenceUrl && !evidenceUrls.includes(newEvidenceUrl)) {
      setEvidenceUrls([...evidenceUrls, newEvidenceUrl]);
      setNewEvidenceUrl('');
    }
  };

  const handleRemoveEvidence = (url: string) => {
    setEvidenceUrls(evidenceUrls.filter((u) => u !== url));
  };

  const handleSubmit = async () => {
    if (!disputeType || !title || !description) {
      toast.error('Please fill in all required fields');
      return;
    }

    const amount = parseFloat(disputedAmount);
    if (isNaN(amount) || amount <= 0 || amount > orderTotal) {
      toast.error(`Disputed amount must be between 0 and ${orderTotal}`);
      return;
    }

    if (description.length < 50) {
      toast.error('Please provide a more detailed description (at least 50 characters)');
      return;
    }

    try {
      const result = await createDispute({
        order_id: orderId,
        dispute_type: disputeType,
        title,
        description,
        disputed_amount: amount,
        evidence_urls: evidenceUrls.length > 0 ? evidenceUrls : undefined,
      });

      toast.success('Dispute opened successfully');

      if (onSuccess) {
        onSuccess(result.dispute.id);
      } else {
        router.push(`/dashboard/disputes/${result.dispute.id}`);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to open dispute');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-orange-500" />
          Open a Dispute
        </CardTitle>
        <CardDescription>
          Report an issue with order: {orderTitle}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Dispute Type */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="type">Issue Type *</Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <HelpCircle className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">
                    Select the type that best describes your issue. This helps
                    us route your dispute to the right team.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Select value={disputeType} onValueChange={(v) => handleTypeChange(v as DisputeType)}>
            <SelectTrigger id="type">
              <SelectValue placeholder="Select issue type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="not_as_described">
                Not as Described - Work doesn&apos;t match requirements
              </SelectItem>
              <SelectItem value="quality_issue">
                Quality Issue - Work is below expected standards
              </SelectItem>
              <SelectItem value="late_delivery">
                Late Delivery - Order delivered after deadline
              </SelectItem>
              <SelectItem value="no_delivery">
                No Delivery - Work was never delivered
              </SelectItem>
              <SelectItem value="scope_creep">
                Scope Disagreement - Dispute about what was included
              </SelectItem>
              <SelectItem value="communication">
                Communication Issues - Seller unresponsive
              </SelectItem>
              <SelectItem value="refund_request">
                Refund Request - Requesting a refund
              </SelectItem>
              <SelectItem value="payment_issue">
                Payment Issue - Problem with payment
              </SelectItem>
              <SelectItem value="intellectual_property">
                IP Issue - Copyright or ownership dispute
              </SelectItem>
              <SelectItem value="harassment">
                Harassment - Inappropriate behavior
              </SelectItem>
              <SelectItem value="other">
                Other - Something else
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Template suggestions */}
        {selectedTemplate && (
          <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
            <h4 className="font-medium text-sm mb-2">Recommended Evidence</h4>
            <div className="flex flex-wrap gap-2">
              {selectedTemplate.required_evidence?.map((ev: string) => (
                <Badge key={ev} variant="outline">
                  {ev}
                </Badge>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Estimated resolution: {selectedTemplate.estimated_resolution_days} days
            </p>
          </div>
        )}

        {/* Title */}
        <div className="space-y-2">
          <Label htmlFor="title">Title *</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Brief summary of the issue"
            maxLength={200}
          />
          <p className="text-xs text-muted-foreground">
            {title.length}/200 characters
          </p>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description">Description *</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={
              selectedTemplate?.description_template ||
              'Describe the issue in detail. Include what you expected vs what you received, relevant dates, and any attempted resolutions.'
            }
            rows={6}
            maxLength={5000}
          />
          <p className="text-xs text-muted-foreground">
            {description.length}/5000 characters (minimum 50)
          </p>
        </div>

        {/* Disputed Amount */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="amount">Amount in Dispute *</Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <HelpCircle className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">
                    The amount you believe should be refunded. This can be the
                    full order amount or a partial amount.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg font-medium">{currency}</span>
            <Input
              id="amount"
              type="number"
              value={disputedAmount}
              onChange={(e) => setDisputedAmount(e.target.value)}
              min={0}
              max={orderTotal}
              step="0.01"
              className="max-w-[200px]"
            />
            <span className="text-sm text-muted-foreground">
              of {currency} {orderTotal.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Evidence URLs */}
        <div className="space-y-2">
          <Label>Evidence (optional)</Label>
          <p className="text-sm text-muted-foreground">
            Add links to screenshots, files, or other evidence. You can add more
            evidence after opening the dispute.
          </p>
          <div className="flex gap-2">
            <Input
              value={newEvidenceUrl}
              onChange={(e) => setNewEvidenceUrl(e.target.value)}
              placeholder="Paste URL to evidence file"
            />
            <Button
              type="button"
              variant="outline"
              onClick={handleAddEvidence}
              disabled={!newEvidenceUrl}
            >
              <Upload className="h-4 w-4" />
            </Button>
          </div>
          {evidenceUrls.length > 0 && (
            <div className="space-y-2 mt-2">
              {evidenceUrls.map((url, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 p-2 bg-muted rounded"
                >
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="flex-1 text-sm truncate">{url}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => handleRemoveEvidence(url)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Warning */}
        <div className="p-4 bg-yellow-50 dark:bg-yellow-950 rounded-lg border border-yellow-200 dark:border-yellow-800">
          <div className="flex gap-3">
            <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-yellow-800 dark:text-yellow-200">
                Before opening a dispute
              </p>
              <ul className="mt-1 text-yellow-700 dark:text-yellow-300 list-disc list-inside space-y-1">
                <li>
                  Try to resolve the issue directly with the seller first
                </li>
                <li>
                  Disputes may affect the seller&apos;s rating and your future
                  interactions
                </li>
                <li>
                  False or fraudulent disputes may result in account restrictions
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button
            onClick={handleSubmit}
            disabled={isCreating || !disputeType || !title || description.length < 50}
          >
            {isCreating ? 'Opening Dispute...' : 'Open Dispute'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default CreateDisputeForm;
