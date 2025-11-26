"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  Phone,
  PhoneOff,
  Monitor,
  MonitorOff,
  Users,
  UserPlus,
  Settings,
  Calendar,
  Clock,
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  Share2,
  Copy,
  Edit,
  Trash2,
  PlayCircle,
  PauseCircle,
  StopCircle,
  RefreshCw,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Grid3x3,
  User,
  MessageSquare,
  Hand,
  MoreVertical,
  ChevronDown,
  ChevronUp,
  Record,
  Save,
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Star,
  StarOff,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Slider } from "@/components/ui/slider";

const logger = createFeatureLogger("CollaborationMeetings");

interface Meeting {
  id: string;
  title: string;
  description: string;
  scheduledDate: string;
  scheduledTime: string;
  duration: number;
  type: "video" | "voice";
  status: "upcoming" | "ongoing" | "completed";
  host: string;
  participants: Participant[];
  recordingUrl?: string;
  isRecording: boolean;
}

interface Participant {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  isHost: boolean;
  isMuted: boolean;
  isVideoOff: boolean;
  isHandRaised: boolean;
  joinedAt?: string;
}

interface CallState {
  isInCall: boolean;
  isCameraOn: boolean;
  isMicOn: boolean;
  isScreenSharing: boolean;
  isRecording: boolean;
  viewMode: "grid" | "speaker" | "sidebar";
  volume: number;
}

