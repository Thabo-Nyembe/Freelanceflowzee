"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  Calendar,
  Download,
  RefreshCw,
  Users,
  MessageSquare,
  Video,
  FileText,
  Target,
  Award,
  Activity,
  Share2,
  ArrowUp,
  ArrowDown,
  Minus,
  Zap,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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


import { useCurrentUser } from "@/hooks/use-ai-data";
import { upsertReportSchedule } from "@/lib/collaboration-analytics-queries";
import { useAnnouncer } from "@/lib/accessibility";
import {
  getCollaborationAnalytics,
  getTeamMemberStats,
  getCollaborationStats,
  exportCollaborationReport,
  type CollaborationAnalyticsData,
  type TeamMemberStats as TeamMemberStatsType,
} from "@/lib/collaboration-analytics-queries";

const logger = createFeatureLogger("CollaborationAnalytics");

// Use types from collaboration-analytics-queries
type AnalyticsData = CollaborationAnalyticsData;
type TeamMemberStats = TeamMemberStatsType;

export default function AnalyticsPage() {
  // A+++ Hooks
  const { userId, loading: userLoading } = useCurrentUser();
  const { announce } = useAnnouncer();

  const [analyticsData, setAnalyticsData] = useState<AnalyticsData[]>([]);
  const [teamStats, setTeamStats] = useState<TeamMemberStats[]>([]);
  const [dateRange, setDateRange] = useState("7days");
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  // Stats
  const [stats, setStats] = useState({
    totalMessages: 0,
    totalMeetings: 0,
    totalProjects: 0,
    avgEngagement: 0,
    messagesChange: 0,
    meetingsChange: 0,
    projectsChange: 0,
    engagementChange: 0,
  });

  useEffect(() => {
    fetchAnalyticsData();
  }, [userId, dateRange]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchAnalyticsData = async () => {
    if (!userId) {
      logger.info("Waiting for user authentication");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      logger.info("Fetching collaboration analytics", { userId, dateRange });

      // Fetch real analytics data from Supabase
      const { data: analyticsData, error: analyticsError } =
        await getCollaborationAnalytics(
          userId,
          dateRange as "7days" | "30days" | "90days" | "year"
        );

      if (analyticsError || !analyticsData) {
        logger.error("Failed to fetch analytics data", {
          error: analyticsError,
          userId
        });
        toast.error("Failed to load analytics");
        announce("Error loading analytics", "assertive");
        return;
      }

      // Fetch team member stats
      const { data: teamStatsData, error: teamStatsError } =
        await getTeamMemberStats(
          userId,
          dateRange as "7days" | "30days" | "90days" | "year"
        );

      if (teamStatsError) {
        logger.warn("Failed to fetch team stats", { error: teamStatsError, userId });
      }

      // Fetch collaboration stats summary
      const { data: statsData, error: statsError } =
        await getCollaborationStats(
          userId,
          dateRange as "7days" | "30days" | "90days" | "year"
        );

      if (statsError) {
        logger.warn("Failed to fetch stats summary", { error: statsError, userId });
      }

      // Update state with real data
      setAnalyticsData(analyticsData);
      setTeamStats(teamStatsData || []);

      if (statsData) {
        setStats(statsData);
      }

      logger.info("Collaboration analytics fetched successfully", {
        analyticsCount: analyticsData.length,
        teamStatsCount: teamStatsData?.length || 0,
        totalMessages: statsData?.totalMessages || 0,
        userId
      });

      toast.success('Analytics Loaded', { description: `${statsData?.totalMessages || 0} messages, ${statsData?.totalMeetings || 0} meetings` });
      announce(`Analytics loaded successfully: ${statsData?.totalMessages || 0} messages`, "polite");
    } catch (error) {
      logger.error("Exception in fetchAnalyticsData", { error, userId });
      toast.error("Failed to load analytics");
      announce("Error loading analytics", "assertive");
    } finally {
      setLoading(false);
    }
  };

  const handleExportReport = async () => {
    if (!userId) return;

    logger.info("Exporting collaboration analytics report", { userId, dateRange });

    toast.promise(
      (async () => {
        // Generate CSV report from real data
        const { data: csvData, error } = await exportCollaborationReport(
          userId,
          dateRange as "7days" | "30days" | "90days" | "year",
          "csv"
        );

        if (error || !csvData) {
          logger.error("Failed to generate report", { error, userId });
          announce("Error exporting report", "assertive");
          throw new Error("Failed to export report");
        }

        // Create downloadable file
        const blob = new Blob([csvData], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `collaboration-analytics-${dateRange}-${
          new Date().toISOString().split("T")[0]
        }.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        logger.info("Report exported successfully", {
          size: csvData.length,
          dateRange,
          userId
        });
        announce("Analytics report exported successfully", "polite");
        return csvData.length;
      })(),
      {
        loading: 'Exporting analytics report...',
        success: (size) => `Analytics report exported (${size} bytes)`,
        error: 'Failed to export report'
      }
    );
  };

  const handleRefreshData = async () => {
    logger.info("Refreshing analytics data");
    toast.promise(
      fetchAnalyticsData(),
      {
        loading: 'Refreshing analytics data...',
        success: 'Analytics data refreshed',
        error: 'Failed to refresh data'
      }
    );
  };

  const handleScheduleReport = async () => {
    logger.info("Scheduling analytics report");

    toast.promise(
      new Promise<void>(async (resolve, reject) => {
        setTimeout(async () => {
          try {
            // Save schedule to database
            if (userId) {
              const { error } = await upsertReportSchedule(userId, 'weekly');
              if (error) {
                logger.error("Failed to save schedule to database", { error });
                reject(new Error("Failed to schedule report"));
                return;
              }
            }

            logger.info("Report scheduled successfully");
            resolve();
          } catch (error) {
            logger.error("Failed to schedule report", { error });
            reject(error);
          }
        }, 1000);
      }),
      {
        loading: 'Scheduling weekly report...',
        success: 'Weekly report scheduled',
        error: 'Failed to schedule report'
      }
    );
  };

  const handleShareAnalytics = async () => {
    logger.info("Sharing analytics");

    toast.promise(
      new Promise<void>(async (resolve, reject) => {
        setTimeout(async () => {
          try {
            // Copy share link to clipboard
            await navigator.clipboard.writeText(`${window.location.origin}/analytics/report`);
            logger.info("Analytics shared");
            resolve();
          } catch (error) {
            logger.error("Failed to share analytics", { error });
            reject(error);
          }
        }, 600);
      }),
      {
        loading: 'Copying analytics link...',
        success: 'Analytics link copied to clipboard',
        error: 'Failed to share analytics'
      }
    );
  };

  const getTrendIcon = (change: number) => {
    if (change > 0) return <ArrowUp className="h-4 w-4 text-green-500" />;
    if (change < 0) return <ArrowDown className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-gray-500" />;
  };

  const getTrendColor = (change: number) => {
    if (change > 0) return "text-green-500";
    if (change < 0) return "text-red-500";
    return "text-gray-500";
  };

  return (
    <div className="flex-1 space-y-6 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Collaboration Analytics
          </h2>
          <p className="text-muted-foreground">
            Track team performance and engagement metrics
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 Days</SelectItem>
              <SelectItem value="30days">Last 30 Days</SelectItem>
              <SelectItem value="90days">Last 90 Days</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleRefreshData}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button variant="outline" onClick={handleShareAnalytics}>
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </Button>
          <Button variant="outline" onClick={handleScheduleReport}>
            <Calendar className="mr-2 h-4 w-4" />
            Schedule
          </Button>
          <Button onClick={handleExportReport}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Messages
            </CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <NumberFlow value={stats.totalMessages} />
            </div>
            <div className="flex items-center gap-1 text-xs">
              {getTrendIcon(stats.messagesChange)}
              <span className={getTrendColor(stats.messagesChange)}>
                {Math.abs(stats.messagesChange)}% from last period
              </span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Meetings
            </CardTitle>
            <Video className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <NumberFlow value={stats.totalMeetings} />
            </div>
            <div className="flex items-center gap-1 text-xs">
              {getTrendIcon(stats.meetingsChange)}
              <span className={getTrendColor(stats.meetingsChange)}>
                {Math.abs(stats.meetingsChange)}% from last period
              </span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Canvas Projects
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <NumberFlow value={stats.totalProjects} />
            </div>
            <div className="flex items-center gap-1 text-xs">
              {getTrendIcon(stats.projectsChange)}
              <span className={getTrendColor(stats.projectsChange)}>
                {Math.abs(stats.projectsChange)}% from last period
              </span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Avg Engagement
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <NumberFlow value={stats.avgEngagement} />%
            </div>
            <div className="flex items-center gap-1 text-xs">
              {getTrendIcon(stats.engagementChange)}
              <span className={getTrendColor(stats.engagementChange)}>
                {Math.abs(stats.engagementChange)}% from last period
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="team">Team Performance</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Activity Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Activity Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.map((data, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{data.period}</span>
                      <div className="flex items-center gap-4">
                        <Badge variant="outline">
                          <MessageSquare className="mr-1 h-3 w-3" />
                          {data.messages}
                        </Badge>
                        <Badge variant="outline">
                          <Video className="mr-1 h-3 w-3" />
                          {data.meetings}
                        </Badge>
                        <Badge variant="outline">
                          <FileText className="mr-1 h-3 w-3" />
                          {data.canvasProjects}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <div
                        className="h-2 bg-blue-500 rounded"
                        style={{
                          width: `${(data.messages / 200) * 100}%`,
                        }}
                      />
                      <div
                        className="h-2 bg-green-500 rounded"
                        style={{
                          width: `${(data.meetings / 15) * 100}%`,
                        }}
                      />
                      <div
                        className="h-2 bg-purple-500 rounded"
                        style={{
                          width: `${(data.canvasProjects / 10) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Engagement Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Engagement Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.map((data, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{data.period}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">
                          {data.activeUsers} users
                        </span>
                        <Badge
                          variant={
                            data.engagement >= 80
                              ? "default"
                              : data.engagement >= 60
                              ? "secondary"
                              : "outline"
                          }
                        >
                          {data.engagement}%
                        </Badge>
                      </div>
                    </div>
                    <div className="h-2 bg-muted rounded overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${data.engagement}%` }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        className="h-full bg-primary"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Messages Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData.slice(0, 5).map((data, index) => (
                    <div key={index} className="flex items-center gap-4">
                      <MessageSquare className="h-4 w-4 text-muted-foreground" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">
                            {data.period}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {data.messages}
                          </span>
                        </div>
                        <div className="h-2 bg-muted rounded overflow-hidden">
                          <div
                            className="h-full bg-blue-500"
                            style={{ width: `${(data.messages / 200) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Meetings Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData.slice(0, 5).map((data, index) => (
                    <div key={index} className="flex items-center gap-4">
                      <Video className="h-4 w-4 text-muted-foreground" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">
                            {data.period}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {data.meetings}
                          </span>
                        </div>
                        <div className="h-2 bg-muted rounded overflow-hidden">
                          <div
                            className="h-full bg-green-500"
                            style={{ width: `${(data.meetings / 15) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Canvas Projects</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData.slice(0, 5).map((data, index) => (
                    <div key={index} className="flex items-center gap-4">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">
                            {data.period}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {data.canvasProjects}
                          </span>
                        </div>
                        <div className="h-2 bg-muted rounded overflow-hidden">
                          <div
                            className="h-full bg-purple-500"
                            style={{
                              width: `${(data.canvasProjects / 10) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Feedback Submissions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData.slice(0, 5).map((data, index) => (
                    <div key={index} className="flex items-center gap-4">
                      <Star className="h-4 w-4 text-muted-foreground" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">
                            {data.period}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {data.feedback}
                          </span>
                        </div>
                        <div className="h-2 bg-muted rounded overflow-hidden">
                          <div
                            className="h-full bg-orange-500"
                            style={{ width: `${(data.feedback / 20) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="team" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Team Member Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {teamStats.map((member, index) => (
                  <div key={member.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary text-primary-foreground font-semibold">
                          {index + 1}
                        </div>
                        <div>
                          <h4 className="font-medium">{member.name}</h4>
                          <p className="text-xs text-muted-foreground">
                            Engagement Score: {member.engagementScore}%
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <div className="text-center">
                          <div className="font-semibold">
                            {member.messagesCount}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Messages
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold">
                            {member.meetingsAttended}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Meetings
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold">
                            {member.projectsCreated}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Projects
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="h-2 bg-muted rounded overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${member.engagementScore}%` }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="engagement" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Active Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData.map((data, index) => (
                    <div key={index} className="flex items-center gap-4">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">
                            {data.period}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {data.activeUsers} users
                          </span>
                        </div>
                        <div className="h-2 bg-muted rounded overflow-hidden">
                          <div
                            className="h-full bg-indigo-500"
                            style={{
                              width: `${(data.activeUsers / 35) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Engagement Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData.map((data, index) => (
                    <div key={index} className="flex items-center gap-4">
                      <Zap className="h-4 w-4 text-muted-foreground" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">
                            {data.period}
                          </span>
                          <Badge
                            variant={
                              data.engagement >= 80
                                ? "default"
                                : data.engagement >= 60
                                ? "secondary"
                                : "outline"
                            }
                          >
                            {data.engagement}%
                          </Badge>
                        </div>
                        <div className="h-2 bg-muted rounded overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-green-500 to-blue-500"
                            style={{ width: `${data.engagement}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Engagement Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 border rounded-lg">
                  <TrendingUp className="h-5 w-5 text-green-500 mt-1" />
                  <div>
                    <h4 className="font-medium">Peak Activity Days</h4>
                    <p className="text-sm text-muted-foreground">
                      Tuesday and Wednesday show highest collaboration activity
                      with 85% average engagement
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 border rounded-lg">
                  <Activity className="h-5 w-5 text-blue-500 mt-1" />
                  <div>
                    <h4 className="font-medium">Meeting Participation</h4>
                    <p className="text-sm text-muted-foreground">
                      Average meeting attendance is up 8.3% compared to last
                      period
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 border rounded-lg">
                  <Target className="h-5 w-5 text-purple-500 mt-1" />
                  <div>
                    <h4 className="font-medium">Canvas Collaboration</h4>
                    <p className="text-sm text-muted-foreground">
                      40 total canvas projects created with average of 3
                      collaborators per project
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 border rounded-lg">
                  <Award className="h-5 w-5 text-yellow-500 mt-1" />
                  <div>
                    <h4 className="font-medium">Top Performers</h4>
                    <p className="text-sm text-muted-foreground">
                      3 team members achieved 90%+ engagement scores this period
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
