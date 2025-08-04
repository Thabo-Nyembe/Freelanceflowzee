import { Metadata } from 'next';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import ReviewManagementDashboard from '@/components/video/review-management-dashboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { InfoIcon } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Client Review Management | KAZI',
  description: 'Manage client review workflows and approval processes for your video projects',
};

// Define a type for your review object for better type safety
type Review = {
  status: 'in_review' | 'draft' | 'approved' | 'rejected';
  deadline?: string;
  completed_at?: string;
  started_at?: string;
  // Add other properties of review here based on your data structure
};

async function getReviewData(userId: string) {
  const supabase = createServerComponentClient({ cookies });
  
  try {
    // Get user&apos;s reviews
    const { data: reviews, error: reviewsError } = await supabase
      .from('client_reviews')
      .select(`
        *,
        video:videos(id, title, thumbnail_url, duration),
        project:projects(id, name),
        stages:review_stages(*),
        approvals:review_approvals(
          *,
          user:profiles(id, display_name, avatar_url)
        )
      `)
      .or(`created_by.eq.${userId},id.in.(${
        // Subquery for reviews where user is a collaborator
        await supabase
          .from('review_collaborators')
          .select('review_id')
          .eq('user_id', userId)
          .then(({ data }) => data?.map(c => c.review_id).join(',') || 'null')
      })`)
      .order('created_at', { ascending: false });

    if (reviewsError) {
      console.error('Error fetching reviews:', reviewsError);
      return { reviews: [], templates: [], stats: getDefaultStats() };
    }

    // Get templates
    const { data: templates, error: templatesError } = await supabase
      .from('review_templates')
      .select('*')
      .or(`is_public.eq.true,created_by.eq.${userId}`)
      .order('usage_count', { ascending: false });

    if (templatesError) {
      console.error('Error fetching templates:', templatesError);
    }

    // Calculate stats
    const stats = calculateReviewStats(reviews || []);

    return {
      reviews: reviews || [],
      templates: templates || [],
      stats
    };
  } catch (error) {
    console.error('Error in getReviewData:', error);
    return { reviews: [], templates: [], stats: getDefaultStats() };
  }
}

function getDefaultStats() {
  return {
    total_reviews: 0,
    pending_reviews: 0,
    approved_reviews: 0,
    rejected_reviews: 0,
    average_completion_time: 0,
    overdue_reviews: 0
  };
}

function calculateReviewStats(reviews: Review[]) {
  const now = new Date();
  
  const stats = {
    total_reviews: reviews.length,
    pending_reviews: 0,
    approved_reviews: 0,
    rejected_reviews: 0,
    average_completion_time: 0,
    overdue_reviews: 0
  };

  const completionTimes: number[] = [];

  reviews.forEach(review => {
    // Count by status
    switch (review.status) {
      case 'in_review':
      case 'draft':
        stats.pending_reviews++;
        break;
      case 'approved':
        stats.approved_reviews++;
        break;
      case 'rejected':
        stats.rejected_reviews++;
        break;
    }

    // Check if overdue
    if (review.deadline && new Date(review.deadline) < now && 
        !['approved', 'rejected'].includes(review.status)) {
      stats.overdue_reviews++;
    }

    // Calculate completion time for completed reviews
    if (review.completed_at && review.started_at) {
      const startTime = new Date(review.started_at).getTime();
      const endTime = new Date(review.completed_at).getTime();
      const durationHours = (endTime - startTime) / (1000 * 60 * 60);
      completionTimes.push(durationHours);
    }
  });

  // Calculate average completion time
  if (completionTimes.length > 0) {
    stats.average_completion_time = Math.round(
      completionTimes.reduce((sum, time) => sum + time, 0) / completionTimes.length
    );
  }

  return stats;
}

export default async function ReviewsPage() {
  const supabase = createServerComponentClient({ cookies });
  
  const {
    data: { user },
    error: authError
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect('/auth/signin');
  }

  const { reviews, templates, stats } = await getReviewData(user.id);

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Client Review Management</h1>
        <p className="text-muted-foreground">
          Create and manage approval workflows for your video projects
        </p>
      </div>

      {/* Getting Started Guide (for new users) */}
      {reviews.length === 0 && (
        <Alert>
          <InfoIcon className="h-4 w-4" />
          <AlertDescription className="space-y-2">
            <p className="font-medium">Welcome to Client Review Workflows!</p>
            <p>
              Streamline your client approval process by creating structured review workflows. 
              Get feedback, track approvals, and manage revisions all in one place.
            </p>
            <ul className="list-disc list-inside text-sm space-y-1 mt-2">
              <li>Create multi-stage approval workflows</li>
              <li>Invite clients and team members as reviewers</li>
              <li>Track progress with real-time status updates</li>
              <li>Consolidate feedback with timestamp-based comments</li>
              <li>Get automatic notifications for approvals and changes</li>
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Quick Stats Overview (if has data) */}
      {reviews.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Active Reviews
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pending_reviews}</div>
              <p className="text-xs text-muted-foreground">
                Currently in progress
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Approved This Month
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.approved_reviews}</div>
              <p className="text-xs text-muted-foreground">
                Successfully completed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Average Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.average_completion_time}h</div>
              <p className="text-xs text-muted-foreground">
                To complete reviews
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Overdue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.overdue_reviews}</div>
              <p className="text-xs text-muted-foreground">
                Need immediate attention
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Review Management Dashboard */}
      <ReviewManagementDashboard
        reviews={reviews}
        templates={templates}
        stats={stats}
        onCreateReview={async (_reviewData) => {
          'use server';
          // This would be handled by the client component
          // Server actions could be implemented here if needed
        }}
        onUpdateReview={async (_reviewId, _updates) => {
          'use server';
          // This would be handled by the client component
          // Server actions could be implemented here if needed
        }}
        onDeleteReview={async (_reviewId) => {
          'use server';
          // This would be handled by the client component
          // Server actions could be implemented here if needed
        }}
      />

      {/* Tips and Best Practices */}
      <Card>
        <CardHeader>
          <CardTitle>Review Workflow Best Practices</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-semibold">Setting Up Effective Workflows</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Start with simple single-stage approvals for new clients</li>
                <li>• Use multi-stage workflows for complex projects</li>
                <li>• Set realistic deadlines with buffer time</li>
                <li>• Include clear descriptions for each stage</li>
              </ul>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-semibold">Managing Client Expectations</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Communicate review timelines upfront</li>
                <li>• Provide clear instructions for reviewers</li>
                <li>• Use auto-notifications to keep everyone informed</li>
                <li>• Consolidate feedback before implementing changes</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 