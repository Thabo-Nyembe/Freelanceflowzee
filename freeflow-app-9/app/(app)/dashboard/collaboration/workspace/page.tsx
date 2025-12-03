"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FolderOpen,
  Plus,
  Search,
  Filter,
  MoreVertical,
  FileText,
  Image,
  Video,
  Download,
  Upload,
  Share2,
  Trash2,
  Edit,
  Copy,
  Star,
  StarOff,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Clock,
  User,
  Users,
  Calendar,
  Tag,
  Grid3x3,
  List,
  RefreshCw,
  Settings,
  Archive,
  FolderPlus,
  File,
  Folder,
  CheckCircle,
  AlertCircle,
  XCircle,
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
  getFolders,
  getFiles,
  createFolder as createFolderDB,
  createFile,
  updateFolder,
  updateFile,
  deleteFolder as deleteFolderDB,
  deleteFile as deleteFileDB,
  moveFile,
  shareFile,
  getWorkspaceStats,
  getFolderContents,
  type WorkspaceFolder,
  type WorkspaceFile,
  type FileVisibility,
} from "@/lib/collaboration-workspace-queries";
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

const logger = createFeatureLogger("CollaborationWorkspace");

interface WorkspaceItem {
  id: string;
  name: string;
  type: "folder" | "file";
  fileType?: string;
  size?: string;
  createdBy: string;
  createdAt: string;
  modifiedAt: string;
  isShared: boolean;
  isLocked: boolean;
  isFavorite: boolean;
  tags: string[];
  permissions: string;
}

