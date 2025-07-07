'use client'

import React from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react'

interface Reviewer {
  id: string
  name: string
  role: string
  status: 'pending' | 'approved' | 'rejected' | 'reviewing'
  comment?: string
  timestamp?: string
}

interface ApprovalWorkflowProps {
  contentId: string
  contentType: 'video' | 'document' | 'design'
  contentTitle: string
  contentDescription?: string
  reviewers: Reviewer[]
  onApprove?: (reviewerId: string, comment: string) => void
  onReject?: (reviewerId: string, comment: string) => void
  onAddReviewer?: (reviewerId: string) => void
  onRemoveReviewer?: (reviewerId: string) => void
}

const statusIcons = {
  pending: <Clock className="h-5 w-5 text-muted-foreground" />,
  approved: <CheckCircle className="h-5 w-5 text-green-500" />,
  rejected: <XCircle className="h-5 w-5 text-red-500" />,
  reviewing: <AlertCircle className="h-5 w-5 text-yellow-500" />,
}

const statusColors = {
  pending: 'bg-muted text-muted-foreground',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  reviewing: 'bg-yellow-100 text-yellow-800',
}

export default function ApprovalWorkflow({
  contentId,
  contentType,
  contentTitle,
  contentDescription,
  reviewers,
  onApprove,
  onReject,
  onAddReviewer,
  onRemoveReviewer,
}: ApprovalWorkflowProps) {
  const [comment, setComment] = React.useState('')
  const [selectedReviewer, setSelectedReviewer] = React.useState('')

  const handleAddReviewer = () => {
    if (selectedReviewer && onAddReviewer) {
      onAddReviewer(selectedReviewer)
      setSelectedReviewer('')
    }
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Approval Workflow</CardTitle>
        <CardDescription>
          Review and approve {contentType}: {contentTitle}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {contentDescription && (
          <div className="text-sm text-muted-foreground">{contentDescription}</div>
        )}

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">Reviewers</h3>
            <div className="flex items-center gap-2">
              <Select
                value={selectedReviewer}
                onValueChange={setSelectedReviewer}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Add reviewer" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="reviewer1">John Smith (Manager)</SelectItem>
                  <SelectItem value="reviewer2">Sarah Johnson (Lead)</SelectItem>
                  <SelectItem value="reviewer3">Mike Brown (Expert)</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleAddReviewer} size="sm">
                Add
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            {reviewers.map((reviewer) => (
              <div
                key={reviewer.id}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div className="flex items-center gap-3">
                  {statusIcons[reviewer.status]}
                  <div>
                    <p className="text-sm font-medium">{reviewer.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {reviewer.role}
                    </p>
                  </div>
                  <Badge className={statusColors[reviewer.status]}>
                    {reviewer.status}
                  </Badge>
                </div>
                {reviewer.comment && (
                  <p className="text-sm text-muted-foreground max-w-[300px] truncate">
                    {reviewer.comment}
                  </p>
                )}
                {reviewer.timestamp && (
                  <p className="text-xs text-muted-foreground">
                    {reviewer.timestamp}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-medium">Your Comment</h3>
          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Add your review comments here..."
            className="min-h-[100px]"
          />
        </div>
      </CardContent>
      <CardFooter className="flex justify-end space-x-2">
        <Button
          variant="outline"
          onClick={() => onReject?.(contentId, comment)}
          className="text-red-600 hover:text-red-600"
        >
          Reject
        </Button>
        <Button
          onClick={() => onApprove?.(contentId, comment)}
          className="bg-green-600 hover:bg-green-700"
        >
          Approve
        </Button>
      </CardFooter>
    </Card>
  )
} 