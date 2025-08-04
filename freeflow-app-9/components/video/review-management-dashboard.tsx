"use client";

import { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Plus,
  Search,
  Filter,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Users,
  Calendar,
  Eye,
  Edit,
  Share,
  MoreHorizontal,
  FileText,
  TrendingUp,
  BarChart3,
  Mail,
  Settings
} from 'lucide-react';
import { ClientReview, ReviewStage } from './client-review-panel';

export interface ReviewTemplate {
  id: string;
  name: string;
  description: string;
  stages: Omit<ReviewStage, 'id'>[];
  category: 'basic' | 'detailed' | 'client-approval' | 'team-review';
  is_public: boolean;
}

export interface ReviewStats {
  total_reviews: number;
  pending_reviews: number;
  approved_reviews: number;
  rejected_reviews: number;
  average_completion_time: number;
  overdue_reviews: number;
}

export interface ReviewManagementDashboardProps {
  reviews: ClientReview[];
  templates: ReviewTemplate[];
  stats: ReviewStats;
  onCreateReview?: (reviewData: Partial<ClientReview>) => void;
  onUpdateReview?: (reviewId: string, updates: Partial<ClientReview>) => void;
  onDeleteReview?: (reviewId: string) => void;
  className?: string;
}

export default function ReviewManagementDashboard({
  reviews, templates, stats, onCreateReview, onUpdateReview, onDeleteReview, className
}: ReviewManagementDashboardProps) {
  const [searchQuery, setSearchQuery] = useState<any>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState<any>(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [newReview, setNewReview] = useState<any>({
    title: '',
    description: '',
    deadline: '',
    client_emails: '',
    require_all_approvals: true,
    auto_advance_stages: false
  });

  const filteredReviews = reviews.filter(review => {
    const matchesSearch = review.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         review.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || review.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-500';
      case 'rejected': return 'bg-red-500';
      case 'changes_requested': return 'bg-yellow-500';
      case 'in_review': return 'bg-blue-500';
      case 'draft': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="w-4 h-4" />;
      case 'rejected': return <XCircle className="w-4 h-4" />;
      case 'changes_requested': return <AlertTriangle className="w-4 h-4" />;
      case 'in_review': return <Clock className="w-4 h-4" />;
      case 'draft': return <FileText className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const calculateReviewProgress = (review: ClientReview) => {
    const completedStages = review.stages.filter(stage => {
      const stageApprovals = review.approvals.filter(approval => approval.stage_id === stage.id);
      const approvedCount = stageApprovals.filter(approval => approval.status === 'approved').length;
      return approvedCount >= stage.required_approvals;
    }).length;
    
    return (completedStages / review.stages.length) * 100;
  };

  const isOverdue = (deadline?: string) => {
    if (!deadline) return false;
    return new Date(deadline) < new Date();
  };

  const handleCreateReview = useCallback(() => {
    const template = templates.find(t => t.id === selectedTemplate);
    if (!template) return;

    const reviewData: Partial<ClientReview> = {
      title: newReview.title,
      description: newReview.description,
      deadline: newReview.deadline || undefined,
      status: 'draft',
      stages: template.stages.map((stage, index) => ({
        ...stage,
        id: `stage-${index + 1}`,
      })),
      settings: {
        allow_comments: true,
        require_all_approvals: newReview.require_all_approvals,
        auto_advance_stages: newReview.auto_advance_stages,
        send_notifications: true
      },
      approvals: [],
      started_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    onCreateReview?.(reviewData);
    setIsCreateDialogOpen(false);
    setNewReview({
      title: '',
      description: '',
      deadline: '',
      client_emails: '',
      require_all_approvals: true,
      auto_advance_stages: false
    });
    setSelectedTemplate('');
  }, [newReview, selectedTemplate, templates, onCreateReview]);

  const defaultTemplates: ReviewTemplate[] = [
    {
      id: 'basic-approval',
      name: 'Basic Approval',
      description: 'Simple single-stage client approval',
      stages: [
        {
          name: 'Client Approval',
          description: 'Final client approval for deliverable',
          order: 1,
          required_approvals: 1,
          auto_advance: false
        }
      ],
      category: 'basic',
      is_public: true
    },
    {
      id: 'detailed-review',
      name: 'Detailed Review Process',
      description: 'Multi-stage review with internal and client approval',
      stages: [
        {
          name: 'Internal Review',
          description: 'Team review before client presentation',
          order: 1,
          required_approvals: 1,
          auto_advance: true
        },
        {
          name: 'Client Review',
          description: 'Client feedback and approval',
          order: 2,
          required_approvals: 1,
          auto_advance: false
        },
        {
          name: 'Final Approval',
          description: 'Final sign-off and project completion',
          order: 3,
          required_approvals: 1,
          auto_advance: false
        }
      ],
      category: 'detailed',
      is_public: true
    }
  ];

  const availableTemplates = [...templates, ...defaultTemplates];

  return (
    <div className={cn("space-y-6", className)}>
      {/* Dashboard Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Review Management</h1>
          <p className="text-muted-foreground">
            Manage client review workflows and approval processes
          </p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              New Review
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Review Workflow</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Template Selection */}
              <div className="space-y-2">
                <Label>Review Template</Label>
                <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a review template" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTemplates.map(template => (
                      <SelectItem key={template.id} value={template.id}>
                        <div>
                          <div className="font-medium">{template.name}</div>
                          <div className="text-sm text-muted-foreground">{template.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Review Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Review Title</Label>
                  <Input
                    id="title"
                    value={newReview.title}
                    onChange={(e) => setNewReview(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Video Review - Project Name"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="deadline">Deadline (Optional)</Label>
                  <Input
                    id="deadline"
                    type="datetime-local"
                    value={newReview.deadline}
                    onChange={(e) => setNewReview(prev => ({ ...prev, deadline: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newReview.description}
                  onChange={(e) => setNewReview(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe what needs to be reviewed..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="client_emails">Reviewer Emails</Label>
                <Input
                  id="client_emails"
                  value={newReview.client_emails}
                  onChange={(e) => setNewReview(prev => ({ ...prev, client_emails: e.target.value }))}
                  placeholder="client@example.com, reviewer2@example.com"
                />
                <p className="text-xs text-muted-foreground">
                  Comma-separated list of reviewer email addresses
                </p>
              </div>

              {/* Settings */}
              <div className="space-y-3">
                <Label>Review Settings</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="require_all"
                      checked={newReview.require_all_approvals}
                      onChange={(e) => setNewReview(prev => ({ ...prev, require_all_approvals: e.target.checked }))}
                    />
                    <Label htmlFor="require_all" className="text-sm">
                      Require all reviewers to approve
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="auto_advance"
                      checked={newReview.auto_advance_stages}
                      onChange={(e) => setNewReview(prev => ({ ...prev, auto_advance_stages: e.target.checked }))}
                    />
                    <Label htmlFor="auto_advance" className="text-sm">
                      Auto-advance through stages
                    </Label>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button 
                  onClick={handleCreateReview}
                  disabled={!newReview.title || !selectedTemplate}
                  className="flex-1"
                >
                  Create Review
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <FileText className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">Total Reviews</span>
            </div>
            <div className="text-2xl font-bold mt-2">{stats.total_reviews}</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-yellow-500" />
              <span className="text-sm font-medium">Pending</span>
            </div>
            <div className="text-2xl font-bold mt-2">{stats.pending_reviews}</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium">Approved</span>
            </div>
            <div className="text-2xl font-bold mt-2">{stats.approved_reviews}</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <span className="text-sm font-medium">Overdue</span>
            </div>
            <div className="text-2xl font-bold mt-2">{stats.overdue_reviews}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search reviews..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="in_review">In Review</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="changes_requested">Changes Requested</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Reviews List */}
      <div className="space-y-4">
        {filteredReviews.length > 0 ? (
          filteredReviews.map(review => (
            <Card key={review.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-3">
                    {/* Review Header */}
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-lg">{review.title}</h3>
                      <Badge className={cn("text-white", getStatusColor(review.status))}>
                        {getStatusIcon(review.status)}
                        <span className="ml-1 capitalize">{review.status.replace('_', ' ')}</span>
                      </Badge>
                      {isOverdue(review.deadline) && (
                        <Badge variant="destructive">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          Overdue
                        </Badge>
                      )}
                    </div>

                    {/* Review Details */}
                    {review.description && (
                      <p className="text-muted-foreground">{review.description}</p>
                    )}

                    {/* Progress and Stats */}
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-2">
                        <Progress value={calculateReviewProgress(review)} className="w-32 h-2" />
                        <span className="text-sm text-muted-foreground">
                          {Math.round(calculateReviewProgress(review))}% Complete
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {review.approvals.length} reviewers
                        </div>
                        
                        {review.deadline && (
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(review.deadline).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Recent Activity */}
                    {review.approvals.length > 0 && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Latest:</span>
                        {review.approvals.slice(-3).map(approval => (
                          <Avatar key={approval.id} className="w-6 h-6">
                            <AvatarImage src={approval.user_avatar} alt={approval.user_name} />
                            <AvatarFallback className="text-xs">
                              {approval.user_name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                    <Button variant="outline" size="sm">
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    <Button variant="outline" size="sm">
                      <Share className="w-4 h-4 mr-1" />
                      Share
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No reviews found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery || statusFilter !== 'all' 
                  ? 'Try adjusting your search or filters'
                  : 'Create your first review workflow to get started'
                }
              </p>
              {!searchQuery && statusFilter === 'all' && (
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Review
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
} 