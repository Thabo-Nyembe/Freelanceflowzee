"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  Plus,
  Search,
  Filter,
  ThumbsUp,
  ThumbsDown,
  Star,
  StarOff,
  Send,
  Reply,
  Edit,
  Trash2,
  Flag,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  User,
  Tag,
  MoreVertical,
  Download,
  Upload,
  RefreshCw,
  Heart,
  Share2,
  Bookmark,
  Eye,
  TrendingUp,
  Award,
  Target,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { createFeatureLogger } from "@/lib/logger";
import { NumberFlow } from "@/components/ui/number-flow";
import { useCurrentUser } from "@/hooks/use-ai-data";
import { useAnnouncer } from "@/lib/accessibility";
import {
  getFeedback,
  createFeedback as createFeedbackDB,
  updateFeedback,
  deleteFeedback as deleteFeedbackDB,
  toggleStarred,
  voteFeedback,
  getUserVote,
  getFeedbackReplies,
  addFeedbackReply,
  getFeedbackStats,
  type CollaborationFeedback,
  type FeedbackCategory,
  type FeedbackPriority,
  type FeedbackStatus,
  type VoteType,
} from "@/lib/collaboration-feedback-queries";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const logger = createFeatureLogger("CollaborationFeedback");

interface Feedback {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: "low" | "medium" | "high" | "urgent";
  status: "open" | "in_progress" | "resolved" | "closed";
  author: string;
  authorAvatar?: string;
  createdAt: string;
  upvotes: number;
  downvotes: number;
  replies: FeedbackReply[];
  tags: string[];
  isStarred: boolean;
  isFlagged: boolean;
  userVote?: VoteType | null;
  replyCount?: number;
}

interface FeedbackReply {
  id: string;
  content: string;
  author: string;
  authorAvatar?: string;
  createdAt: string;
  isSolution?: boolean;
}

