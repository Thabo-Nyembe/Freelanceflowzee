"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Image,
  Video,
  FileText,
  Music,
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  Share2,
  Trash2,
  Edit,
  Copy,
  Star,
  StarOff,
  Eye,
  EyeOff,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Grid3x3,
  List,
  MoreVertical,
  Folder,
  Tag,
  Clock,
  User,
  Heart,
  RefreshCw,
  Archive,
  CheckCircle,
  XCircle,
  AlertCircle,
  Film,
  Camera,
  Mic,
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
  }, []);

  const fetchMediaData = async () => {
    try {
      setLoading(true);
      logger.info("Fetching media data");

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const mockMedia: MediaItem[] = [
        {
          id: "1",
          name: "Project Banner.png",
          type: "image",
          url: "/media/banner.png",
          thumbnail: "/media/banner-thumb.png",
          size: "2.4 MB",
          uploadedBy: "John Doe",
          uploadedAt: "2024-01-20",
          tags: ["design", "banner"],
          isFavorite: true,
          isShared: true,
          views: 45,
          downloads: 12,
        },
        {
          id: "2",
          name: "Product Demo.mp4",
          type: "video",
          url: "/media/demo.mp4",
          thumbnail: "/media/demo-thumb.png",
          size: "24.8 MB",
          duration: "5:32",
          uploadedBy: "Sarah Johnson",
          uploadedAt: "2024-01-19",
          tags: ["video", "demo"],
          isFavorite: false,
          isShared: true,
          views: 128,
          downloads: 34,
        },
        {
          id: "3",
          name: "Presentation.pdf",
          type: "document",
          url: "/media/presentation.pdf",
          size: "5.1 MB",
          uploadedBy: "Mike Chen",
          uploadedAt: "2024-01-18",
          tags: ["presentation", "document"],
          isFavorite: true,
          isShared: false,
          views: 67,
          downloads: 23,
        },
        {
          id: "4",
          name: "Background Music.mp3",
          type: "audio",
          url: "/media/music.mp3",
          size: "3.2 MB",
          duration: "3:45",
          uploadedBy: "Emily Davis",
          uploadedAt: "2024-01-17",
          tags: ["audio", "music"],
          isFavorite: false,
          isShared: true,
          views: 89,
          downloads: 45,
        },
      ];

      setMediaItems(mockMedia);

      const totalSizeMB = mockMedia.reduce((sum, item) => {
        const size = parseFloat(item.size);
        return sum + size;
      }, 0);

      setStats({
        totalFiles: mockMedia.length,
        totalSize: Math.round(totalSizeMB),
        totalViews: mockMedia.reduce((sum, item) => sum + item.views, 0),
        totalDownloads: mockMedia.reduce((sum, item) => sum + item.downloads, 0),
      });

      logger.info("Media data fetched successfully");
      toast.success("Media library loaded");
    } catch (error) {
      logger.error("Failed to fetch media data", { error });
      toast.error("Failed to load media");
    } finally {
      setLoading(false);
    }
  };

  const handleUploadMedia = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    try {
      logger.info("Uploading media");

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

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

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setMediaItems(
        mediaItems.map((m) =>
          m.id === mediaId ? { ...m, downloads: m.downloads + 1 } : m
        )
      );

      logger.info("Media downloaded successfully");
      toast.success("Download started");
    } catch (error) {
      logger.error("Failed to download media", { error });
      toast.error("Failed to download media");
    }
  };

  const handleToggleFavorite = async (mediaId: string) => {
    try {
      logger.info("Toggling favorite", { mediaId });

      setMediaItems(
        mediaItems.map((m) =>
          m.id === mediaId ? { ...m, isFavorite: !m.isFavorite } : m
        )
      );

      logger.info("Favorite toggled");
      toast.success("Favorite updated");
    } catch (error) {
      logger.error("Failed to toggle favorite", { error });
      toast.error("Failed to update favorite");
    }
  };

  const handleShareMedia = async (mediaId: string) => {
    try {
      logger.info("Sharing media", { mediaId });

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

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
    try {
      logger.info("Deleting media", { mediaId });

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      setMediaItems(mediaItems.filter((m) => m.id !== mediaId));

      logger.info("Media deleted successfully");
      toast.success("Media deleted");
    } catch (error) {
      logger.error("Failed to delete media", { error });
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

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 800));

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

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

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
