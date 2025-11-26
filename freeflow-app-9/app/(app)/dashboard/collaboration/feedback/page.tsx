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
  priority: "low" | "medium" | "high";
  status: "open" | "in-progress" | "resolved" | "closed";
  author: string;
  authorAvatar?: string;
  createdAt: string;
  upvotes: number;
  downvotes: number;
  replies: FeedbackReply[];
  tags: string[];
  isStarred: boolean;
  isFlagged: boolean;
}

interface FeedbackReply {
  id: string;
  content: string;
  author: string;
  authorAvatar?: string;
  createdAt: string;
}

export default function FeedbackPage() {
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
  }, []);

  const fetchFeedbackData = async () => {
    try {
      setLoading(true);
      logger.info("Fetching feedback data");

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const mockFeedbacks: Feedback[] = [
        {
          id: "1",
          title: "Great collaboration features!",
          description:
            "The real-time collaboration tools are excellent. Would love to see more integration options.",
          category: "Feature Request",
          priority: "medium",
          status: "open",
          author: "John Doe",
          authorAvatar: "",
          createdAt: "2024-01-20",
          upvotes: 15,
          downvotes: 2,
          replies: [
            {
              id: "r1",
              content: "Thanks for the feedback! We're working on it.",
              author: "Admin",
              authorAvatar: "",
              createdAt: "2024-01-21",
            },
          ],
          tags: ["collaboration", "feature"],
          isStarred: true,
          isFlagged: false,
        },
        {
          id: "2",
          title: "Bug: Video call disconnects",
          description:
            "Video calls disconnect randomly after 10 minutes. This needs urgent attention.",
          category: "Bug Report",
          priority: "high",
          status: "in-progress",
          author: "Sarah Johnson",
          authorAvatar: "",
          createdAt: "2024-01-19",
          upvotes: 28,
          downvotes: 1,
          replies: [],
          tags: ["bug", "video", "urgent"],
          isStarred: false,
          isFlagged: true,
        },
        {
          id: "3",
          title: "UI improvements needed",
          description:
            "The dashboard could use some UI enhancements for better user experience.",
          category: "Improvement",
          priority: "low",
          status: "resolved",
          author: "Mike Chen",
          authorAvatar: "",
          createdAt: "2024-01-18",
          upvotes: 10,
          downvotes: 3,
          replies: [],
          tags: ["ui", "design"],
          isStarred: true,
          isFlagged: false,
        },
      ];

      setFeedbacks(mockFeedbacks);

      setStats({
        totalFeedback: mockFeedbacks.length,
        openFeedback: mockFeedbacks.filter((f) => f.status === "open").length,
        resolvedFeedback: mockFeedbacks.filter((f) => f.status === "resolved")
          .length,
        avgRating: 4.5,
      });

      logger.info("Feedback data fetched successfully");
      toast.success("Feedback loaded");
    } catch (error) {
      logger.error("Failed to fetch feedback data", { error });
      toast.error("Failed to load feedback");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFeedback = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    try {
      logger.info("Creating new feedback");

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 800));

      const newFeedback: Feedback = {
        id: Date.now().toString(),
        title: formData.get("feedbackTitle") as string,
        description: formData.get("feedbackDescription") as string,
        category: formData.get("feedbackCategory") as string,
        priority: formData.get("feedbackPriority") as "low" | "medium" | "high",
        status: "open",
        author: "Current User",
        createdAt: new Date().toISOString().split("T")[0],
        upvotes: 0,
        downvotes: 0,
        replies: [],
        tags: [],
        isStarred: false,
        isFlagged: false,
      };

      setFeedbacks([newFeedback, ...feedbacks]);
      setIsCreateOpen(false);

      logger.info("Feedback created successfully", {
        feedbackId: newFeedback.id,
      });
      toast.success("Feedback submitted successfully");
    } catch (error) {
      logger.error("Failed to create feedback", { error });
      toast.error("Failed to submit feedback");
    }
  };

  const handleUpvote = async (feedbackId: string) => {
    try {
      logger.info("Upvoting feedback", { feedbackId });

      setFeedbacks(
        feedbacks.map((f) =>
          f.id === feedbackId ? { ...f, upvotes: f.upvotes + 1 } : f
        )
      );

      logger.info("Feedback upvoted");
      toast.success("Upvoted");
    } catch (error) {
      logger.error("Failed to upvote", { error });
      toast.error("Failed to upvote");
    }
  };

  const handleDownvote = async (feedbackId: string) => {
    try {
      logger.info("Downvoting feedback", { feedbackId });

      setFeedbacks(
        feedbacks.map((f) =>
          f.id === feedbackId ? { ...f, downvotes: f.downvotes + 1 } : f
        )
      );

      logger.info("Feedback downvoted");
      toast.success("Downvoted");
    } catch (error) {
      logger.error("Failed to downvote", { error });
      toast.error("Failed to downvote");
    }
  };

  const handleToggleStar = async (feedbackId: string) => {
    try {
      logger.info("Toggling star", { feedbackId });

      setFeedbacks(
        feedbacks.map((f) =>
          f.id === feedbackId ? { ...f, isStarred: !f.isStarred } : f
        )
      );

      logger.info("Star toggled");
      toast.success("Star updated");
    } catch (error) {
      logger.error("Failed to toggle star", { error });
      toast.error("Failed to update star");
    }
  };

  const handleToggleFlag = async (feedbackId: string) => {
    try {
      logger.info("Toggling flag", { feedbackId });

      setFeedbacks(
        feedbacks.map((f) =>
          f.id === feedbackId ? { ...f, isFlagged: !f.isFlagged } : f
        )
      );

      logger.info("Flag toggled");
      toast.success("Flag updated");
    } catch (error) {
      logger.error("Failed to toggle flag", { error });
      toast.error("Failed to update flag");
    }
  };

  const handleChangeStatus = async (
    feedbackId: string,
    newStatus: Feedback["status"]
  ) => {
    try {
      logger.info("Changing status", { feedbackId, newStatus });

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      setFeedbacks(
        feedbacks.map((f) =>
          f.id === feedbackId ? { ...f, status: newStatus } : f
        )
      );

      logger.info("Status changed successfully");
      toast.success("Status updated");
    } catch (error) {
      logger.error("Failed to change status", { error });
      toast.error("Failed to update status");
    }
  };

  const handleAddReply = async (feedbackId: string) => {
    if (!replyText.trim()) return;

    try {
      logger.info("Adding reply", { feedbackId });

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      const newReply: FeedbackReply = {
        id: Date.now().toString(),
        content: replyText,
        author: "Current User",
        createdAt: new Date().toISOString().split("T")[0],
      };

      setFeedbacks(
        feedbacks.map((f) =>
          f.id === feedbackId
            ? { ...f, replies: [...f.replies, newReply] }
            : f
        )
      );

      setReplyText("");
      logger.info("Reply added successfully");
      toast.success("Reply added");
    } catch (error) {
      logger.error("Failed to add reply", { error });
      toast.error("Failed to add reply");
    }
  };

  const handleDeleteFeedback = async (feedbackId: string) => {
    try {
      logger.info("Deleting feedback", { feedbackId });

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      setFeedbacks(feedbacks.filter((f) => f.id !== feedbackId));

      logger.info("Feedback deleted successfully");
      toast.success("Feedback deleted");
    } catch (error) {
      logger.error("Failed to delete feedback", { error });
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
                      <SelectItem value="Bug Report">Bug Report</SelectItem>
                      <SelectItem value="Feature Request">
                        Feature Request
                      </SelectItem>
                      <SelectItem value="Improvement">Improvement</SelectItem>
                      <SelectItem value="General">General</SelectItem>
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
              <SelectItem value="Bug Report">Bug Report</SelectItem>
              <SelectItem value="Feature Request">Feature Request</SelectItem>
              <SelectItem value="Improvement">Improvement</SelectItem>
              <SelectItem value="General">General</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
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
                          <SelectItem value="in-progress">
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
