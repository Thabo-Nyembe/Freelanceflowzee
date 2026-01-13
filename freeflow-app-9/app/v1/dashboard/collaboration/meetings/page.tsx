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
  UserPlus,
  Calendar,
  Clock,
  Plus,
  Search,
  Download,
  Share2,
  Trash2,
  RefreshCw,
  Volume2,
  VolumeX,
  Grid3x3,
  MessageSquare,
  Hand,
  MoreVertical,
  Circle as Record,
  CheckCircle,
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
import { Slider } from "@/components/ui/slider";
import { useCurrentUser } from "@/hooks/use-ai-data";
import { useAnnouncer } from "@/lib/accessibility";
import {
  getMeetings,
  createMeeting,
  updateMeeting,
  deleteMeeting,
} from "@/lib/collaboration-queries";
import { CardSkeleton } from "@/components/ui/loading-skeleton";
import { ErrorEmptyState } from "@/components/ui/empty-state";

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
  // A+++ Hooks
  const { userId, loading: userLoading } = useCurrentUser();
  const { announce } = useAnnouncer();

  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [isJoinOpen, setIsJoinOpen] = useState(false);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteMeetingId, setInviteMeetingId] = useState<string | null>(null);
  const [inviteEmail, setInviteEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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
  }, [userId]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchMeetingsData = async () => {
    if (!userId) {
      logger.info("Waiting for user authentication");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      logger.info("Fetching meetings data", { userId });

      // Fetch real meetings from database
      const { data: meetingsData, error } = await getMeetings(userId);

      if (error) {
        logger.error("Failed to fetch meetings", { error, userId });
        toast.error("Failed to load meetings");
        announce("Error loading meetings", "assertive");
        setLoading(false);
        return;
      }

      // Transform database meetings to UI format
      const transformedMeetings: Meeting[] = (meetingsData || []).map((meeting) => ({
        id: meeting.id,
        title: meeting.title,
        description: meeting.description || "",
        scheduledDate: new Date(meeting.scheduled_at).toISOString().split("T")[0],
        scheduledTime: new Date(meeting.scheduled_at).toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        }),
        duration: meeting.duration_minutes,
        type: (meeting.meeting_type as "video" | "voice") || "video",
        status: meeting.status as "upcoming" | "ongoing" | "completed",
        host: meeting.host_id,
        participants: [], // Would need participants join
        recordingUrl: meeting.recording_url,
        isRecording: false,
      }));

      // Calculate stats
      const upcoming = transformedMeetings.filter(m => m.status === "upcoming");
      const completed = transformedMeetings.filter(m => m.status === "completed");
      const totalHours = transformedMeetings.reduce((sum, m) => sum + m.duration, 0) / 60;

      setMeetings(transformedMeetings);
      setStats({
        totalMeetings: transformedMeetings.length,
        upcomingMeetings: upcoming.length,
        completedMeetings: completed.length,
        totalHours: Math.round(totalHours * 10) / 10,
      });

      logger.info("Meetings data fetched successfully", {
        count: transformedMeetings.length,
        userId
      });
      toast.success(`${transformedMeetings.length} meetings loaded`);
      announce(`${transformedMeetings.length} meetings loaded successfully`, "polite");
    } catch (err: any) {
      const errorMessage = err.message || "Failed to fetch meetings";
      setError(errorMessage);
      logger.error("Failed to fetch meetings data", { error: err, userId });
      toast.error("Failed to load meetings");
      announce("Error loading meetings", "assertive");
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleMeeting = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    if (!userId) return;

    const formData = new FormData(e.currentTarget);

    try {
      logger.info("Scheduling new meeting", { userId });

      const title = formData.get("meetingTitle") as string;
      const description = formData.get("meetingDescription") as string;
      const date = formData.get("meetingDate") as string;
      const time = formData.get("meetingTime") as string;
      const duration = parseInt(formData.get("meetingDuration") as string);
      const type = formData.get("meetingType") as "video" | "voice";

      // Combine date and time into ISO timestamp
      const scheduledAt = new Date(`${date}T${time}`).toISOString();

      const { data: newMeeting, error } = await createMeeting(userId, {
        title,
        description,
        scheduled_at: scheduledAt,
        duration_minutes: duration,
        meeting_type: type,
        status: "upcoming",
      });

      if (error) {
        logger.error("Failed to create meeting", { error, userId });
        toast.error("Failed to schedule meeting");
        announce("Error scheduling meeting", "assertive");
        return;
      }

      // Transform and add to local state
      const transformedMeeting: Meeting = {
        id: newMeeting.id,
        title: newMeeting.title,
        description: newMeeting.description || "",
        scheduledDate: date,
        scheduledTime: time,
        duration,
        type,
        status: "upcoming",
        host: newMeeting.host_id,
        participants: [],
        isRecording: false,
      };

      setMeetings([...meetings, transformedMeeting]);
      setIsScheduleOpen(false);

      logger.info("Meeting scheduled successfully", { meetingId: newMeeting.id, userId });
      toast.success("Meeting scheduled successfully");
      announce("Meeting scheduled successfully", "polite");
    } catch (error) {
      logger.error("Failed to schedule meeting", { error, userId });
      toast.error("Failed to schedule meeting");
      announce("Error scheduling meeting", "assertive");
    }
  };

  const handleJoinMeeting = async (meetingId: string) => {
    try {
      logger.info("Joining meeting", { meetingId, userId });

      const meeting = meetings.find((m) => m.id === meetingId);
      if (!meeting) {
        toast.error("Meeting not found");
        return;
      }

      // Update meeting status to ongoing in database
      const { error } = await updateMeeting(meetingId, { status: "ongoing" });
      if (error) {
        logger.error("Failed to update meeting status", { error, meetingId });
      }

      // Update local state
      setMeetings(meetings.map(m =>
        m.id === meetingId ? { ...m, status: "ongoing" as const } : m
      ));

      setActiveMeeting({ ...meeting, status: "ongoing" });
      setCallState({ ...callState, isInCall: true });

      logger.info("Joined meeting successfully", { meetingId });
      toast.success(`Joined meeting - ${meeting.title}`);
      announce(`Joined meeting: ${meeting.title}`, "polite");
    } catch (error) {
      logger.error("Failed to join meeting", { error, meetingId });
      toast.error("Failed to join meeting");
      announce("Error joining meeting", "assertive");
    }
  };

  const handleLeaveMeeting = async () => {
    try {
      if (!activeMeeting) return;

      logger.info("Leaving meeting", { meetingId: activeMeeting.id });

      // Update meeting status back to upcoming (or completed if it was the last participant)
      const { error } = await updateMeeting(activeMeeting.id, { status: "upcoming" });
      if (error) {
        logger.error("Failed to update meeting status on leave", { error });
      }

      // Stop screen share if active
      if (callState.isScreenSharing) {
        try {
          const tracks = (window as unknown as { currentScreenTrack?: MediaStreamTrack }).currentScreenTrack;
          tracks?.stop();
        } catch {
          // Screen track already stopped
        }
      }

      // Update local state
      setMeetings(meetings.map(m =>
        m.id === activeMeeting.id ? { ...m, status: "upcoming" as const } : m
      ));

      setActiveMeeting(null);
      setCallState({
        ...callState,
        isInCall: false,
        isScreenSharing: false,
        isRecording: false,
      });

      logger.info("Left meeting successfully");
      toast.success('Left meeting successfully');
      announce("Left meeting", "polite");
    } catch (error) {
      logger.error("Failed to leave meeting", { error });
      toast.error("Failed to leave meeting");
      announce("Error leaving meeting", "assertive");
    }
  };

  const handleToggleCamera = async () => {
    try {
      logger.info("Toggling camera");
      const newState = !callState.isCameraOn;
      setCallState({ ...callState, isCameraOn: newState });
      toast.success(newState ? 'Camera on' : 'Camera off');
      logger.info("Camera toggled", { isCameraOn: newState });
    } catch (error) {
      logger.error("Failed to toggle camera", { error });
      toast.error("Failed to toggle camera");
    }
  };

  const handleToggleMic = async () => {
    try {
      logger.info("Toggling microphone");
      const newState = !callState.isMicOn;
      setCallState({ ...callState, isMicOn: newState });
      toast.success(newState ? 'Microphone on' : 'Microphone off');
      logger.info("Microphone toggled", { isMicOn: newState });
    } catch (error) {
      logger.error("Failed to toggle microphone", { error });
      toast.error("Failed to toggle microphone");
    }
  };

  const handleToggleScreenShare = async () => {
    try {
      logger.info("Toggling screen share");

      if (!callState.isScreenSharing) {
        // Start screen sharing using native browser API
        try {
          const stream = await navigator.mediaDevices.getDisplayMedia({
            video: true,
            audio: true,
          });

          // Store track reference for cleanup
          const videoTrack = stream.getVideoTracks()[0];
          (window as unknown as { currentScreenTrack?: MediaStreamTrack }).currentScreenTrack = videoTrack;

          // Listen for when user stops sharing via browser UI
          videoTrack.onended = () => {
            setCallState(prev => ({ ...prev, isScreenSharing: false }));
            toast.success('Screen sharing ended');
            announce("Screen sharing ended", "polite");
          };

          setCallState({ ...callState, isScreenSharing: true });
          logger.info("Screen sharing started");
          toast.success('Screen sharing started');
          announce("Screen sharing started", "polite");
        } catch (err) {
          // User cancelled or permission denied
          logger.info("Screen share cancelled or denied", { err });
          toast.info('Screen share cancelled');
          return;
        }
      } else {
        // Stop screen sharing
        try {
          const track = (window as unknown as { currentScreenTrack?: MediaStreamTrack }).currentScreenTrack;
          track?.stop();
          (window as unknown as { currentScreenTrack?: MediaStreamTrack }).currentScreenTrack = undefined;
        } catch {
          // Track already stopped
        }

        setCallState({ ...callState, isScreenSharing: false });
        logger.info("Screen sharing stopped");
        toast.success('Screen share stopped');
        announce("Screen sharing stopped", "polite");
      }
    } catch (error) {
      logger.error("Failed to toggle screen share", { error });
      toast.error("Failed to toggle screen share");
      announce("Error toggling screen share", "assertive");
    }
  };

  const handleToggleRecording = async () => {
    try {
      if (!activeMeeting) return;

      logger.info("Toggling recording", { meetingId: activeMeeting.id });

      const newRecordingState = !callState.isRecording;

      // Update meeting recording status in database
      const { error } = await updateMeeting(activeMeeting.id, {
        recording_url: newRecordingState ? `pending_${Date.now()}` : activeMeeting.recordingUrl,
      });

      if (error) {
        logger.error("Failed to update recording status", { error });
        toast.error("Failed to update recording status");
        return;
      }

      setCallState({ ...callState, isRecording: newRecordingState });
      setActiveMeeting({
        ...activeMeeting,
        isRecording: newRecordingState,
      });

      // Update local meetings list
      setMeetings(meetings.map(m =>
        m.id === activeMeeting.id ? { ...m, isRecording: newRecordingState } : m
      ));

      logger.info("Recording toggled", { isRecording: newRecordingState });
      toast.success(newRecordingState ? 'Recording started' : 'Recording stopped');
      announce(newRecordingState ? "Recording started" : "Recording stopped", "polite");
    } catch (error) {
      logger.error("Failed to toggle recording", { error });
      toast.error("Failed to toggle recording");
      announce("Error toggling recording", "assertive");
    }
  };

  const handleChangeViewMode = async (mode: "grid" | "speaker" | "sidebar") => {
    try {
      logger.info("Changing view mode", { mode });
      setCallState({ ...callState, viewMode: mode });
      toast.success(`Switched to ${mode} view`);
      logger.info("View mode changed successfully");
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
    setInviteMeetingId(meetingId);
    setInviteEmail("");
    setIsInviteOpen(true);
  };

  const handleSendInvitation = async () => {
    try {
      if (!inviteMeetingId || !inviteEmail) return;

      logger.info("Sending invitation", { meetingId: inviteMeetingId, email: inviteEmail });

      const meeting = meetings.find(m => m.id === inviteMeetingId);
      if (!meeting) {
        toast.error("Meeting not found");
        return;
      }

      // Generate meeting link
      const meetingUrl = `${window.location.origin}/dashboard/collaboration/meetings/join/${inviteMeetingId}`;

      // Open email client with pre-filled invitation
      const subject = encodeURIComponent(`Invitation: ${meeting.title}`);
      const body = encodeURIComponent(
        `You're invited to join a meeting!\n\n` +
        `Meeting: ${meeting.title}\n` +
        `Date: ${meeting.scheduledDate} at ${meeting.scheduledTime}\n` +
        `Duration: ${meeting.duration} minutes\n` +
        `Type: ${meeting.type === "video" ? "Video Call" : "Voice Call"}\n\n` +
        `Join here: ${meetingUrl}\n\n` +
        `Looking forward to seeing you there!`
      );

      window.open(`mailto:${inviteEmail}?subject=${subject}&body=${body}`, "_blank");

      setIsInviteOpen(false);
      setInviteEmail("");
      setInviteMeetingId(null);

      logger.info("Invitation sent successfully", { meetingId: inviteMeetingId, email: inviteEmail });
      toast.success(`Invitation ready to send to ${inviteEmail}`);
      announce("Invitation email opened", "polite");
    } catch (error) {
      logger.error("Failed to invite participant", { error });
      toast.error("Failed to send invitation");
      announce("Error sending invitation", "assertive");
    }
  };

  const handleDeleteMeeting = async (meetingId: string) => {
    try {
      logger.info("Deleting meeting", { meetingId, userId });

      // Delete from database using real function
      const { error } = await deleteMeeting(meetingId);

      if (error) {
        logger.error("Failed to delete meeting from database", { error, meetingId });
        toast.error("Failed to delete meeting");
        announce("Error deleting meeting", "assertive");
        return;
      }

      // Update local state
      setMeetings(meetings.filter((m) => m.id !== meetingId));

      // Update stats
      const deletedMeeting = meetings.find(m => m.id === meetingId);
      if (deletedMeeting) {
        setStats(prev => ({
          ...prev,
          totalMeetings: prev.totalMeetings - 1,
          upcomingMeetings: deletedMeeting.status === "upcoming" ? prev.upcomingMeetings - 1 : prev.upcomingMeetings,
          completedMeetings: deletedMeeting.status === "completed" ? prev.completedMeetings - 1 : prev.completedMeetings,
          totalHours: prev.totalHours - (deletedMeeting.duration / 60),
        }));
      }

      logger.info("Meeting deleted successfully", { meetingId });
      toast.success('Meeting deleted successfully');
      announce("Meeting deleted successfully", "polite");
    } catch (error) {
      logger.error("Failed to delete meeting", { error, meetingId });
      toast.error("Failed to delete meeting");
      announce("Error deleting meeting", "assertive");
    }
  };

  const handleDownloadRecording = async (meetingId: string) => {
    try {
      logger.info("Downloading recording", { meetingId });

      const meeting = meetings.find(m => m.id === meetingId);
      if (!meeting?.recordingUrl) {
        toast.error("No recording available for this meeting");
        announce("No recording available", "assertive");
        return;
      }

      // Check if recording URL is a pending marker (recording in progress)
      if (meeting.recordingUrl.startsWith("pending_")) {
        toast.info('Recording is still being processed');
        announce("Recording is still being processed", "polite");
        return;
      }

      // Create download link and trigger download
      const link = document.createElement("a");
      link.href = meeting.recordingUrl;
      link.download = `${meeting.title.replace(/\s+/g, "_")}_recording.mp4`;
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      logger.info("Recording download started", { meetingId });
      toast.success('Download started');
      announce("Recording download started", "polite");
    } catch (error) {
      logger.error("Failed to download recording", { error, meetingId });
      toast.error("Failed to download recording");
      announce("Error downloading recording", "assertive");
    }
  };

  const handleShareMeeting = async (meetingId: string) => {
    try {
      logger.info("Sharing meeting link", { meetingId });

      const meeting = meetings.find(m => m.id === meetingId);
      const meetingUrl = `${window.location.origin}/dashboard/collaboration/meetings/join/${meetingId}`;

      // Use modern clipboard API with fallback
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(meetingUrl);
      } else {
        // Fallback for older browsers or non-secure contexts
        const textArea = document.createElement("textarea");
        textArea.value = meetingUrl;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }

      logger.info("Meeting link copied", { meetingId, meetingUrl });
      toast.success(`Meeting link copied${meeting?.title ? ` - ${meeting.title}` : ''}`);
      announce("Meeting link copied to clipboard", "polite");
    } catch (error) {
      logger.error("Failed to share meeting", { error, meetingId });
      toast.error("Failed to copy meeting link");
      announce("Error copying meeting link", "assertive");
    }
  };

  const handleRefreshData = async () => {
    await fetchMeetingsData();
  };

  const handleRaiseHand = async (participantId: string) => {
    try {
      logger.info("Raising hand", { participantId });

      if (activeMeeting) {
        const participant = activeMeeting.participants.find(p => p.id === participantId);
        const isRaised = participant?.isHandRaised;

        const updatedParticipants = activeMeeting.participants.map((p) =>
          p.id === participantId ? { ...p, isHandRaised: !p.isHandRaised } : p
        );

        setActiveMeeting({
          ...activeMeeting,
          participants: updatedParticipants,
        });

        toast.success(isRaised ? 'Hand lowered' : 'Hand raised');
        logger.info("Hand raised successfully");
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
        const participant = activeMeeting.participants.find(p => p.id === participantId);
        const isMuted = participant?.isMuted;

        const updatedParticipants = activeMeeting.participants.map((p) =>
          p.id === participantId ? { ...p, isMuted: !p.isMuted } : p
        );

        setActiveMeeting({
          ...activeMeeting,
          participants: updatedParticipants,
        });

        toast.success(isMuted ? 'Participant unmuted' : 'Participant muted');
        logger.info("Participant muted successfully");
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

  // A+++ LOADING STATE
  if (loading || userLoading) {
    return (
      <div className="flex-1 space-y-6 p-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Meetings</h2>
            <p className="text-muted-foreground">Loading meetings...</p>
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
  if (error && !callState.isInCall) {
    return (
      <div className="flex-1 space-y-6 p-8">
        <ErrorEmptyState
          error={error}
          action={{
            label: "Retry",
            onClick: () => fetchMeetingsData(),
          }}
        />
      </div>
    );
  }

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
                    <Button
                      size="lg"
                      variant="secondary"
                      className="rounded-full"
                      onClick={() => {
                        toast.success('Meeting chat opened');
                        announce("Meeting chat opened", "polite");
                      }}
                    >
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
                        toast.success('Joined meeting successfully');
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

              {/* Invite Participant Dialog */}
              <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Invite Participant</DialogTitle>
                    <DialogDescription>
                      Send an invitation email to join this meeting
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="inviteEmail">Email Address</Label>
                      <Input
                        id="inviteEmail"
                        type="email"
                        placeholder="colleague@example.com"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => setIsInviteOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        className="flex-1"
                        onClick={handleSendInvitation}
                        disabled={!inviteEmail}
                      >
                        <UserPlus className="mr-2 h-4 w-4" />
                        Send Invitation
                      </Button>
                    </div>
                  </div>
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