export default function WorkspacePage() {
  // A+++ Hooks
  const { userId, loading: userLoading } = useCurrentUser();
  const { announce } = useAnnouncer();

  const [items, setItems] = useState<WorkspaceItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [filterType, setFilterType] = useState("all");
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentPath, setCurrentPath] = useState("/");
  const [activeTab, setActiveTab] = useState("all");

  // Stats
  const [stats, setStats] = useState({
    totalFiles: 0,
    totalFolders: 0,
    sharedItems: 0,
    storageUsed: 0,
  });

  useEffect(() => {
    fetchWorkspaceData();
  }, [userId]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchWorkspaceData = async () => {
    if (!userId) {
      logger.info("Waiting for user authentication");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      logger.info("Fetching workspace data from Supabase", { userId });

      // Fetch folders and files from Supabase
      const { data: foldersData, error: foldersError } = await getFolders(userId, null);
      const { data: filesData, error: filesError } = await getFiles(userId, {});

      if (foldersError) {
        logger.error("Failed to fetch folders", { error: foldersError.message });
      }
      if (filesError) {
        logger.error("Failed to fetch files", { error: filesError.message });
      }

      // Helper function to format file size
      const formatFileSize = (bytes: number): string => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
      };

      // Transform folders to UI format
      const folderItems: WorkspaceItem[] = (foldersData || []).map((folder) => ({
        id: folder.id,
        name: folder.name,
        type: "folder" as const,
        createdBy: folder.created_by || userId,
        createdAt: new Date(folder.created_at).toLocaleDateString(),
        modifiedAt: new Date(folder.updated_at).toLocaleDateString(),
        isShared: false, // TODO: Check file_shares table
        isLocked: false,
        isFavorite: folder.is_favorite,
        tags: [],
        permissions: "edit",
      }));

      // Transform files to UI format
      const fileItems: WorkspaceItem[] = (filesData || []).map((file) => ({
        id: file.id,
        name: file.name,
        type: "file" as const,
        fileType: file.file_type,
        size: formatFileSize(file.file_size),
        createdBy: file.uploaded_by || userId,
        createdAt: new Date(file.created_at).toLocaleDateString(),
        modifiedAt: new Date(file.updated_at).toLocaleDateString(),
        isShared: file.visibility !== "private",
        isLocked: false,
        isFavorite: file.is_favorite,
        tags: file.tags || [],
        permissions: "edit",
      }));

      const allItems = [...folderItems, ...fileItems];
      setItems(allItems);

      // Fetch stats
      const { data: statsData, error: statsError } = await getWorkspaceStats(userId);

      if (!statsError && statsData) {
        setStats({
          totalFiles: statsData.totalFiles,
          totalFolders: statsData.totalFolders,
          sharedItems: statsData.byVisibility.team + statsData.byVisibility.public,
          storageUsed: Math.round(statsData.totalSize / (1024 * 1024)), // Convert to MB
        });
      }

      logger.info("Workspace data fetched successfully", {
        foldersCount: folderItems.length,
        filesCount: fileItems.length,
        userId
      });
      toast.success(`Loaded ${allItems.length} items`);
      announce(`${allItems.length} workspace items loaded successfully`, "polite");
    } catch (error) {
      logger.error("Failed to fetch workspace data", { error, userId });
      toast.error("Failed to load workspace");
      announce("Error loading workspace", "assertive");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFolder = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!userId) return;

    const formData = new FormData(e.currentTarget);
    const folderName = formData.get("folderName") as string;

    try {
      logger.info("Creating new folder", { userId, folderName });

      const { data: newFolderData, error } = await createFolderDB(
        userId,
        folderName,
        null
      );

      if (error) {
        throw new Error(error.message || "Failed to create folder");
      }

      if (newFolderData) {
        const newFolder: WorkspaceItem = {
          id: newFolderData.id,
          name: newFolderData.name,
          type: "folder",
          createdBy: userId,
          createdAt: new Date(newFolderData.created_at).toLocaleDateString(),
          modifiedAt: new Date(newFolderData.updated_at).toLocaleDateString(),
          isShared: false,
          isLocked: false,
          isFavorite: newFolderData.is_favorite,
          tags: [],
          permissions: "edit",
        };

        setItems([...items, newFolder]);
        setIsCreateFolderOpen(false);

        logger.info("Folder created successfully", { folderId: newFolder.id, userId });
        toast.success("Folder created successfully");
        announce("Folder created successfully", "polite");
      }
    } catch (error) {
      logger.error("Failed to create folder", { error, userId });
      toast.error("Failed to create folder");
      announce("Error creating folder", "assertive");
    }
  };

  const handleUploadFile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    try {
      logger.info("Uploading file");

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const newFile: WorkspaceItem = {
        id: Date.now().toString(),
        name: formData.get("fileName") as string,
        type: "file",
        fileType: "document",
        size: "1.5 MB",
        createdBy: "Current User",
        createdAt: new Date().toISOString().split("T")[0],
        modifiedAt: new Date().toISOString().split("T")[0],
        isShared: false,
        isLocked: false,
        isFavorite: false,
        tags: [],
        permissions: "edit",
      };

      setItems([...items, newFile]);
      setIsUploadOpen(false);

      logger.info("File uploaded successfully", { fileId: newFile.id });
      toast.success("File uploaded successfully");
    } catch (error) {
      logger.error("Failed to upload file", { error });
      toast.error("Failed to upload file");
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!userId) return;

    try {
      logger.info("Deleting item", { itemId, userId });

      const item = items.find((i) => i.id === itemId);
      if (!item) return;

      let error;
      if (item.type === "folder") {
        const result = await deleteFolderDB(userId, itemId);
        error = result.error;
      } else {
        const result = await deleteFileDB(userId, itemId);
        error = result.error;
      }

      if (error) {
        throw new Error(error.message || "Failed to delete item");
      }

      setItems(items.filter((item) => item.id !== itemId));

      logger.info("Item deleted successfully", { itemId, userId });
      toast.success("Item deleted");
      announce("Item deleted successfully", "polite");
    } catch (error) {
      logger.error("Failed to delete item", { error, userId });
      toast.error("Failed to delete item");
      announce("Error deleting item", "assertive");
    }
  };

  const handleToggleFavorite = async (itemId: string) => {
    if (!userId) return;

    try {
      logger.info("Toggling favorite", { itemId, userId });

      const item = items.find((i) => i.id === itemId);
      if (!item) return;

      const newFavoriteStatus = !item.isFavorite;

      let error;
      if (item.type === "folder") {
        const result = await updateFolder(userId, itemId, { is_favorite: newFavoriteStatus });
        error = result.error;
      } else {
        const result = await updateFile(userId, itemId, { is_favorite: newFavoriteStatus });
        error = result.error;
      }

      if (error) {
        throw new Error(error.message || "Failed to update favorite");
      }

      setItems(
        items.map((item) =>
          item.id === itemId ? { ...item, isFavorite: newFavoriteStatus } : item
        )
      );

      logger.info("Favorite toggled successfully", { itemId, userId });
      toast.success("Favorite updated");
      announce("Favorite status updated", "polite");
    } catch (error) {
      logger.error("Failed to toggle favorite", { error, userId });
      toast.error("Failed to update favorite");
      announce("Error updating favorite", "assertive");
    }
  };

  const handleToggleLock = async (itemId: string) => {
    try {
      logger.info("Toggling lock", { itemId });

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 300));

      setItems(
        items.map((item) =>
          item.id === itemId ? { ...item, isLocked: !item.isLocked } : item
        )
      );

      logger.info("Lock toggled successfully");
      toast.success("Lock status updated");
    } catch (error) {
      logger.error("Failed to toggle lock", { error });
      toast.error("Failed to update lock");
    }
  };

  const handleShareItem = async (itemId: string) => {
    if (!userId) return;

    try {
      logger.info("Sharing item", { itemId, userId });

      const item = items.find((i) => i.id === itemId);
      if (!item || item.type === "folder") {
        // Only files can be shared via shareFile function
        toast.info("Folder sharing coming soon");
        return;
      }

      const { error } = await shareFile(userId, itemId, userId, "edit");

      if (error) {
        throw new Error(error.message || "Failed to share item");
      }

      setItems(
        items.map((item) =>
          item.id === itemId ? { ...item, isShared: true } : item
        )
      );

      logger.info("Item shared successfully", { itemId, userId });
      toast.success("Item shared successfully");
      announce("Item shared successfully", "polite");
    } catch (error) {
      logger.error("Failed to share item", { error, userId });
      toast.error("Failed to share item");
      announce("Error sharing item", "assertive");
    }
  };

  const handleDownloadItem = async (itemId: string) => {
    try {
      logger.info("Downloading item", { itemId });

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      logger.info("Item downloaded successfully");
      toast.success("Download started");
    } catch (error) {
      logger.error("Failed to download item", { error });
      toast.error("Failed to download item");
    }
  };

  const handleDuplicateItem = async (itemId: string) => {
    try {
      logger.info("Duplicating item", { itemId });

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 800));

      const originalItem = items.find((item) => item.id === itemId);
      if (originalItem) {
        const duplicatedItem: WorkspaceItem = {
          ...originalItem,
          id: Date.now().toString(),
          name: `${originalItem.name} (Copy)`,
          createdAt: new Date().toISOString().split("T")[0],
          modifiedAt: new Date().toISOString().split("T")[0],
        };

        setItems([...items, duplicatedItem]);
        logger.info("Item duplicated successfully");
        toast.success("Item duplicated");
      }
    } catch (error) {
      logger.error("Failed to duplicate item", { error });
      toast.error("Failed to duplicate item");
    }
  };

  const handleRenameItem = async (itemId: string, newName: string) => {
    if (!userId) return;

    try {
      logger.info("Renaming item", { itemId, newName, userId });

      const item = items.find((i) => i.id === itemId);
      if (!item) return;

      let error;
      if (item.type === "folder") {
        const result = await updateFolder(userId, itemId, { name: newName });
        error = result.error;
      } else {
        const result = await updateFile(userId, itemId, { name: newName });
        error = result.error;
      }

      if (error) {
        throw new Error(error.message || "Failed to rename item");
      }

      setItems(
        items.map((item) =>
          item.id === itemId ? { ...item, name: newName } : item
        )
      );

      logger.info("Item renamed successfully", { itemId, userId });
      toast.success("Item renamed");
      announce("Item renamed successfully", "polite");
    } catch (error) {
      logger.error("Failed to rename item", { error, userId });
      toast.error("Failed to rename item");
      announce("Error renaming item", "assertive");
    }
  };

  const handleRefreshData = async () => {
    await fetchWorkspaceData();
  };

  const handleBulkDelete = async () => {
    if (!userId) return;

    try {
      logger.info("Bulk deleting items", { count: selectedItems.length, userId });

      // Delete each item
      const deletePromises = selectedItems.map(async (itemId) => {
        const item = items.find((i) => i.id === itemId);
        if (!item) return;

        if (item.type === "folder") {
          return await deleteFolderDB(userId, itemId);
        } else {
          return await deleteFileDB(userId, itemId);
        }
      });

      const results = await Promise.all(deletePromises);
      const errors = results.filter((r) => r?.error);

      if (errors.length > 0) {
        throw new Error(`Failed to delete ${errors.length} items`);
      }

      setItems(items.filter((item) => !selectedItems.includes(item.id)));
      setSelectedItems([]);

      logger.info("Bulk delete completed", { count: selectedItems.length, userId });
      toast.success("Selected items deleted");
      announce(`${selectedItems.length} items deleted successfully`, "polite");
    } catch (error) {
      logger.error("Failed to bulk delete", { error, userId });
      toast.error("Failed to delete items");
      announce("Error deleting items", "assertive");
    }
  };

  const handleBulkShare = async () => {
    if (!userId) return;

    try {
      logger.info("Bulk sharing items", { count: selectedItems.length, userId });

      // Share only files (folders not supported yet)
      const sharePromises = selectedItems.map(async (itemId) => {
        const item = items.find((i) => i.id === itemId);
        if (!item || item.type === "folder") return;

        return await shareFile(userId, itemId, userId, "edit");
      });

      const results = await Promise.all(sharePromises);
      const errors = results.filter((r) => r?.error);

      if (errors.length > 0) {
        throw new Error(`Failed to share ${errors.length} items`);
      }

      setItems(
        items.map((item) =>
          selectedItems.includes(item.id) && item.type === "file"
            ? { ...item, isShared: true }
            : item
        )
      );
      setSelectedItems([]);

      logger.info("Bulk share completed", { count: selectedItems.length, userId });
      toast.success("Selected items shared");
      announce(`${selectedItems.length} items shared successfully`, "polite");
    } catch (error) {
      logger.error("Failed to bulk share", { error, userId });
      toast.error("Failed to share items");
      announce("Error sharing items", "assertive");
    }
  };

  const filteredItems = items.filter((item) => {
    const matchesSearch = item.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesType =
      filterType === "all" ||
      item.type === filterType ||
      item.fileType === filterType;
    const matchesTab =
      activeTab === "all" ||
      (activeTab === "favorites" && item.isFavorite) ||
      (activeTab === "shared" && item.isShared);

    return matchesSearch && matchesType && matchesTab;
  });

  const getFileIcon = (item: WorkspaceItem) => {
    if (item.type === "folder") return <Folder className="h-8 w-8" />;
    if (item.fileType === "image") return <Image className="h-8 w-8" />;
    if (item.fileType === "video") return <Video className="h-8 w-8" />;
    return <FileText className="h-8 w-8" />;
  };

  return (
    <div className="flex-1 space-y-6 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Workspace</h2>
          <p className="text-muted-foreground">
            Manage your files and collaborate with your team
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefreshData}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Upload className="mr-2 h-4 w-4" />
                Upload
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Upload File</DialogTitle>
                <DialogDescription>
                  Upload a new file to your workspace
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleUploadFile} className="space-y-4">
                <div>
                  <Label htmlFor="fileName">File Name</Label>
                  <Input
                    id="fileName"
                    name="fileName"
                    placeholder="Enter file name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="fileUpload">Choose File</Label>
                  <Input id="fileUpload" name="fileUpload" type="file" />
                </div>
                <Button type="submit" className="w-full">
                  Upload File
                </Button>
              </form>
            </DialogContent>
          </Dialog>
          <Dialog
            open={isCreateFolderOpen}
            onOpenChange={setIsCreateFolderOpen}
          >
            <DialogTrigger asChild>
              <Button>
                <FolderPlus className="mr-2 h-4 w-4" />
                New Folder
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Folder</DialogTitle>
                <DialogDescription>
                  Add a new folder to organize your files
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateFolder} className="space-y-4">
                <div>
                  <Label htmlFor="folderName">Folder Name</Label>
                  <Input
                    id="folderName"
                    name="folderName"
                    placeholder="Enter folder name"
                    required
                  />
                </div>
                <Button type="submit" className="w-full">
                  Create Folder
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
            <File className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <NumberFlow value={stats.totalFiles} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Folders</CardTitle>
            <Folder className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <NumberFlow value={stats.totalFolders} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Shared Items</CardTitle>
            <Share2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <NumberFlow value={stats.sharedItems} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
            <Archive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <NumberFlow value={stats.storageUsed} />%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search workspace..."
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
              <SelectItem value="folder">Folders</SelectItem>
              <SelectItem value="document">Documents</SelectItem>
              <SelectItem value="image">Images</SelectItem>
              <SelectItem value="video">Videos</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          {selectedItems.length > 0 && (
            <>
              <Button variant="outline" size="sm" onClick={handleBulkShare}>
                <Share2 className="mr-2 h-4 w-4" />
                Share ({selectedItems.length})
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleBulkDelete}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete ({selectedItems.length})
              </Button>
            </>
          )}
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
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All Items</TabsTrigger>
          <TabsTrigger value="favorites">Favorites</TabsTrigger>
          <TabsTrigger value="shared">Shared</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {/* Items Grid/List */}
          <div
            className={
              viewMode === "grid"
                ? "grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                : "space-y-2"
            }
          >
            {filteredItems.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="relative group">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                      <div className="text-primary">{getFileIcon(item)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium truncate">
                              {item.name}
                            </h3>
                            <p className="text-xs text-muted-foreground">
                              {item.type === "file" && item.size}
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
                                onClick={() => handleToggleFavorite(item.id)}
                              >
                                <Star className="mr-2 h-4 w-4" />
                                {item.isFavorite
                                  ? "Remove Favorite"
                                  : "Add Favorite"}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleShareItem(item.id)}
                              >
                                <Share2 className="mr-2 h-4 w-4" />
                                Share
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDownloadItem(item.id)}
                              >
                                <Download className="mr-2 h-4 w-4" />
                                Download
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDuplicateItem(item.id)}
                              >
                                <Copy className="mr-2 h-4 w-4" />
                                Duplicate
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleToggleLock(item.id)}
                              >
                                {item.isLocked ? (
                                  <Unlock className="mr-2 h-4 w-4" />
                                ) : (
                                  <Lock className="mr-2 h-4 w-4" />
                                )}
                                {item.isLocked ? "Unlock" : "Lock"}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDeleteItem(item.id)}
                                className="text-red-600"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-1">
                          {item.isFavorite && (
                            <Badge variant="secondary" className="text-xs">
                              <Star className="mr-1 h-3 w-3 fill-current" />
                              Favorite
                            </Badge>
                          )}
                          {item.isShared && (
                            <Badge variant="secondary" className="text-xs">
                              <Share2 className="mr-1 h-3 w-3" />
                              Shared
                            </Badge>
                          )}
                          {item.isLocked && (
                            <Badge variant="secondary" className="text-xs">
                              <Lock className="mr-1 h-3 w-3" />
                              Locked
                            </Badge>
                          )}
                        </div>
                        <div className="mt-2 text-xs text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <User className="h-3 w-3" />
                            {item.createdBy}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <Clock className="h-3 w-3" />
                            Modified {item.modifiedAt}
                          </div>
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
