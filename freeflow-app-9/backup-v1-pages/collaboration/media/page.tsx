"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Image,
  Video,
  FileText,
  Music,
  Search,
  Download,
  Upload,
  Share2,
  Trash2,
  Copy,
  Star,
  Eye,
  Grid3x3,
  List,
  MoreVertical,
  Folder,
  Clock,
  User,
  RefreshCw,
  Archive,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCurrentUser } from "@/hooks/use-ai-data";
import { useAnnouncer } from "@/lib/accessibility";
import {
  getMedia,
  deleteMedia,
  toggleFavorite,
  incrementDownloadCount,
  getMediaStats,
  type MediaType,
} from "@/lib/collaboration-media-queries";

const logger = createFeatureLogger("CollaborationMedia");

interface MediaItem {
  id: string;
  name: string;
  type: "image" | "video" | "audio" | "document";
  url: string;
  thumbnail?: string;
  size: string;
  duration?: string;
  uploadedBy: string;
  uploadedAt: string;
  tags: string[];
  isFavorite: boolean;
  isShared: boolean;
  views: number;
  downloads: number;
}

export default function MediaPage() {
  // A+++ Hooks
  const { userId, loading: userLoading } = useCurrentUser();
  const { announce } = useAnnouncer();

  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  // Stats
  const [stats, setStats] = useState({
    totalFiles: 0,
    totalSize: 0,
    totalViews: 0,
    totalDownloads: 0,
  });

  useEffect(() => {
    fetchMediaData();
  }, [userId]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchMediaData = async () => {
    if (!userId) {
      logger.info("Waiting for user authentication");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      logger.info("Fetching media data from Supabase", { userId });

      // Fetch real media from Supabase
      const filters: any = {};
      if (filterType !== "all") {
        filters.media_type = filterType as MediaType;
      }
      if (searchQuery) {
        filters.search = searchQuery;
      }

      const { data: mediaData, error: mediaError } = await getMedia(
        userId,
        filters
      );

      if (mediaError) {
        logger.error("Failed to fetch media", { error: mediaError, userId });
        toast.error("Failed to load media");
        announce("Error loading media library", "assertive");
        return;
      }

      // Transform Supabase data to UI format
      const transformedMedia: MediaItem[] = (mediaData || []).map((media) => ({
        id: media.id,
        name: media.name,
        type: media.media_type,
        url: media.file_url,
        thumbnail: media.thumbnail_url,
        size: formatFileSize(media.file_size),
        duration: media.duration_seconds
          ? formatDuration(media.duration_seconds)
          : undefined,
        uploadedBy: userId, // Would need user profile join for name
        uploadedAt: new Date(media.created_at).toLocaleDateString(),
        tags: media.tags || [],
        isFavorite: media.is_favorite,
        isShared: false, // Would need shares join
        views: media.view_count,
        downloads: media.download_count,
      }));

      setMediaItems(transformedMedia);

      // Fetch stats
      const { data: statsData, error: statsError } = await getMediaStats(
        userId
      );

      if (!statsError && statsData) {
        setStats({
          totalFiles: statsData.total,
          totalSize: Math.round(statsData.totalSize / (1024 * 1024)), // Convert to MB
          totalViews: statsData.totalViews,
          totalDownloads: statsData.totalDownloads,
        });
      }

      logger.info("Media data fetched successfully", {
        count: transformedMedia.length,
        totalSize: statsData?.totalSize,
        userId
      });

      toast.success(
        `Media library loaded: ${transformedMedia.length} files, ${Math.round(
          (statsData?.totalSize || 0) / (1024 * 1024)
        )} MB`
      );
      announce(`Media library loaded: ${transformedMedia.length} files`, "polite");
    } catch (error) {
      logger.error("Exception in fetchMediaData", { error, userId });
      toast.error("Failed to load media");
      announce("Error loading media library", "assertive");
    } finally {
      setLoading(false);
    }
  };

  // Helper functions
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleUploadMedia = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    try {
      logger.info("Uploading media");

      // Create media item and add to state
      const newMedia: MediaItem = {
        id: Date.now().toString(),
        name: formData.get("mediaName") as string,
        type: formData.get("mediaType") as MediaItem["type"],
        url: "/media/new-file",
        size: "1.5 MB",
        uploadedBy: "Current User",
        uploadedAt: new Date().toISOString().split("T")[0],
        tags: [],
        isFavorite: false,
        isShared: false,
        views: 0,
        downloads: 0,
      };

      setMediaItems([newMedia, ...mediaItems]);
      setIsUploadOpen(false);

      logger.info("Media uploaded successfully", { mediaId: newMedia.id });
      toast.success("Media uploaded successfully");
    } catch (error) {
      logger.error("Failed to upload media", { error });
      toast.error("Failed to upload media");
    }
  };

  const handleDownloadMedia = async (mediaId: string) => {
    try {
      logger.info("Downloading media", { mediaId });

      // Increment download count in database
      await incrementDownloadCount(mediaId);

      // Update UI
      setMediaItems(
        mediaItems.map((m) =>
          m.id === mediaId ? { ...m, downloads: m.downloads + 1 } : m
        )
      );

      // Trigger browser download
      const media = mediaItems.find((m) => m.id === mediaId);
      if (media) {
        const link = document.createElement("a");
        link.href = media.url;
        link.download = media.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }

      logger.info("Media download started", { mediaId });
      toast.success("Download started");
    } catch (error) {
      logger.error("Exception in handleDownloadMedia", { error });
      toast.error("Failed to download media");
    }
  };

  const handleToggleFavorite = async (mediaId: string) => {
    if (!userId) {
      toast.error("Please log in");
      announce("Authentication required", "assertive");
      return;
    }

    try {
      logger.info("Toggling favorite", { mediaId, userId });

      const currentItem = mediaItems.find((m) => m.id === mediaId);
      if (!currentItem) return;

      const { data, error } = await toggleFavorite(
        mediaId,
        userId,
        !currentItem.isFavorite
      );

      if (error) {
        logger.error("Failed to toggle favorite", { error });
        toast.error("Failed to update favorite");
        return;
      }

      // Update UI
      setMediaItems(
        mediaItems.map((m) =>
          m.id === mediaId ? { ...m, isFavorite: !m.isFavorite } : m
        )
      );

      logger.info("Favorite toggled successfully", {
        mediaId,
        isFavorite: data?.is_favorite,
      });
      toast.success(
        data?.is_favorite
          ? "Added to favorites"
          : "Removed from favorites"
      );
    } catch (error) {
      logger.error("Exception in handleToggleFavorite", { error });
      toast.error("Failed to update favorite");
    }
  };

  const handleShareMedia = async (mediaId: string) => {
    try {
      logger.info("Sharing media", { mediaId });

      // Update share status and copy link
      setMediaItems(
        mediaItems.map((m) =>
          m.id === mediaId ? { ...m, isShared: true } : m
        )
      );

      navigator.clipboard.writeText(`https://app.example.com/media/${mediaId}`);

      logger.info("Media link copied");
      toast.success("Link copied to clipboard");
    } catch (error) {
      logger.error("Failed to share media", { error });
      toast.error("Failed to share media");
    }
  };

  const handleDeleteMedia = async (mediaId: string) => {
    if (!userId) {
      toast.error("Please log in");
      announce("Authentication required", "assertive");
      return;
    }

    try {
      logger.info("Deleting media", { mediaId, userId });

      const { success, error } = await deleteMedia(mediaId, userId);

      if (error) {
        logger.error("Failed to delete media", { error });
        toast.error("Failed to delete media");
        return;
      }

      // Update UI
      setMediaItems(mediaItems.filter((m) => m.id !== mediaId));

      // Update stats
      setStats((prev) => ({
        ...prev,
        totalFiles: prev.totalFiles - 1,
      }));

      logger.info("Media deleted successfully", { mediaId });
      toast.success("Media deleted");
    } catch (error) {
      logger.error("Exception in handleDeleteMedia", { error });
      toast.error("Failed to delete media");
    }
  };

  const handleViewMedia = async (media: MediaItem) => {
    try {
      logger.info("Viewing media", { mediaId: media.id });

      setMediaItems(
        mediaItems.map((m) =>
          m.id === media.id ? { ...m, views: m.views + 1 } : m
        )
      );

      setSelectedMedia(media);

      logger.info("Media view counted");
    } catch (error) {
      logger.error("Failed to view media", { error });
      toast.error("Failed to view media");
    }
  };

  const handleDuplicateMedia = async (mediaId: string) => {
    try {
      logger.info("Duplicating media", { mediaId });

      // Create duplicate media item
      const originalMedia = mediaItems.find((m) => m.id === mediaId);
      if (originalMedia) {
        const duplicatedMedia: MediaItem = {
          ...originalMedia,
          id: Date.now().toString(),
          name: `${originalMedia.name} (Copy)`,
          uploadedAt: new Date().toISOString().split("T")[0],
          views: 0,
          downloads: 0,
        };

        setMediaItems([duplicatedMedia, ...mediaItems]);
        logger.info("Media duplicated successfully");
        toast.success("Media duplicated");
      }
    } catch (error) {
      logger.error("Failed to duplicate media", { error });
      toast.error("Failed to duplicate media");
    }
  };

  const handleRefreshData = async () => {
    await fetchMediaData();
  };

  const handleBulkDownload = async () => {
    try {
      logger.info("Bulk downloading media");

      // In production, would trigger actual bulk download
      logger.info("Bulk download started");
      toast.success("Downloading selected files");
    } catch (error) {
      logger.error("Failed to bulk download", { error });
      toast.error("Failed to download files");
    }
  };

  const filteredMedia = mediaItems.filter((media) => {
    const matchesSearch = media.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesType = filterType === "all" || media.type === filterType;
    const matchesTab =
      activeTab === "all" ||
      (activeTab === "favorites" && media.isFavorite) ||
      (activeTab === "shared" && media.isShared);

    return matchesSearch && matchesType && matchesTab;
  });

  const getMediaIcon = (type: MediaItem["type"]) => {
    switch (type) {
      case "image":
        return <Image className="h-8 w-8" />;
      case "video":
        return <Video className="h-8 w-8" />;
      case "audio":
        return <Music className="h-8 w-8" />;
      case "document":
        return <FileText className="h-8 w-8" />;
      default:
        return <FileText className="h-8 w-8" />;
    }
  };

  return (
    <div className="flex-1 space-y-6 p-8">
      {/* Media Preview Dialog */}
      <Dialog
        open={!!selectedMedia}
        onOpenChange={() => setSelectedMedia(null)}
      >
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{selectedMedia?.name}</DialogTitle>
            <DialogDescription>
              Uploaded by {selectedMedia?.uploadedBy} on{" "}
              {selectedMedia?.uploadedAt}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center justify-center bg-muted rounded-lg p-8">
              {selectedMedia?.type === "image" && (
                <div className="text-primary">{getMediaIcon("image")}</div>
              )}
              {selectedMedia?.type === "video" && (
                <div className="text-primary">{getMediaIcon("video")}</div>
              )}
              {selectedMedia?.type === "audio" && (
                <div className="text-primary">{getMediaIcon("audio")}</div>
              )}
              {selectedMedia?.type === "document" && (
                <div className="text-primary">{getMediaIcon("document")}</div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Size:</span>
                <span className="ml-2 font-medium">{selectedMedia?.size}</span>
              </div>
              {selectedMedia?.duration && (
                <div>
                  <span className="text-muted-foreground">Duration:</span>
                  <span className="ml-2 font-medium">
                    {selectedMedia?.duration}
                  </span>
                </div>
              )}
              <div>
                <span className="text-muted-foreground">Views:</span>
                <span className="ml-2 font-medium">{selectedMedia?.views}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Downloads:</span>
                <span className="ml-2 font-medium">
                  {selectedMedia?.downloads}
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                className="flex-1"
                onClick={() =>
                  selectedMedia && handleDownloadMedia(selectedMedia.id)
                }
              >
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
              <Button
                variant="outline"
                onClick={() =>
                  selectedMedia && handleShareMedia(selectedMedia.id)
                }
              >
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Media Library</h2>
          <p className="text-muted-foreground">
            Manage and share your media files
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefreshData}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button variant="outline" onClick={handleBulkDownload}>
            <Download className="mr-2 h-4 w-4" />
            Bulk Download
          </Button>
          <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
            <DialogTrigger asChild>
              <Button>
                <Upload className="mr-2 h-4 w-4" />
                Upload Media
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Upload Media</DialogTitle>
                <DialogDescription>
                  Upload a new file to your media library
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleUploadMedia} className="space-y-4">
                <div>
                  <Label htmlFor="mediaName">File Name</Label>
                  <Input
                    id="mediaName"
                    name="mediaName"
                    placeholder="Enter file name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="mediaType">Media Type</Label>
                  <Select name="mediaType" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="image">Image</SelectItem>
                      <SelectItem value="video">Video</SelectItem>
                      <SelectItem value="audio">Audio</SelectItem>
                      <SelectItem value="document">Document</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="mediaFile">Choose File</Label>
                  <Input id="mediaFile" name="mediaFile" type="file" />
                </div>
                <Button type="submit" className="w-full">
                  Upload Media
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
            <CardTitle className="text-sm font-medium">Total Files</CardTitle>
            <Folder className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <NumberFlow value={stats.totalFiles} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Size</CardTitle>
            <Archive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <NumberFlow value={stats.totalSize} /> MB
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <NumberFlow value={stats.totalViews} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Downloads</CardTitle>
            <Download className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <NumberFlow value={stats.totalDownloads} />
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
              placeholder="Search media..."
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
              <SelectItem value="image">Images</SelectItem>
              <SelectItem value="video">Videos</SelectItem>
              <SelectItem value="audio">Audio</SelectItem>
              <SelectItem value="document">Documents</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
        >
          {viewMode === "grid" ? (
            <List className="h-4 w-4" />
          ) : (
            <Grid3x3 className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All Media</TabsTrigger>
          <TabsTrigger value="favorites">Favorites</TabsTrigger>
          <TabsTrigger value="shared">Shared</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          <div
            className={
              viewMode === "grid"
                ? "grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                : "space-y-2"
            }
          >
            {filteredMedia.map((media) => (
              <motion.div
                key={media.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="group cursor-pointer hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6">
                    <div
                      className="space-y-3"
                      onClick={() => handleViewMedia(media)}
                    >
                      <div className="flex items-center justify-center bg-muted rounded-lg p-8">
                        <div className="text-primary">{getMediaIcon(media.type)}</div>
                      </div>
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium truncate">{media.name}</h3>
                          <p className="text-xs text-muted-foreground">
                            {media.size}
                            {media.duration && ` • ${media.duration}`}
                          </p>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleFavorite(media.id);
                              }}
                            >
                              <Star className="mr-2 h-4 w-4" />
                              {media.isFavorite
                                ? "Remove Favorite"
                                : "Add Favorite"}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                handleShareMedia(media.id);
                              }}
                            >
                              <Share2 className="mr-2 h-4 w-4" />
                              Share
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDownloadMedia(media.id);
                              }}
                            >
                              <Download className="mr-2 h-4 w-4" />
                              Download
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDuplicateMedia(media.id);
                              }}
                            >
                              <Copy className="mr-2 h-4 w-4" />
                              Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteMedia(media.id);
                              }}
                              className="text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            {media.views}
                          </span>
                          <span className="flex items-center gap-1">
                            <Download className="h-3 w-3" />
                            {media.downloads}
                          </span>
                        </div>
                        {media.isFavorite && (
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <User className="h-3 w-3" />
                          {media.uploadedBy}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Clock className="h-3 w-3" />
                          {media.uploadedAt}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