export default function MeetingsPage() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [isJoinOpen, setIsJoinOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("upcoming");
  const [activeMeeting, setActiveMeeting] = useState<Meeting | null>(null);

  // Call State
  const [callState, setCallState] = useState<CallState>({
    isInCall: false,
    isCameraOn: true,
    isMicOn: true,
    isScreenSharing: false,
    isRecording: false,
    viewMode: "grid",
    volume: 80,
  });

  const videoRef = useRef<HTMLVideoElement>(null);

  // Stats
  const [stats, setStats] = useState({
    totalMeetings: 0,
    upcomingMeetings: 0,
    completedMeetings: 0,
    totalHours: 0,
  });

  useEffect(() => {
    fetchMeetingsData();
  }, []);

  const fetchMeetingsData = async () => {
    try {
      setLoading(true);
      logger.info("Fetching meetings data");

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const mockMeetings: Meeting[] = [
        {
          id: "1",
          title: "Product Review Meeting",
          description: "Quarterly product review and planning",
          scheduledDate: "2024-01-25",
          scheduledTime: "10:00",
          duration: 60,
          type: "video",
          status: "upcoming",
          host: "John Doe",
          participants: [
            {
              id: "1",
              name: "John Doe",
              email: "john@example.com",
              isHost: true,
              isMuted: false,
              isVideoOff: false,
              isHandRaised: false,
            },
            {
              id: "2",
              name: "Sarah Johnson",
              email: "sarah@example.com",
              isHost: false,
              isMuted: false,
              isVideoOff: false,
              isHandRaised: false,
            },
          ],
          isRecording: false,
        },
        {
          id: "2",
          title: "Team Standup",
          description: "Daily team standup meeting",
          scheduledDate: "2024-01-24",
          scheduledTime: "09:00",
          duration: 15,
          type: "voice",
          status: "completed",
          host: "Mike Chen",
          participants: [
            {
              id: "3",
              name: "Mike Chen",
              email: "mike@example.com",
              isHost: true,
              isMuted: false,
              isVideoOff: true,
              isHandRaised: false,
            },
          ],
          recordingUrl: "/recordings/meeting-2.mp4",
          isRecording: false,
        },
        {
          id: "3",
          title: "Client Presentation",
          description: "Present Q4 results to client",
          scheduledDate: "2024-01-26",
          scheduledTime: "14:00",
          duration: 90,
          type: "video",
          status: "upcoming",
          host: "Emily Davis",
          participants: [
            {
              id: "4",
              name: "Emily Davis",
              email: "emily@example.com",
              isHost: true,
              isMuted: false,
              isVideoOff: false,
              isHandRaised: false,
            },
          ],
          isRecording: false,
        },
      ];

      setMeetings(mockMeetings);

      setStats({
        totalMeetings: mockMeetings.length,
        upcomingMeetings: mockMeetings.filter((m) => m.status === "upcoming")
          .length,
        completedMeetings: mockMeetings.filter((m) => m.status === "completed")
          .length,
        totalHours: Math.round(
          mockMeetings.reduce((sum, m) => sum + m.duration, 0) / 60
        ),
      });

      logger.info("Meetings data fetched successfully");
      toast.success("Meetings loaded");
    } catch (error) {
      logger.error("Failed to fetch meetings data", { error });
      toast.error("Failed to load meetings");
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleMeeting = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    try {
      logger.info("Scheduling new meeting");

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 800));

      const newMeeting: Meeting = {
        id: Date.now().toString(),
        title: formData.get("meetingTitle") as string,
        description: formData.get("meetingDescription") as string,
        scheduledDate: formData.get("meetingDate") as string,
        scheduledTime: formData.get("meetingTime") as string,
        duration: parseInt(formData.get("meetingDuration") as string),
        type: formData.get("meetingType") as "video" | "voice",
        status: "upcoming",
        host: "Current User",
        participants: [],
        isRecording: false,
      };

      setMeetings([...meetings, newMeeting]);
      setIsScheduleOpen(false);

      logger.info("Meeting scheduled successfully", { meetingId: newMeeting.id });
      toast.success("Meeting scheduled successfully");
    } catch (error) {
      logger.error("Failed to schedule meeting", { error });
      toast.error("Failed to schedule meeting");
    }
  };

  const handleJoinMeeting = async (meetingId: string) => {
    try {
      logger.info("Joining meeting", { meetingId });

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const meeting = meetings.find((m) => m.id === meetingId);
      if (meeting) {
        setActiveMeeting(meeting);
        setCallState({ ...callState, isInCall: true });

        logger.info("Joined meeting successfully");
        toast.success("Joined meeting");
      }
    } catch (error) {
      logger.error("Failed to join meeting", { error });
      toast.error("Failed to join meeting");
    }
  };

  const handleLeaveMeeting = async () => {
    try {
      logger.info("Leaving meeting");

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      setActiveMeeting(null);
      setCallState({
        ...callState,
        isInCall: false,
        isScreenSharing: false,
        isRecording: false,
      });

      logger.info("Left meeting successfully");
      toast.success("Left meeting");
    } catch (error) {
      logger.error("Failed to leave meeting", { error });
      toast.error("Failed to leave meeting");
    }
  };

  const handleToggleCamera = async () => {
    try {
      logger.info("Toggling camera");

      setCallState({ ...callState, isCameraOn: !callState.isCameraOn });

      logger.info("Camera toggled", { isCameraOn: !callState.isCameraOn });
      toast.success(callState.isCameraOn ? "Camera off" : "Camera on");
    } catch (error) {
      logger.error("Failed to toggle camera", { error });
      toast.error("Failed to toggle camera");
    }
  };

  const handleToggleMic = async () => {
    try {
      logger.info("Toggling microphone");

      setCallState({ ...callState, isMicOn: !callState.isMicOn });

      logger.info("Microphone toggled", { isMicOn: !callState.isMicOn });
      toast.success(callState.isMicOn ? "Microphone off" : "Microphone on");
    } catch (error) {
      logger.error("Failed to toggle microphone", { error });
      toast.error("Failed to toggle microphone");
    }
  };

  const handleToggleScreenShare = async () => {
    try {
      logger.info("Toggling screen share");

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      setCallState({
        ...callState,
        isScreenSharing: !callState.isScreenSharing,
      });

      logger.info("Screen share toggled", {
        isScreenSharing: !callState.isScreenSharing,
      });
      toast.success(
        callState.isScreenSharing ? "Screen share stopped" : "Screen sharing"
      );
    } catch (error) {
      logger.error("Failed to toggle screen share", { error });
      toast.error("Failed to toggle screen share");
    }
  };

  const handleToggleRecording = async () => {
    try {
      logger.info("Toggling recording");

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      setCallState({ ...callState, isRecording: !callState.isRecording });

      if (activeMeeting) {
        setActiveMeeting({
          ...activeMeeting,
          isRecording: !callState.isRecording,
        });
      }

      logger.info("Recording toggled", { isRecording: !callState.isRecording });
      toast.success(
        callState.isRecording ? "Recording stopped" : "Recording started"
      );
    } catch (error) {
      logger.error("Failed to toggle recording", { error });
      toast.error("Failed to toggle recording");
    }
  };

  const handleChangeViewMode = async (mode: "grid" | "speaker" | "sidebar") => {
    try {
      logger.info("Changing view mode", { mode });

      setCallState({ ...callState, viewMode: mode });

      logger.info("View mode changed successfully");
      toast.success(`Switched to ${mode} view`);
    } catch (error) {
      logger.error("Failed to change view mode", { error });
      toast.error("Failed to change view mode");
    }
  };

  const handleVolumeChange = async (value: number[]) => {
    try {
      logger.info("Changing volume", { volume: value[0] });

      setCallState({ ...callState, volume: value[0] });

      logger.info("Volume changed successfully");
    } catch (error) {
      logger.error("Failed to change volume", { error });
    }
  };

  const handleInviteParticipant = async (meetingId: string) => {
    try {
      logger.info("Inviting participant", { meetingId });

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      logger.info("Invitation sent successfully");
      toast.success("Invitation sent");
    } catch (error) {
      logger.error("Failed to invite participant", { error });
      toast.error("Failed to send invitation");
    }
  };

  const handleDeleteMeeting = async (meetingId: string) => {
    try {
      logger.info("Deleting meeting", { meetingId });

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      setMeetings(meetings.filter((m) => m.id !== meetingId));

      logger.info("Meeting deleted successfully");
      toast.success("Meeting deleted");
    } catch (error) {
      logger.error("Failed to delete meeting", { error });
      toast.error("Failed to delete meeting");
    }
  };

  const handleDownloadRecording = async (meetingId: string) => {
    try {
      logger.info("Downloading recording", { meetingId });

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      logger.info("Recording downloaded successfully");
      toast.success("Download started");
    } catch (error) {
      logger.error("Failed to download recording", { error });
      toast.error("Failed to download recording");
    }
  };

  const handleShareMeeting = async (meetingId: string) => {
    try {
      logger.info("Sharing meeting link", { meetingId });

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 300));

      navigator.clipboard.writeText(
        `https://app.example.com/meetings/${meetingId}`
      );

      logger.info("Meeting link copied");
      toast.success("Meeting link copied to clipboard");
    } catch (error) {
      logger.error("Failed to share meeting", { error });
      toast.error("Failed to share meeting");
    }
  };

  const handleRefreshData = async () => {
    await fetchMeetingsData();
  };

  const handleRaiseHand = async (participantId: string) => {
    try {
      logger.info("Raising hand", { participantId });

      if (activeMeeting) {
        const updatedParticipants = activeMeeting.participants.map((p) =>
          p.id === participantId ? { ...p, isHandRaised: !p.isHandRaised } : p
        );

        setActiveMeeting({
          ...activeMeeting,
          participants: updatedParticipants,
        });

        logger.info("Hand raised successfully");
        toast.success("Hand raised");
      }
    } catch (error) {
      logger.error("Failed to raise hand", { error });
      toast.error("Failed to raise hand");
    }
  };

  const handleMuteParticipant = async (participantId: string) => {
    try {
      logger.info("Muting participant", { participantId });

      if (activeMeeting) {
        const updatedParticipants = activeMeeting.participants.map((p) =>
          p.id === participantId ? { ...p, isMuted: !p.isMuted } : p
        );

        setActiveMeeting({
          ...activeMeeting,
          participants: updatedParticipants,
        });

        logger.info("Participant muted successfully");
        toast.success("Participant muted");
      }
    } catch (error) {
      logger.error("Failed to mute participant", { error });
      toast.error("Failed to mute participant");
    }
  };

  const filteredMeetings = meetings.filter((meeting) => {
    const matchesSearch = meeting.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesType = filterType === "all" || meeting.type === filterType;
    const matchesStatus =
      filterStatus === "all" || meeting.status === filterStatus;
    const matchesTab =
      activeTab === "all" ||
      (activeTab === "upcoming" && meeting.status === "upcoming") ||
      (activeTab === "recordings" && meeting.recordingUrl);

    return matchesSearch && matchesType && matchesStatus && matchesTab;
  });

  return (
    <div className="flex-1 space-y-6 p-8">
      {/* Active Call Interface */}
      <AnimatePresence>
        {callState.isInCall && activeMeeting && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-50 bg-black"
          >
            <div className="flex h-full flex-col">
              {/* Video Grid */}
              <div className="flex-1 p-4">
                <div
                  className={`h-full ${
                    callState.viewMode === "grid"
                      ? "grid grid-cols-2 gap-4 md:grid-cols-3"
                      : "flex"
                  }`}
                >
                  {activeMeeting.participants.map((participant) => (
                    <div
                      key={participant.id}
                      className="relative rounded-lg bg-gray-800 overflow-hidden"
                    >
                      {participant.isVideoOff ? (
                        <div className="flex h-full items-center justify-center">
                          <Avatar className="h-24 w-24">
                            <AvatarImage src={participant.avatar} />
                            <AvatarFallback className="text-3xl">
                              {participant.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                      ) : (
                        <video
                          ref={videoRef}
                          autoPlay
                          playsInline
                          muted
                          className="h-full w-full object-cover"
                        />
                      )}
                      <div className="absolute bottom-2 left-2 flex items-center gap-2">
                        <Badge className="bg-black/50">
                          {participant.name}
                        </Badge>
                        {participant.isMuted && (
                          <Badge variant="destructive">
                            <MicOff className="h-3 w-3" />
                          </Badge>
                        )}
                        {participant.isHandRaised && (
                          <Badge className="bg-yellow-500">
                            <Hand className="h-3 w-3" />
                          </Badge>
                        )}
                      </div>
                      {participant.isHost && (
                        <div className="absolute top-2 right-2">
                          <Badge className="bg-blue-500">Host</Badge>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Call Controls */}
              <div className="border-t border-gray-700 bg-gray-900 p-6">
                <div className="mx-auto flex max-w-4xl items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="text-white">
                      <h3 className="font-semibold">{activeMeeting.title}</h3>
                      <p className="text-sm text-gray-400">
                        {activeMeeting.participants.length} participants
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Microphone */}
                    <Button
                      size="lg"
                      variant={callState.isMicOn ? "secondary" : "destructive"}
                      onClick={handleToggleMic}
                      className="rounded-full"
                    >
                      {callState.isMicOn ? (
                        <Mic className="h-5 w-5" />
                      ) : (
                        <MicOff className="h-5 w-5" />
                      )}
                    </Button>

                    {/* Camera (Video calls only) */}
                    {activeMeeting.type === "video" && (
                      <Button
                        size="lg"
                        variant={
                          callState.isCameraOn ? "secondary" : "destructive"
                        }
                        onClick={handleToggleCamera}
                        className="rounded-full"
                      >
                        {callState.isCameraOn ? (
                          <Video className="h-5 w-5" />
                        ) : (
                          <VideoOff className="h-5 w-5" />
                        )}
                      </Button>
                    )}

                    {/* Screen Share */}
                    <Button
                      size="lg"
                      variant={
                        callState.isScreenSharing ? "default" : "secondary"
                      }
                      onClick={handleToggleScreenShare}
                      className="rounded-full"
                    >
                      {callState.isScreenSharing ? (
                        <MonitorOff className="h-5 w-5" />
                      ) : (
                        <Monitor className="h-5 w-5" />
                      )}
                    </Button>

                    {/* Recording */}
                    <Button
                      size="lg"
                      variant={callState.isRecording ? "destructive" : "secondary"}
                      onClick={handleToggleRecording}
                      className="rounded-full"
                    >
                      <Record
                        className={`h-5 w-5 ${
                          callState.isRecording ? "animate-pulse" : ""
                        }`}
                      />
                    </Button>

                    {/* View Mode */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="lg" variant="secondary" className="rounded-full">
                          <Grid3x3 className="h-5 w-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem
                          onClick={() => handleChangeViewMode("grid")}
                        >
                          Grid View
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleChangeViewMode("speaker")}
                        >
                          Speaker View
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleChangeViewMode("sidebar")}
                        >
                          Sidebar View
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Participants */}
                    <Button
                      size="lg"
                      variant="secondary"
                      onClick={() => handleInviteParticipant(activeMeeting.id)}
                      className="rounded-full"
                    >
                      <UserPlus className="h-5 w-5" />
                    </Button>

                    {/* Chat */}
                    <Button size="lg" variant="secondary" className="rounded-full">
                      <MessageSquare className="h-5 w-5" />
                    </Button>

                    {/* Raise Hand */}
                    <Button
                      size="lg"
                      variant="secondary"
                      onClick={() => handleRaiseHand("current-user")}
                      className="rounded-full"
                    >
                      <Hand className="h-5 w-5" />
                    </Button>

                    {/* Leave Call */}
                    <Button
                      size="lg"
                      variant="destructive"
                      onClick={handleLeaveMeeting}
                      className="rounded-full"
                    >
                      <PhoneOff className="h-5 w-5" />
                    </Button>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      {callState.volume > 0 ? (
                        <Volume2 className="h-4 w-4 text-white" />
                      ) : (
                        <VolumeX className="h-4 w-4 text-white" />
                      )}
                      <Slider
                        value={[callState.volume]}
                        onValueChange={handleVolumeChange}
                        max={100}
                        step={1}
                        className="w-24"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Regular Meetings Interface */}
      {!callState.isInCall && (
        <>
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Meetings</h2>
              <p className="text-muted-foreground">
                Schedule and join video and voice meetings
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleRefreshData}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
              <Dialog open={isJoinOpen} onOpenChange={setIsJoinOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Video className="mr-2 h-4 w-4" />
                    Join Meeting
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Join Meeting</DialogTitle>
                    <DialogDescription>
                      Enter meeting ID or link to join
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="meetingId">Meeting ID</Label>
                      <Input
                        id="meetingId"
                        placeholder="Enter meeting ID"
                        required
                      />
                    </div>
                    <Button
                      className="w-full"
                      onClick={() => {
                        setIsJoinOpen(false);
                        toast.success("Joining meeting...");
                      }}
                    >
                      Join Meeting
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
              <Dialog open={isScheduleOpen} onOpenChange={setIsScheduleOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Schedule Meeting
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Schedule New Meeting</DialogTitle>
                    <DialogDescription>
                      Create a new video or voice meeting
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleScheduleMeeting} className="space-y-4">
                    <div>
                      <Label htmlFor="meetingTitle">Meeting Title</Label>
                      <Input
                        id="meetingTitle"
                        name="meetingTitle"
                        placeholder="Enter meeting title"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="meetingDescription">Description</Label>
                      <Textarea
                        id="meetingDescription"
                        name="meetingDescription"
                        placeholder="Enter meeting description"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="meetingDate">Date</Label>
                        <Input
                          id="meetingDate"
                          name="meetingDate"
                          type="date"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="meetingTime">Time</Label>
                        <Input
                          id="meetingTime"
                          name="meetingTime"
                          type="time"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="meetingDuration">Duration (minutes)</Label>
                      <Input
                        id="meetingDuration"
                        name="meetingDuration"
                        type="number"
                        placeholder="60"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="meetingType">Meeting Type</Label>
                      <Select name="meetingType" required>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="video">Video Call</SelectItem>
                          <SelectItem value="voice">Voice Call</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button type="submit" className="w-full">
                      Schedule Meeting
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
                  Total Meetings
                </CardTitle>
                <Video className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  <NumberFlow value={stats.totalMeetings} />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  <NumberFlow value={stats.upcomingMeetings} />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completed</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  <NumberFlow value={stats.completedMeetings} />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Hours
                </CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  <NumberFlow value={stats.totalHours} />
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
                  placeholder="Search meetings..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="voice">Voice</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                  <SelectItem value="ongoing">Ongoing</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
              <TabsTrigger value="all">All Meetings</TabsTrigger>
              <TabsTrigger value="recordings">Recordings</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredMeetings.map((meeting) => (
                  <motion.div
                    key={meeting.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Card>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-lg">
                              {meeting.title}
                            </CardTitle>
                            <p className="text-sm text-muted-foreground mt-1">
                              {meeting.description}
                            </p>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => handleShareMeeting(meeting.id)}
                              >
                                <Share2 className="mr-2 h-4 w-4" />
                                Share Link
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  handleInviteParticipant(meeting.id)
                                }
                              >
                                <UserPlus className="mr-2 h-4 w-4" />
                                Invite
                              </DropdownMenuItem>
                              {meeting.recordingUrl && (
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleDownloadRecording(meeting.id)
                                  }
                                >
                                  <Download className="mr-2 h-4 w-4" />
                                  Download
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem
                                onClick={() => handleDeleteMeeting(meeting.id)}
                                className="text-red-600"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Type</span>
                          <Badge
                            variant={
                              meeting.type === "video" ? "default" : "secondary"
                            }
                          >
                            {meeting.type === "video" ? (
                              <Video className="mr-1 h-3 w-3" />
                            ) : (
                              <Phone className="mr-1 h-3 w-3" />
                            )}
                            {meeting.type}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Status</span>
                          <Badge
                            variant={
                              meeting.status === "upcoming"
                                ? "default"
                                : meeting.status === "ongoing"
                                ? "destructive"
                                : "secondary"
                            }
                          >
                            {meeting.status}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Date</span>
                          <span className="font-medium">
                            {meeting.scheduledDate} at {meeting.scheduledTime}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Duration</span>
                          <span className="font-medium">
                            {meeting.duration} min
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Host</span>
                          <span className="font-medium">{meeting.host}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">
                            Participants
                          </span>
                          <span className="font-medium">
                            {meeting.participants.length}
                          </span>
                        </div>
                        {meeting.recordingUrl && (
                          <div className="flex items-center gap-2 text-sm">
                            <Record className="h-4 w-4 text-red-500" />
                            <span className="text-muted-foreground">
                              Recording available
                            </span>
                          </div>
                        )}
                        <div className="flex gap-2 pt-2">
                          <Button
                            className="flex-1"
                            onClick={() => handleJoinMeeting(meeting.id)}
                          >
                            {meeting.type === "video" ? (
                              <Video className="mr-2 h-4 w-4" />
                            ) : (
                              <Phone className="mr-2 h-4 w-4" />
                            )}
                            Join
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => handleShareMeeting(meeting.id)}
                          >
                            <Share2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}
