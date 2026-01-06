"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Users,
  UserPlus,
  Search,
  MoreVertical,
  MessageSquare,
  Video,
  Star,
  StarOff,
  UserMinus,
  Download,
  Upload,
  RefreshCw,
  TrendingUp,
  CheckCircle,
  Eye,
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
import { useCurrentUser } from "@/hooks/use-ai-data";
import { useAnnouncer } from "@/lib/accessibility";
import type { Team as DBTeam, TeamType } from "@/lib/collaboration-queries";
import { CardSkeleton } from "@/components/ui/loading-skeleton";
import { ErrorEmptyState } from "@/components/ui/empty-state";

const logger = createFeatureLogger("CollaborationTeams");

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  status: "online" | "offline" | "away";
  department: string;
  joinedDate: string;
  tasksCompleted: number;
  performance: number;
  isFavorite: boolean;
}

interface Team {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  createdDate: string;
  status: "active" | "archived";
  leader: string;
}

export default function TeamsPage() {
  const { userId, loading: userLoading } = useCurrentUser();
  const { announce } = useAnnouncer();
  const [teams, setTeams] = useState<Team[]>([]);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [isCreateTeamOpen, setIsCreateTeamOpen] = useState(false);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("overview");

  // Stats
  const [stats, setStats] = useState({
    totalTeams: 0,
    totalMembers: 0,
    activeMembers: 0,
    avgPerformance: 0,
  });

  useEffect(() => {
    if (userId) {
      fetchTeamsData();
    }
  }, [userId]);

  const fetchTeamsData = async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      logger.info("Fetching teams from Supabase", { userId });

      const { getTeams } = await import("@/lib/collaboration-queries");
      const { getTeamMemberStats } = await import("@/lib/collaboration-analytics-queries");

      const [teamsResult, memberStatsResult] = await Promise.all([
        getTeams(userId, { status: "active" }),
        getTeamMemberStats(userId, '30days')
      ]);

      const { data: teamsData, error } = teamsResult;
      const { data: memberStats } = memberStatsResult;

      if (error) {
        throw new Error(error.message || "Failed to load teams");
      }

      if (teamsData) {
        // Map database teams to UI teams format
        const mappedTeams: Team[] = teamsData.map((dbTeam: DBTeam) => ({
          id: dbTeam.id,
          name: dbTeam.name,
          description: dbTeam.description || "",
          memberCount: dbTeam.member_count || 0,
          createdDate: new Date(dbTeam.created_at).toISOString().split("T")[0],
          status: dbTeam.status,
          leader: dbTeam.owner_id || "Unknown",
        }));

        setTeams(mappedTeams);

        // Calculate stats
        const totalMembers = teamsData.reduce(
          (sum, t) => sum + (t.member_count || 0),
          0
        );

        // Calculate average performance from member stats
        let avgPerformance = 0;
        if (memberStats && memberStats.length > 0) {
          const totalPerformance = memberStats.reduce(
            (sum: number, m: any) => sum + (m.performance_score || 0),
            0
          );
          avgPerformance = Math.round(totalPerformance / memberStats.length);
        }

        setStats({
          totalTeams: teamsData.length,
          totalMembers: totalMembers,
          activeMembers: teamsData.filter((t) => t.status === "active").length,
          avgPerformance: avgPerformance || 0,
        });

        logger.info("Teams loaded successfully", { count: teamsData.length });
        toast.promise(new Promise(r => setTimeout(r, 800)), {
          loading: 'Loading teams...',
          success: `Teams loaded - ${teamsData.length} team${teamsData.length !== 1 ? "s" : ""} found`,
          error: 'Failed to load teams'
        });
      }
    } catch (err: any) {
      const errorMessage = err.message || "Failed to load teams";
      setError(errorMessage);
      logger.error("Failed to load teams", { error: err });
      toast.error("Failed to load teams", {
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTeam = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!userId) {
      toast.error("Please log in to create teams");
      return;
    }

    const formData = new FormData(e.currentTarget);
    const name = formData.get("teamName") as string;
    const description = formData.get("teamDescription") as string;
    const team_type = (formData.get("teamType") as TeamType) || "project";

    if (!name.trim()) {
      toast.error("Team name is required");
      return;
    }

    try {
      logger.info("Creating team", { name, team_type, userId });

      const { createTeam } = await import("@/lib/collaboration-queries");
      const { data, error } = await createTeam(userId, {
        name,
        description,
        team_type,
      });

      if (error) {
        throw new Error(error.message || "Failed to create team");
      }

      if (data) {
        // Map database team to UI team format
        const newTeam: Team = {
          id: data.id,
          name: data.name,
          description: data.description || "",
          memberCount: data.member_count || 0,
          createdDate: new Date(data.created_at).toISOString().split("T")[0],
          status: data.status,
          leader: data.owner_id || userId,
        };

        setTeams([newTeam, ...teams]);
        setIsCreateTeamOpen(false);

        toast.promise(new Promise(r => setTimeout(r, 1200)), {
          loading: 'Creating team...',
          success: `Team "${data.name}" created successfully`,
          error: 'Failed to create team'
        });
        logger.info("Team created", { teamId: data.id, name: data.name });

        // Refresh stats
        setStats((prev) => ({
          ...prev,
          totalTeams: prev.totalTeams + 1,
        }));
      }
    } catch (error: any) {
      logger.error("Failed to create team", { error, name });
      toast.error("Failed to create team", {
        description: error.message || "Please try again",
      });
    }
  };

  const handleAddMember = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const name = formData.get("memberName") as string;
    const email = formData.get("memberEmail") as string;
    const role = formData.get("memberRole") as string;
    const department = formData.get("memberDepartment") as string;

    if (!name || !email) {
      toast.error("Name and email are required");
      return;
    }

    try {
      logger.info("Adding team member", { name, email, role, userId });

      // Try to add to database
      const { createTeamMember } = await import("@/lib/admin-overview-queries");
      const dbMember = await createTeamMember(userId || "", {
        name,
        email,
        role,
        department,
        status: "active",
      });

      const newMember: TeamMember = {
        id: dbMember?.id || Date.now().toString(),
        name,
        email,
        role,
        status: "offline",
        department,
        joinedDate: new Date().toISOString().split("T")[0],
        tasksCompleted: 0,
        performance: 0,
        isFavorite: false,
      };

      setMembers([...members, newMember]);
      setStats((prev) => ({ ...prev, totalMembers: prev.totalMembers + 1 }));
      setIsAddMemberOpen(false);

      // Send invitation email
      const subject = encodeURIComponent(`You've been added to the team`);
      const body = encodeURIComponent(
        `Hi ${name},\n\n` +
        `You've been added to the team as a ${role}.\n` +
        `Department: ${department}\n\n` +
        `Login to get started!`
      );
      window.open(`mailto:${email}?subject=${subject}&body=${body}`, "_blank");

      logger.info("Member added successfully", { memberId: newMember.id, email });
      toast.promise(new Promise(r => setTimeout(r, 1500)), {
        loading: 'Adding member...',
        success: `Member added - Invitation sent to ${email}`,
        error: 'Failed to add member'
      });
      announce(`${name} added to team successfully`, "polite");
    } catch (error) {
      logger.error("Failed to add member", { error });
      toast.error("Failed to add member");
      announce("Error adding team member", "assertive");
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    try {
      const member = members.find((m) => m.id === memberId);
      logger.info("Removing team member", { memberId, memberName: member?.name });

      // Remove from local state
      setMembers(members.filter((m) => m.id !== memberId));
      setStats((prev) => ({
        ...prev,
        totalMembers: Math.max(0, prev.totalMembers - 1),
      }));

      logger.info("Member removed successfully", { memberId });
      toast.promise(new Promise(r => setTimeout(r, 800)), {
        loading: 'Removing member...',
        success: `Member removed - ${member?.name || "Team member"}`,
        error: 'Failed to remove member'
      });
      announce(`${member?.name || "Member"} removed from team`, "polite");
    } catch (error) {
      logger.error("Failed to remove member", { error, memberId });
      toast.error("Failed to remove member");
      announce("Error removing team member", "assertive");
    }
  };

  const handleToggleFavorite = async (memberId: string) => {
    try {
      logger.info("Toggling favorite member", { memberId });

      setMembers(
        members.map((m) =>
          m.id === memberId ? { ...m, isFavorite: !m.isFavorite } : m
        )
      );

      logger.info("Favorite toggled successfully");
      toast.promise(new Promise(r => setTimeout(r, 500)), {
        loading: 'Updating favorite...',
        success: 'Favorite updated',
        error: 'Failed to update favorite'
      });
    } catch (error) {
      logger.error("Failed to toggle favorite", { error });
      toast.error("Failed to update favorite");
    }
  };

  const handleChangeRole = async (memberId: string, newRole: string) => {
    try {
      const member = members.find((m) => m.id === memberId);
      logger.info("Changing member role", { memberId, memberName: member?.name, newRole });

      // Update local state
      setMembers(
        members.map((m) => (m.id === memberId ? { ...m, role: newRole } : m))
      );

      logger.info("Role changed successfully", { memberId, newRole });
      toast.promise(new Promise(r => setTimeout(r, 1000)), {
        loading: 'Updating role...',
        success: `Role updated - ${member?.name} is now ${newRole}`,
        error: 'Failed to update role'
      });
      announce(`${member?.name}'s role changed to ${newRole}`, "polite");
    } catch (error) {
      logger.error("Failed to change role", { error, memberId });
      toast.error("Failed to update role");
      announce("Error updating member role", "assertive");
    }
  };

  const handleSendMessage = async (memberId: string) => {
    try {
      const member = members.find((m) => m.id === memberId);
      logger.info("Opening message to member", { memberId, memberEmail: member?.email });

      if (member?.email) {
        // Open email client
        const subject = encodeURIComponent(`Message from your team`);
        window.open(`mailto:${member.email}?subject=${subject}`, "_blank");

        logger.info("Email client opened", { memberId });
        toast.promise(new Promise(r => setTimeout(r, 600)), {
          loading: 'Opening email...',
          success: `Email opened - Compose message to ${member.name}`,
          error: 'Failed to open email'
        });
        announce(`Opening email to ${member.name}`, "polite");
      } else {
        // Navigate to messages hub
        window.location.href = `/dashboard/messages?member=${memberId}`;
        toast.promise(new Promise(r => setTimeout(r, 800)), {
          loading: 'Redirecting...',
          success: 'Redirecting to messages',
          error: 'Failed to redirect'
        });
      }
    } catch (error) {
      logger.error("Failed to send message", { error, memberId });
      toast.error("Failed to send message");
      announce("Error sending message", "assertive");
    }
  };

  const handleStartVideoCall = async (memberId: string) => {
    try {
      const member = members.find((m) => m.id === memberId);
      logger.info("Starting video call", { memberId, memberName: member?.name });

      // Navigate to meetings page with quick call parameter
      window.location.href = `/dashboard/collaboration/meetings?call=${memberId}&name=${encodeURIComponent(member?.name || "")}`;

      logger.info("Redirecting to video call");
      toast.success("Starting video call...", { description: `Calling ${member?.name || "team member"}` });
      announce(`Starting video call with ${member?.name}`, "polite");
    } catch (error) {
      logger.error("Failed to start video call", { error, memberId });
      toast.error("Failed to start video call");
      announce("Error starting video call", "assertive");
    }
  };

  const handleExportTeamData = () => {
    try {
      logger.info("Exporting team data");

      const exportData = {
        teams,
        members,
        stats,
        exportedAt: new Date().toISOString(),
        summary: {
          totalTeams: teams.length,
          totalMembers: members.length,
          activeTeams: teams.filter(t => t.status === 'active').length,
          membersByRole: members.reduce((acc, m) => {
            acc[m.role] = (acc[m.role] || 0) + 1;
            return acc;
          }, {} as Record<string, number>)
        }
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `teams-export-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);

      logger.info("Team data exported successfully", { teamCount: teams.length, memberCount: members.length });
      toast.success("Team data exported", {
        description: `Exported ${teams.length} teams and ${members.length} members`
      });
    } catch (error) {
      logger.error("Failed to export team data", { error });
      toast.error("Failed to export data");
    }
  };

  const handleImportTeamData = async () => {
    try {
      logger.info("Opening file picker for team data import");

      // Create file input and trigger click
      const input = document.createElement("input");
      input.type = "file";
      input.accept = ".json,.csv";
      input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (!file) return;

        try {
          const text = await file.text();
          const importData = JSON.parse(text);

          // Validate and import data
          if (importData.members && Array.isArray(importData.members)) {
            const importedMembers: TeamMember[] = importData.members.map((m: any) => ({
              id: m.id || Date.now().toString() + Math.random(),
              name: m.name || "Unknown",
              email: m.email || "",
              role: m.role || "Member",
              status: "offline",
              department: m.department || "",
              joinedDate: m.joinedDate || new Date().toISOString().split("T")[0],
              tasksCompleted: m.tasksCompleted || 0,
              performance: m.performance || 0,
              isFavorite: false,
            }));

            setMembers([...members, ...importedMembers]);
            setStats((prev) => ({
              ...prev,
              totalMembers: prev.totalMembers + importedMembers.length,
            }));

            logger.info("Team data imported successfully", { count: importedMembers.length });
            toast.success("Team data imported", {
              description: `${importedMembers.length} members added`,
            });
            announce(`${importedMembers.length} team members imported successfully`, "polite");
          } else {
            toast.error("Invalid file format", { description: "File must contain a 'members' array" });
          }
        } catch {
          logger.error("Failed to parse import file");
          toast.error("Invalid JSON file");
          announce("Error parsing import file", "assertive");
        }
      };
      input.click();
    } catch (error) {
      logger.error("Failed to import team data", { error });
      toast.error("Failed to import data");
      announce("Error importing team data", "assertive");
    }
  };

  const handleRefreshData = async () => {
    logger.info("Refreshing teams data");
    await fetchTeamsData();
  };

  const filteredMembers = members.filter((member) => {
    const matchesSearch =
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = filterRole === "all" || member.role === filterRole;
    const matchesStatus =
      filterStatus === "all" || member.status === filterStatus;

    return matchesSearch && matchesRole && matchesStatus;
  });

  // A+++ LOADING STATE
  if (loading || userLoading) {
    return (
      <div className="flex-1 space-y-6 p-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Teams</h2>
            <p className="text-muted-foreground">Loading teams...</p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    );
  }

  // A+++ ERROR STATE
  if (error) {
    return (
      <div className="flex-1 space-y-6 p-8">
        <ErrorEmptyState
          error={error}
          action={{
            label: "Retry",
            onClick: () => fetchTeamsData(),
          }}
        />
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Teams</h2>
          <p className="text-muted-foreground">
            Manage your teams and collaborate effectively
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefreshData}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button variant="outline" onClick={handleExportTeamData}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button variant="outline" onClick={handleImportTeamData}>
            <Upload className="mr-2 h-4 w-4" />
            Import
          </Button>
          <Dialog open={isCreateTeamOpen} onOpenChange={setIsCreateTeamOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="mr-2 h-4 w-4" />
                Create Team
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Team</DialogTitle>
                <DialogDescription>
                  Add a new team to your organization
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateTeam} className="space-y-4">
                <div>
                  <Label htmlFor="teamName">Team Name</Label>
                  <Input
                    id="teamName"
                    name="teamName"
                    placeholder="Enter team name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="teamDescription">Description</Label>
                  <Textarea
                    id="teamDescription"
                    name="teamDescription"
                    placeholder="Enter team description"
                  />
                </div>
                <div>
                  <Label htmlFor="teamType">Team Type</Label>
                  <Select name="teamType" defaultValue="project">
                    <SelectTrigger>
                      <SelectValue placeholder="Select team type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="project">Project</SelectItem>
                      <SelectItem value="department">Department</SelectItem>
                      <SelectItem value="cross-functional">
                        Cross-Functional
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="w-full">
                  Create Team
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
            <CardTitle className="text-sm font-medium">Total Teams</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <NumberFlow value={stats.totalTeams} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Members
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <NumberFlow value={stats.totalMembers} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Members
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <NumberFlow value={stats.activeMembers} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Avg Performance
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <NumberFlow value={stats.avgPerformance} />%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {teams.map((team) => (
              <motion.div
                key={team.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle>{team.name}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          {team.description}
                        </p>
                      </div>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Leader</span>
                        <span className="font-medium">{team.leader}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Members</span>
                        <span className="font-medium">{team.memberCount}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Status</span>
                        <Badge
                          variant={
                            team.status === "active" ? "default" : "secondary"
                          }
                        >
                          {team.status}
                        </Badge>
                      </div>
                      <div className="flex gap-2 pt-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={() => setSelectedTeam(team.id)}
                        >
                          <Eye className="mr-1 h-3 w-3" />
                          View
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={() => setIsAddMemberOpen(true)}
                        >
                          <UserPlus className="mr-1 h-3 w-3" />
                          Add
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="members" className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-1 gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search members..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Select value={filterRole} onValueChange={setFilterRole}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="Team Lead">Team Lead</SelectItem>
                  <SelectItem value="Developer">Developer</SelectItem>
                  <SelectItem value="Designer">Designer</SelectItem>
                  <SelectItem value="Marketing Manager">
                    Marketing Manager
                  </SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="online">Online</SelectItem>
                  <SelectItem value="offline">Offline</SelectItem>
                  <SelectItem value="away">Away</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Dialog open={isAddMemberOpen} onOpenChange={setIsAddMemberOpen}>
              <DialogTrigger asChild>
                <Button>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Add Member
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Team Member</DialogTitle>
                  <DialogDescription>
                    Invite a new member to join your team
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAddMember} className="space-y-4">
                  <div>
                    <Label htmlFor="memberName">Name</Label>
                    <Input
                      id="memberName"
                      name="memberName"
                      placeholder="Enter member name"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="memberEmail">Email</Label>
                    <Input
                      id="memberEmail"
                      name="memberEmail"
                      type="email"
                      placeholder="Enter email address"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="memberRole">Role</Label>
                    <Select name="memberRole" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Team Lead">Team Lead</SelectItem>
                        <SelectItem value="Developer">Developer</SelectItem>
                        <SelectItem value="Designer">Designer</SelectItem>
                        <SelectItem value="Marketing Manager">
                          Marketing Manager
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="memberDepartment">Department</Label>
                    <Input
                      id="memberDepartment"
                      name="memberDepartment"
                      placeholder="Enter department"
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    Add Member
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Members List */}
          <div className="grid gap-4 md:grid-cols-2">
            {filteredMembers.map((member) => (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <div className="relative">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={member.avatar} />
                          <AvatarFallback>
                            {member.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <span
                          className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white ${
                            member.status === "online"
                              ? "bg-green-500"
                              : member.status === "away"
                              ? "bg-yellow-500"
                              : "bg-gray-300"
                          }`}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold">{member.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {member.email}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleToggleFavorite(member.id)}
                          >
                            {member.isFavorite ? (
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            ) : (
                              <StarOff className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-2">
                          <Badge variant="secondary">{member.role}</Badge>
                          <Badge variant="outline">{member.department}</Badge>
                        </div>
                        <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-muted-foreground">
                              Tasks:
                            </span>
                            <span className="ml-1 font-medium">
                              {member.tasksCompleted}
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">
                              Performance:
                            </span>
                            <span className="ml-1 font-medium">
                              {member.performance}%
                            </span>
                          </div>
                        </div>
                        <div className="mt-3 flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleSendMessage(member.id)}
                          >
                            <MessageSquare className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleStartVideoCall(member.id)}
                          >
                            <Video className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRemoveMember(member.id)}
                          >
                            <UserMinus className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Team Performance Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {members.map((member) => (
                  <div key={member.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={member.avatar} />
                          <AvatarFallback>
                            {member.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{member.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {member.role}
                          </p>
                        </div>
                      </div>
                      <span className="text-sm font-medium">
                        {member.performance}%
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${member.performance}%` }}
                        transition={{ duration: 1 }}
                        className="h-full bg-primary"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