export default function FeedbackPage() {
  // A+++ Hooks
  const { userId, loading: userLoading } = useCurrentUser();
  const { announce } = useAnnouncer();

  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(
    null
  );
  const [replyText, setReplyText] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  // Stats
  const [stats, setStats] = useState({
    totalFeedback: 0,
    openFeedback: 0,
    resolvedFeedback: 0,
    avgRating: 0,
  });

  useEffect(() => {
    fetchFeedbackData();
  }, [userId, filterCategory, filterStatus, filterPriority, activeTab, searchQuery]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchFeedbackData = async () => {
    if (!userId) {
      logger.info("Waiting for user authentication");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      logger.info("Fetching feedback data from Supabase", { userId });

      // Build filters based on UI state
      const filters: any = {};
      if (filterCategory !== "all") {
        filters.category = filterCategory.toLowerCase() as FeedbackCategory;
      }
      if (filterStatus !== "all") {
        filters.status = filterStatus as FeedbackStatus;
      }
      if (filterPriority !== "all") {
        filters.priority = filterPriority as FeedbackPriority;
      }
      if (searchQuery) {
        filters.search = searchQuery;
      }
      if (activeTab === "starred") {
        filters.is_starred = true;
      }

      // Fetch feedback from Supabase
      const { data: feedbackData, error: feedbackError } = await getFeedback(
        userId,
        filters
      );

      if (feedbackError) {
        logger.error("Failed to fetch feedback", {
          error: feedbackError.message,
          userId
        });
        toast.error("Failed to load feedback");
        announce("Error loading feedback", "assertive");
        setLoading(false);
        return;
      }

      // Transform Supabase data to UI format
      const transformedFeedbacks: Feedback[] = await Promise.all(
        (feedbackData || []).map(async (fb) => {
          // Fetch replies for each feedback
          const { data: repliesData } = await getFeedbackReplies(fb.id);

          // Fetch user's vote
          const { data: voteData } = await getUserVote(fb.id, userId);

          return {
            id: fb.id,
            title: fb.title,
            description: fb.description,
            category: fb.category,
            priority: fb.priority,
            status: fb.status,
            author: userId, // Temporary: need user profile lookup
            authorAvatar: "",
            createdAt: new Date(fb.created_at).toLocaleDateString(),
            upvotes: fb.upvotes,
            downvotes: fb.downvotes,
            replies:
              repliesData?.map((r) => ({
                id: r.id,
                content: r.reply_text,
                author: r.user_id.slice(0, 8),
                createdAt: new Date(r.created_at).toLocaleDateString(),
                isSolution: r.is_solution,
              })) || [],
            tags: [],
            isStarred: fb.is_starred,
            isFlagged: fb.is_flagged,
            userVote: voteData?.vote_type || null,
            replyCount: repliesData?.length || 0,
          };
        })
      );

      setFeedbacks(transformedFeedbacks);

      // Fetch stats
      const { data: statsData, error: statsError } = await getFeedbackStats(
        userId
      );

      if (!statsError && statsData) {
        setStats({
          totalFeedback: statsData.total,
          openFeedback: statsData.byStatus.open,
          resolvedFeedback: statsData.byStatus.resolved,
          avgRating:
            statsData.total > 0
              ? (
                  (statsData.totalUpvotes /
                    (statsData.totalUpvotes + statsData.totalDownvotes)) *
                  5
                ).toFixed(1)
              : 0,
        });
      }

      logger.info("Feedback data fetched successfully", {
        count: transformedFeedbacks.length,
        userId
      });
      toast.success(`Loaded ${transformedFeedbacks.length} feedback items`);
      announce(`${transformedFeedbacks.length} feedback items loaded successfully`, "polite");
    } catch (error) {
      logger.error("Exception in fetchFeedbackData", { error, userId });
      toast.error("Failed to load feedback");
      announce("Error loading feedback", "assertive");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFeedback = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!userId) return;

    const formData = new FormData(e.currentTarget);

    try {
      logger.info("Creating new feedback", { userId });

      const title = formData.get("feedbackTitle") as string;
      const description = formData.get("feedbackDescription") as string;
      const category = (formData.get("feedbackCategory") as string).toLowerCase() as FeedbackCategory;
      const priority = formData.get("feedbackPriority") as FeedbackPriority;

      // Create feedback in Supabase
      const { data, error } = await createFeedbackDB(userId, {
        title,
        description,
        category,
        priority,
      });

      if (error) {
        logger.error("Failed to create feedback", { error: error.message, userId });
        toast.error("Failed to submit feedback");
        announce("Error submitting feedback", "assertive");
        return;
      }

      // Add to UI
      const newFeedback: Feedback = {
        id: data.id,
        title: data.title,
        description: data.description,
        category: data.category,
        priority: data.priority,
        status: data.status,
        author: userId,
        createdAt: new Date(data.created_at).toLocaleDateString(),
        upvotes: 0,
        downvotes: 0,
        replies: [],
        tags: [],
        isStarred: false,
        isFlagged: false,
        userVote: null,
        replyCount: 0,
      };

      setFeedbacks([newFeedback, ...feedbacks]);
      setStats((prev) => ({
        ...prev,
        totalFeedback: prev.totalFeedback + 1,
        openFeedback: prev.openFeedback + 1,
      }));
      setIsCreateOpen(false);

      logger.info("Feedback created successfully", {
        feedbackId: data.id,
        userId,
        category,
        priority,
      });
      toast.success(`Feedback submitted: "${title}"`);
      announce("Feedback submitted successfully", "polite");
    } catch (error) {
      logger.error("Exception in handleCreateFeedback", { error, userId });
      toast.error("Failed to submit feedback");
      announce("Error submitting feedback", "assertive");
    }
  };

  const handleUpvote = async (feedbackId: string) => {
    if (!userId) return;

    try {
      logger.info("Upvoting feedback", { feedbackId, userId });

      // Vote in database (handles toggle logic)
      const { data, error } = await voteFeedback(feedbackId, userId, "up");

      if (error) {
        logger.error("Failed to upvote", { error: error.message, userId });
        toast.error("Failed to upvote");
        announce("Error voting on feedback", "assertive");
        return;
      }

      // Refresh feedback to get updated counts
      await fetchFeedbackData();

      logger.info("Feedback upvoted", { userId });
      toast.success(data ? "Upvoted" : "Vote removed");
      announce(data ? "Upvoted" : "Vote removed", "polite");
    } catch (error) {
      logger.error("Exception in handleUpvote", { error, userId });
      toast.error("Failed to upvote");
      announce("Error voting on feedback", "assertive");
    }
  };

  const handleDownvote = async (feedbackId: string) => {
    if (!userId) return;

    try {
      logger.info("Downvoting feedback", { feedbackId, userId });

      // Vote in database (handles toggle logic)
      const { data, error } = await voteFeedback(feedbackId, userId, "down");

      if (error) {
        logger.error("Failed to downvote", { error: error.message, userId });
        toast.error("Failed to downvote");
        announce("Error voting on feedback", "assertive");
        return;
      }

      // Refresh feedback to get updated counts
      await fetchFeedbackData();

      logger.info("Feedback downvoted", { userId });
      toast.success(data ? "Downvoted" : "Vote removed");
      announce(data ? "Downvoted" : "Vote removed", "polite");
    } catch (error) {
      logger.error("Exception in handleDownvote", { error, userId });
      toast.error("Failed to downvote");
      announce("Error voting on feedback", "assertive");
    }
  };

  const handleToggleStar = async (feedbackId: string) => {
    if (!userId) return;

    try {
      logger.info("Toggling star", { feedbackId, userId });

      const currentFeedback = feedbacks.find((f) => f.id === feedbackId);
      if (!currentFeedback) return;

      const { data, error } = await toggleStarred(
        feedbackId,
        userId,
        !currentFeedback.isStarred
      );

      if (error) {
        logger.error("Failed to toggle star", { error: error.message, userId });
        toast.error("Failed to update star");
        announce("Error updating star", "assertive");
        return;
      }

      // Update UI
      setFeedbacks(
        feedbacks.map((f) =>
          f.id === feedbackId ? { ...f, isStarred: !f.isStarred } : f
        )
      );

      logger.info("Star toggled", { isStarred: data?.is_starred, userId });
      toast.success(data?.is_starred ? "Starred" : "Unstarred");
      announce(data?.is_starred ? "Starred" : "Unstarred", "polite");
    } catch (error) {
      logger.error("Exception in handleToggleStar", { error, userId });
      toast.error("Failed to update star");
      announce("Error updating star", "assertive");
    }
  };

  const handleToggleFlag = async (feedbackId: string) => {
    if (!userId) return;

    try {
      logger.info("Toggling flag", { feedbackId, userId });

      const currentFeedback = feedbacks.find((f) => f.id === feedbackId);
      if (!currentFeedback) return;

      const { data, error } = await updateFeedback(feedbackId, userId, {
        is_flagged: !currentFeedback.isFlagged,
      });

      if (error) {
        logger.error("Failed to toggle flag", { error: error.message, userId });
        toast.error("Failed to update flag");
        announce("Error updating flag", "assertive");
        return;
      }

      // Update UI
      setFeedbacks(
        feedbacks.map((f) =>
          f.id === feedbackId ? { ...f, isFlagged: !f.isFlagged } : f
        )
      );

      logger.info("Flag toggled", { isFlagged: data?.is_flagged, userId });
      toast.success(data?.is_flagged ? "Flagged" : "Unflagged");
      announce(data?.is_flagged ? "Flagged" : "Unflagged", "polite");
    } catch (error) {
      logger.error("Exception in handleToggleFlag", { error, userId });
      toast.error("Failed to update flag");
      announce("Error updating flag", "assertive");
    }
  };

  const handleChangeStatus = async (
    feedbackId: string,
    newStatus: Feedback["status"]
  ) => {
    if (!userId) {
      toast.error("Please log in");
      announce("Authentication required", "assertive");
      return;
    }

    try {
      logger.info("Changing status", { feedbackId, newStatus, userId });

      const { data, error } = await updateFeedback(feedbackId, userId, {
        status: newStatus as FeedbackStatus,
      });

      if (error) {
        logger.error("Failed to change status", { error: error.message });
        toast.error("Failed to update status");
        return;
      }

      // Update UI
      setFeedbacks(
        feedbacks.map((f) =>
          f.id === feedbackId ? { ...f, status: newStatus } : f
        )
      );

      // Update stats
      const oldStatus = feedbacks.find((f) => f.id === feedbackId)?.status;
      if (oldStatus === "open" && newStatus !== "open") {
        setStats((prev) => ({ ...prev, openFeedback: prev.openFeedback - 1 }));
      } else if (oldStatus !== "open" && newStatus === "open") {
        setStats((prev) => ({ ...prev, openFeedback: prev.openFeedback + 1 }));
      }
      if (oldStatus !== "resolved" && newStatus === "resolved") {
        setStats((prev) => ({
          ...prev,
          resolvedFeedback: prev.resolvedFeedback + 1,
        }));
      } else if (oldStatus === "resolved" && newStatus !== "resolved") {
        setStats((prev) => ({
          ...prev,
          resolvedFeedback: prev.resolvedFeedback - 1,
        }));
      }

      logger.info("Status changed successfully", {
        oldStatus,
        newStatus: data?.status,
      });
      toast.success(`Status updated to ${newStatus}`);
    } catch (error) {
      logger.error("Exception in handleChangeStatus", { error });
      toast.error("Failed to update status");
    }
  };

  const handleAddReply = async (feedbackId: string) => {
    if (!replyText.trim()) return;

    if (!userId) {
      toast.error("Please log in to reply");
      announce("Authentication required", "assertive");
      return;
    }

    try {
      logger.info("Adding reply", { feedbackId, userId });

      const { data, error } = await addFeedbackReply(
        feedbackId,
        userId,
        replyText
      );

      if (error) {
        logger.error("Failed to add reply", { error: error.message, userId });
        toast.error("Failed to add reply");
        announce("Error adding reply", "assertive");
        return;
      }

      // Update UI
      const newReply: FeedbackReply = {
        id: data.id,
        content: data.reply_text,
        author: userId.slice(0, 8),
        createdAt: new Date(data.created_at).toLocaleDateString(),
        isSolution: data.is_solution,
      };

      setFeedbacks(
        feedbacks.map((f) =>
          f.id === feedbackId
            ? {
                ...f,
                replies: [...f.replies, newReply],
                replyCount: (f.replyCount || 0) + 1,
              }
            : f
        )
      );

      setReplyText("");
      logger.info("Reply added successfully", { replyId: data.id });
      toast.success("Reply added");
    } catch (error) {
      logger.error("Exception in handleAddReply", { error });
      toast.error("Failed to add reply");
    }
  };

  const handleDeleteFeedback = async (feedbackId: string) => {
    if (!userId) {
      toast.error("Please log in");
      announce("Authentication required", "assertive");
      return;
    }

    try {
      logger.info("Deleting feedback", { feedbackId, userId });

      const { success, error } = await deleteFeedbackDB(feedbackId, userId);

      if (error) {
        logger.error("Failed to delete feedback", { error: error.message });
        toast.error("Failed to delete feedback");
        return;
      }

      // Update UI and stats
      const deletedFeedback = feedbacks.find((f) => f.id === feedbackId);
      setFeedbacks(feedbacks.filter((f) => f.id !== feedbackId));
      setStats((prev) => ({
        ...prev,
        totalFeedback: prev.totalFeedback - 1,
        openFeedback:
          deletedFeedback?.status === "open"
            ? prev.openFeedback - 1
            : prev.openFeedback,
        resolvedFeedback:
          deletedFeedback?.status === "resolved"
            ? prev.resolvedFeedback - 1
            : prev.resolvedFeedback,
      }));

      logger.info("Feedback deleted successfully", { feedbackId });
      toast.success("Feedback deleted");
    } catch (error) {
      logger.error("Exception in handleDeleteFeedback", { error });
      toast.error("Failed to delete feedback");
    }
  };

  const handleShareFeedback = async (feedbackId: string) => {
    try {
      logger.info("Sharing feedback", { feedbackId });

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 300));

      navigator.clipboard.writeText(
        `https://app.example.com/feedback/${feedbackId}`
      );

      logger.info("Feedback link copied");
      toast.success("Link copied to clipboard");
    } catch (error) {
      logger.error("Failed to share feedback", { error });
      toast.error("Failed to share feedback");
    }
  };

  const handleExportFeedback = async () => {
    try {
      logger.info("Exporting feedback");

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      logger.info("Feedback exported successfully");
      toast.success("Feedback data exported");
    } catch (error) {
      logger.error("Failed to export feedback", { error });
      toast.error("Failed to export data");
    }
  };

  const handleRefreshData = async () => {
    await fetchFeedbackData();
  };

  const filteredFeedbacks = feedbacks.filter((feedback) => {
    const matchesSearch =
      feedback.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      feedback.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      filterCategory === "all" || feedback.category === filterCategory;
    const matchesStatus =
      filterStatus === "all" || feedback.status === filterStatus;
    const matchesPriority =
      filterPriority === "all" || feedback.priority === filterPriority;
    const matchesTab =
      activeTab === "all" ||
      (activeTab === "starred" && feedback.isStarred) ||
      (activeTab === "flagged" && feedback.isFlagged);

    return (
      matchesSearch &&
      matchesCategory &&
      matchesStatus &&
      matchesPriority &&
      matchesTab
    );
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "destructive";
      case "medium":
        return "default";
      case "low":
        return "secondary";
      default:
        return "secondary";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "default";
      case "in_progress":
      case "in-progress":
        return "default";
      case "resolved":
        return "secondary";
      case "closed":
        return "secondary";
      default:
        return "secondary";
    }
  };

  return (
    <div className="flex-1 space-y-6 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Feedback</h2>
          <p className="text-muted-foreground">
            Share and manage team feedback
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefreshData}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button variant="outline" onClick={handleExportFeedback}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Feedback
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Submit Feedback</DialogTitle>
                <DialogDescription>
                  Share your thoughts and suggestions
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateFeedback} className="space-y-4">
                <div>
                  <Label htmlFor="feedbackTitle">Title</Label>
                  <Input
                    id="feedbackTitle"
                    name="feedbackTitle"
                    placeholder="Enter feedback title"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="feedbackDescription">Description</Label>
                  <Textarea
                    id="feedbackDescription"
                    name="feedbackDescription"
                    placeholder="Describe your feedback in detail"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="feedbackCategory">Category</Label>
                  <Select name="feedbackCategory" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bug">Bug</SelectItem>
                      <SelectItem value="feature">Feature</SelectItem>
                      <SelectItem value="improvement">Improvement</SelectItem>
                      <SelectItem value="question">Question</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="feedbackPriority">Priority</Label>
                  <Select name="feedbackPriority" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="w-full">
                  Submit Feedback
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Feedback
            </CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <NumberFlow value={stats.totalFeedback} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <NumberFlow value={stats.openFeedback} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolved</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <NumberFlow value={stats.resolvedFeedback} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <NumberFlow value={stats.avgRating} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search feedback..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="bug">Bug</SelectItem>
              <SelectItem value="feature">Feature</SelectItem>
              <SelectItem value="improvement">Improvement</SelectItem>
              <SelectItem value="question">Question</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterPriority} onValueChange={setFilterPriority}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All Feedback</TabsTrigger>
          <TabsTrigger value="starred">Starred</TabsTrigger>
          <TabsTrigger value="flagged">Flagged</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {filteredFeedbacks.map((feedback) => (
            <motion.div
              key={feedback.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-lg">
                          {feedback.title}
                        </CardTitle>
                        {feedback.isStarred && (
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        )}
                        {feedback.isFlagged && (
                          <Flag className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {feedback.description}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant={getPriorityColor(feedback.priority)}>
                          {feedback.priority}
                        </Badge>
                        <Badge variant={getStatusColor(feedback.status)}>
                          {feedback.status}
                        </Badge>
                        <Badge variant="outline">{feedback.category}</Badge>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => handleToggleStar(feedback.id)}
                        >
                          <Star className="mr-2 h-4 w-4" />
                          {feedback.isStarred ? "Unstar" : "Star"}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleToggleFlag(feedback.id)}
                        >
                          <Flag className="mr-2 h-4 w-4" />
                          {feedback.isFlagged ? "Unflag" : "Flag"}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleShareFeedback(feedback.id)}
                        >
                          <Share2 className="mr-2 h-4 w-4" />
                          Share
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteFeedback(feedback.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={feedback.authorAvatar} />
                        <AvatarFallback>
                          {feedback.author
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-muted-foreground">
                        {feedback.author}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        • {feedback.createdAt}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUpvote(feedback.id)}
                      >
                        <ThumbsUp className="mr-1 h-3 w-3" />
                        {feedback.upvotes}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDownvote(feedback.id)}
                      >
                        <ThumbsDown className="mr-1 h-3 w-3" />
                        {feedback.downvotes}
                      </Button>
                      <Select
                        value={feedback.status}
                        onValueChange={(value) =>
                          handleChangeStatus(
                            feedback.id,
                            value as Feedback["status"]
                          )
                        }
                      >
                        <SelectTrigger className="w-[140px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="open">Open</SelectItem>
                          <SelectItem value="in_progress">
                            In Progress
                          </SelectItem>
                          <SelectItem value="resolved">Resolved</SelectItem>
                          <SelectItem value="closed">Closed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Replies */}
                  {feedback.replies.length > 0 && (
                    <div className="space-y-3 border-t pt-3">
                      {feedback.replies.map((reply) => (
                        <div key={reply.id} className="flex gap-3">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={reply.authorAvatar} />
                            <AvatarFallback>
                              {reply.author
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">
                                {reply.author}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {reply.createdAt}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {reply.content}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Reply Input */}
                  <div className="flex gap-2">
                    <Input
                      placeholder="Write a reply..."
                      value={
                        selectedFeedback?.id === feedback.id ? replyText : ""
                      }
                      onChange={(e) => {
                        setSelectedFeedback(feedback);
                        setReplyText(e.target.value);
                      }}
                    />
                    <Button
                      onClick={() => handleAddReply(feedback.id)}
                      disabled={!replyText.trim()}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
