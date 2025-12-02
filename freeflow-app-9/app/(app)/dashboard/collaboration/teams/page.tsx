"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  UserPlus,
  Search,
  Filter,
  MoreVertical,
  Mail,
  MessageSquare,
  Video,
  Star,
  StarOff,
  UserMinus,
  Crown,
  Shield,
  Edit,
  Trash2,
  Download,
  Upload,
  RefreshCw,
  Award,
  Target,
  TrendingUp,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Settings,
  Eye,
  EyeOff,
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
import { Switch } from "@/components/ui/switch";
import { useCurrentUser } from "@/hooks/use-ai-data";
import type { Team as DBTeam, TeamType } from "@/lib/collaboration-queries";

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
  const [teams, setTeams] = useState<Team[]>([]);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [isCreateTeamOpen, setIsCreateTeamOpen] = useState(false);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [loading, setLoading] = useState(true);
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
      logger.info("Fetching teams from Supabase", { userId });

      const { getTeams } = await import("@/lib/collaboration-queries");
      const { data: teamsData, error } = await getTeams(userId, {
        status: "active",
      });

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

        setStats({
          totalTeams: teamsData.length,
          totalMembers: totalMembers,
          activeMembers: teamsData.filter((t) => t.status === "active").length,
          avgPerformance: 85, // TODO: Calculate from real performance data
        });

        logger.info("Teams loaded successfully", { count: teamsData.length });
        toast.success("Teams loaded", {
          description: `${teamsData.length} team${teamsData.length !== 1 ? "s" : ""} found`,
        });
      }
    } catch (error: any) {
      logger.error("Failed to load teams", { error });
      toast.error("Failed to load teams", {
        description: error.message || "Please try again",
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

        toast.success(`Team "${data.name}" created successfully`);
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

    try {
      logger.info("Adding team member");

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 800));

      const newMember: TeamMember = {
        id: Date.now().toString(),
        name: formData.get("memberName") as string,
        email: formData.get("memberEmail") as string,
        role: formData.get("memberRole") as string,
        status: "offline",
        department: formData.get("memberDepartment") as string,
        joinedDate: new Date().toISOString().split("T")[0],
        tasksCompleted: 0,
        performance: 0,
        isFavorite: false,
      };

      setMembers([...members, newMember]);
      setIsAddMemberOpen(false);

      logger.info("Member added successfully", { memberId: newMember.id });
      toast.success("Member added successfully");
    } catch (error) {
      logger.error("Failed to add member", { error });
      toast.error("Failed to add member");
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    try {
      logger.info("Removing team member", { memberId });

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      setMembers(members.filter((m) => m.id !== memberId));

      logger.info("Member removed successfully");
      toast.success("Member removed from team");
    } catch (error) {
      logger.error("Failed to remove member", { error });
      toast.error("Failed to remove member");
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
      toast.success("Favorite updated");
    } catch (error) {
      logger.error("Failed to toggle favorite", { error });
      toast.error("Failed to update favorite");
    }
  };

  const handleChangeRole = async (memberId: string, newRole: string) => {
    try {
      logger.info("Changing member role", { memberId, newRole });

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      setMembers(
        members.map((m) => (m.id === memberId ? { ...m, role: newRole } : m))
      );

      logger.info("Role changed successfully");
      toast.success("Member role updated");
    } catch (error) {
      logger.error("Failed to change role", { error });
      toast.error("Failed to update role");
    }
  };

  const handleSendMessage = async (memberId: string) => {
    try {
      logger.info("Sending message to member", { memberId });

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 300));

      logger.info("Message sent successfully");
      toast.success("Message sent");
    } catch (error) {
      logger.error("Failed to send message", { error });
      toast.error("Failed to send message");
    }
  };

  const handleStartVideoCall = async (memberId: string) => {
    try {
      logger.info("Starting video call", { memberId });

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 300));

      logger.info("Video call started");
      toast.success("Starting video call...");
    } catch (error) {
      logger.error("Failed to start video call", { error });
      toast.error("Failed to start video call");
    }
  };

  const handleExportTeamData = async () => {
    try {
      logger.info("Exporting team data");

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      logger.info("Team data exported successfully");
      toast.success("Team data exported");
    } catch (error) {
      logger.error("Failed to export team data", { error });
      toast.error("Failed to export data");
    }
  };

  const handleImportTeamData = async () => {
    try {
      logger.info("Importing team data");

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      logger.info("Team data imported successfully");
      toast.success("Team data imported");
    } catch (error) {
      logger.error("Failed to import team data", { error });
      toast.error("Failed to import data");
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
