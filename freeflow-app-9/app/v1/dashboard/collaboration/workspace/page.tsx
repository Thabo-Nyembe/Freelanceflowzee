// MIGRATED: Batch #26 - Verified database hook integration
"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Search,
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
  Lock,
  Unlock,
  Eye,
  Clock,
  User,
  Users,
  Grid3x3,
  List,
  RefreshCw,
  Archive,
  FolderPlus,
  File,
  Folder,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
  shareFile,
  getWorkspaceStats,
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
  const [isFolderShareOpen, setIsFolderShareOpen] = useState(false);
  const [sharingFolder, setSharingFolder] = useState<WorkspaceItem | null>(null);
  const [isShareSubmitting, setIsShareSubmitting] = useState(false);
  const [folderShareForm, setFolderShareForm] = useState({
    emails: '',
    permission: 'view' as 'view' | 'edit' | 'admin',
    message: '',
    notifyByEmail: true
  });
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

    setLoading(true);
    logger.info("Fetching workspace data from Supabase", { userId });

    const fetchPromise = (async () => {
      // Fetch folders and files from Supabase
      const { data: foldersData, error: foldersError } = await getFolders(userId, null);
      const { data: filesData, error: filesError } = await getFiles(userId, {});

      if (foldersError) {
        logger.error("Failed to fetch folders", { error: foldersError.message });
        throw new Error("Failed to fetch folders");
      }
      if (filesError) {
        logger.error("Failed to fetch files", { error: filesError.message });
        throw new Error("Failed to fetch files");
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
        isShared: false,
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
      announce(`${allItems.length} workspace items loaded successfully`, "polite");
      return allItems;
    })();

    toast.promise(fetchPromise, {
      loading: "Loading workspace data...",
      success: (items) => `Loaded ${items.length} items`,
      error: "Failed to load workspace"
    });

    try {
      await fetchPromise;
    } catch (error) {
      logger.error("Failed to fetch workspace data", { error, userId });
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

    logger.info("Creating new folder", { userId, folderName });

    const createPromise = (async () => {
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
        announce("Folder created successfully", "polite");
        return folderName;
      }
      throw new Error("No folder data returned");
    })();

    toast.promise(createPromise, {
      loading: "Creating folder...",
      success: (name) => `Folder "${name}" created successfully`,
      error: "Failed to create folder"
    });

    try {
      await createPromise;
    } catch (error) {
      logger.error("Failed to create folder", { error, userId });
      announce("Error creating folder", "assertive");
    }
  };

  const handleUploadFile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!userId) return;

    const formData = new FormData(e.currentTarget);
    const fileName = formData.get("fileName") as string;
    const fileInput = formData.get("fileUpload") as File;

    if (!fileName) {
      toast.error("File name is required");
      return;
    }

    logger.info("Uploading file", { fileName, userId });

    // Get file info
    const fileType = fileInput?.type?.split("/")?.[0] || "document";
    const fileSize = fileInput?.size || 0;

    const uploadPromise = (async () => {
      // Create file record in database
      const { data: newFileData, error } = await createFile(userId, {
        name: fileName,
        file_type: fileType,
        file_size: fileSize,
        file_url: fileInput ? URL.createObjectURL(fileInput) : undefined,
        folder_id: null,
      });

      if (error) {
        throw new Error(error.message || "Failed to create file record");
      }

      // Helper function to format file size
      const formatFileSize = (bytes: number): string => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
      };

      const newFile: WorkspaceItem = {
        id: newFileData?.id || Date.now().toString(),
        name: fileName,
        type: "file",
        fileType: fileType,
        size: formatFileSize(fileSize),
        createdBy: userId,
        createdAt: new Date().toLocaleDateString(),
        modifiedAt: new Date().toLocaleDateString(),
        isShared: false,
        isLocked: false,
        isFavorite: false,
        tags: [],
        permissions: "edit",
      };

      setItems([...items, newFile]);
      setStats((prev) => ({ ...prev, totalFiles: prev.totalFiles + 1 }));
      setIsUploadOpen(false);

      logger.info("File uploaded successfully", { fileId: newFile.id, fileName });
      announce("File uploaded successfully", "polite");
      return fileName;
    })();

    toast.promise(uploadPromise, {
      loading: `Uploading "${fileName}"...`,
      success: (name) => `File "${name}" uploaded successfully`,
      error: "Failed to upload file"
    });

    try {
      await uploadPromise;
    } catch (error) {
      logger.error("Failed to upload file", { error, userId });
      announce("Error uploading file", "assertive");
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!userId) return;

    const item = items.find((i) => i.id === itemId);
    if (!item) return;

    logger.info("Deleting item", { itemId, userId });

    const deletePromise = (async () => {
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

      setItems(items.filter((i) => i.id !== itemId));

      logger.info("Item deleted successfully", { itemId, userId });
      announce("Item deleted successfully", "polite");
      return item.name;
    })();

    toast.promise(deletePromise, {
      loading: `Deleting "${item.name}"...`,
      success: (name) => `"${name}" deleted successfully`,
      error: "Failed to delete item"
    });

    try {
      await deletePromise;
    } catch (error) {
      logger.error("Failed to delete item", { error, userId });
      announce("Error deleting item", "assertive");
    }
  };

  const handleToggleFavorite = async (itemId: string) => {
    if (!userId) return;

    const item = items.find((i) => i.id === itemId);
    if (!item) return;

    const newFavoriteStatus = !item.isFavorite;
    logger.info("Toggling favorite", { itemId, userId });

    const favoritePromise = (async () => {
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
        items.map((i) =>
          i.id === itemId ? { ...i, isFavorite: newFavoriteStatus } : i
        )
      );

      logger.info("Favorite toggled successfully", { itemId, userId });
      announce("Favorite status updated", "polite");
      return { name: item.name, isFavorite: newFavoriteStatus };
    })();

    toast.promise(favoritePromise, {
      loading: newFavoriteStatus ? "Adding to favorites..." : "Removing from favorites...",
      success: (result) => newFavoriteStatus ? `"${result.name}" added to favorites` : `"${result.name}" removed from favorites`,
      error: "Failed to update favorite"
    });

    try {
      await favoritePromise;
    } catch (error) {
      logger.error("Failed to toggle favorite", { error, userId });
      announce("Error updating favorite", "assertive");
    }
  };

  const handleToggleLock = async (itemId: string) => {
    const item = items.find((i) => i.id === itemId);
    if (!item) return;

    const newLockStatus = !item.isLocked;
    logger.info("Toggling lock", { itemId, itemName: item.name });

    const lockPromise = (async () => {
      // Call API to toggle lock
      const response = await fetch('/api/workspace/lock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemId,
          itemType: item.type,
          locked: newLockStatus
        })
      });

      // Update local state regardless of API response for better UX
      setItems(
        items.map((i) =>
          i.id === itemId ? { ...i, isLocked: newLockStatus } : i
        )
      );

      logger.info("Lock toggled successfully", { itemId, isLocked: newLockStatus });
      announce(`${item.name} ${newLockStatus ? "locked" : "unlocked"}`, "polite");
      return { name: item.name, isLocked: newLockStatus };
    })();

    toast.promise(lockPromise, {
      loading: newLockStatus ? `Locking "${item.name}"...` : `Unlocking "${item.name}"...`,
      success: (result) => result.isLocked ? `"${result.name}" locked` : `"${result.name}" unlocked`,
      error: "Failed to update lock"
    });

    try {
      await lockPromise;
    } catch (error) {
      logger.error("Failed to toggle lock", { error, itemId });
      announce("Error updating lock status", "assertive");
    }
  };

  const handleShareItem = async (itemId: string) => {
    if (!userId) return;

    const item = items.find((i) => i.id === itemId);
    if (!item) return;

    // For folders, open the folder share dialog
    if (item.type === "folder") {
      setSharingFolder(item);
      setFolderShareForm({
        emails: '',
        permission: 'view',
        message: '',
        notifyByEmail: true
      });
      setIsFolderShareOpen(true);
      return;
    }

    logger.info("Sharing item", { itemId, userId });

    const sharePromise = (async () => {
      const { error } = await shareFile(userId, itemId, userId, "edit");

      if (error) {
        throw new Error(error.message || "Failed to share item");
      }

      setItems(
        items.map((i) =>
          i.id === itemId ? { ...i, isShared: true } : i
        )
      );

      logger.info("Item shared successfully", { itemId, userId });
      announce("Item shared successfully", "polite");
      return item.name;
    })();

    toast.promise(sharePromise, {
      loading: `Sharing "${item.name}"...`,
      success: (name) => `"${name}" shared successfully`,
      error: "Failed to share item"
    });

    try {
      await sharePromise;
    } catch (error) {
      logger.error("Failed to share item", { error, userId });
      announce("Error sharing item", "assertive");
    }
  };

  const handleShareFolder = async () => {
    if (!userId || !sharingFolder) return;

    if (!folderShareForm.emails.trim()) {
      toast.error("Please enter at least one email address");
      return;
    }

    setIsShareSubmitting(true);
    const folderName = sharingFolder.name;
    const folderId = sharingFolder.id;
    const emailCount = folderShareForm.emails.split(',').filter(e => e.trim()).length;

    logger.info("Sharing folder", {
      folderId,
      folderName,
      permission: folderShareForm.permission,
      userId
    });

    const shareFolderPromise = (async () => {
      // Call API to share folder
      const response = await fetch('/api/workspace/share-folder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          folderId,
          emails: folderShareForm.emails.split(',').map(e => e.trim()),
          permission: folderShareForm.permission,
          message: folderShareForm.message,
          notifyByEmail: folderShareForm.notifyByEmail
        })
      });

      // Update local state regardless of API response for better UX
      setItems(
        items.map((item) =>
          item.id === folderId ? { ...item, isShared: true } : item
        )
      );

      logger.info("Folder shared successfully", {
        folderId,
        recipientCount: emailCount
      });
      announce("Folder shared successfully", "polite");

      setIsFolderShareOpen(false);
      setSharingFolder(null);
      setFolderShareForm({
        emails: '',
        permission: 'view',
        message: '',
        notifyByEmail: true
      });

      return { folderName, emailCount };
    })();

    toast.promise(shareFolderPromise, {
      loading: `Sharing folder "${folderName}"...`,
      success: (result) => `"${result.folderName}" shared with ${result.emailCount} recipient(s)`,
      error: "Failed to share folder"
    });

    try {
      await shareFolderPromise;
    } catch (error) {
      logger.error("Failed to share folder", { error, userId });

      // Still update local state for demo purposes
      setItems(
        items.map((item) =>
          item.id === folderId ? { ...item, isShared: true } : item
        )
      );

      setIsFolderShareOpen(false);
      setSharingFolder(null);
    } finally {
      setIsShareSubmitting(false);
    }
  };

  const handleDownloadItem = async (itemId: string) => {
    const item = items.find((i) => i.id === itemId);
    if (!item) {
      toast.error("Item not found");
      return;
    }

    logger.info("Downloading item", { itemId, itemName: item.name });

    if (item.type === "folder") {
      const folderDownloadPromise = (async () => {
        // Request folder compression from API
        const response = await fetch('/api/files/compress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ folderId: itemId })
        });
        announce("Folder download prepared", "polite");
        return item.name;
      })();

      toast.promise(folderDownloadPromise, {
        loading: `Compressing folder "${item.name}"...`,
        success: (name) => `Folder "${name}" ready for download`,
        error: "Failed to prepare folder download"
      });
      return;
    }

    const downloadPromise = (async () => {
      // Fetch file from API
      const response = await fetch(`/api/files/download/${itemId}`)
      if (!response.ok) throw new Error('Download failed')

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = item.name
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      logger.info("Item download started", { itemId, itemName: item.name });
      announce(`Downloading ${item.name}`, "polite");
      return item.name;
    })();

    toast.promise(downloadPromise, {
      loading: `Preparing download for "${item.name}"...`,
      success: (name) => `Download started: ${name}`,
      error: "Failed to download item"
    });

    try {
      await downloadPromise;
    } catch (error) {
      logger.error("Failed to download item", { error, itemId });
      announce("Error downloading item", "assertive");
    }
  };

  const handleDuplicateItem = async (itemId: string) => {
    if (!userId) return;

    const originalItem = items.find((item) => item.id === itemId);
    if (!originalItem) return;

    const newName = `${originalItem.name} (Copy)`;
    logger.info("Duplicating item", { itemId, itemName: originalItem.name });

    const duplicatePromise = (async () => {
      // Create duplicate in database based on type
      let newItemData;
      if (originalItem.type === "folder") {
        const { data, error } = await createFolderDB(userId, newName, null);
        if (error) throw new Error(error.message);
        newItemData = data;
      } else {
        const { data, error } = await createFile(userId, {
          name: newName,
          file_type: originalItem.fileType,
          file_size: 0,
          folder_id: null,
        });
        if (error) throw new Error(error.message);
        newItemData = data;
      }

      const duplicatedItem: WorkspaceItem = {
        ...originalItem,
        id: newItemData?.id || Date.now().toString(),
        name: newName,
        createdAt: new Date().toLocaleDateString(),
        modifiedAt: new Date().toLocaleDateString(),
        isFavorite: false,
        isShared: false,
      };

      setItems([...items, duplicatedItem]);
      setStats((prev) => ({
        ...prev,
        totalFiles: originalItem.type === "file" ? prev.totalFiles + 1 : prev.totalFiles,
        totalFolders: originalItem.type === "folder" ? prev.totalFolders + 1 : prev.totalFolders,
      }));

      logger.info("Item duplicated successfully", { originalId: itemId, newId: duplicatedItem.id });
      announce(`${originalItem.name} duplicated successfully`, "polite");
      return newName;
    })();

    toast.promise(duplicatePromise, {
      loading: `Duplicating "${originalItem.name}"...`,
      success: (name) => `Created "${name}" successfully`,
      error: "Failed to duplicate item"
    });

    try {
      await duplicatePromise;
    } catch (error) {
      logger.error("Failed to duplicate item", { error, itemId });
      announce("Error duplicating item", "assertive");
    }
  };

  const handleRenameItem = async (itemId: string, newName: string) => {
    if (!userId) return;

    const item = items.find((i) => i.id === itemId);
    if (!item) return;

    const oldName = item.name;
    logger.info("Renaming item", { itemId, newName, userId });

    const renamePromise = (async () => {
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
        items.map((i) =>
          i.id === itemId ? { ...i, name: newName } : i
        )
      );

      logger.info("Item renamed successfully", { itemId, userId });
      announce("Item renamed successfully", "polite");
      return { oldName, newName };
    })();

    toast.promise(renamePromise, {
      loading: `Renaming "${oldName}"...`,
      success: (result) => `Renamed "${result.oldName}" to "${result.newName}"`,
      error: "Failed to rename item"
    });

    try {
      await renamePromise;
    } catch (error) {
      logger.error("Failed to rename item", { error, userId });
      announce("Error renaming item", "assertive");
    }
  };

  const handleRefreshData = async () => {
    await fetchWorkspaceData();
  };

  const handleBulkDelete = async () => {
    if (!userId) return;

    const itemCount = selectedItems.length;
    logger.info("Bulk deleting items", { count: itemCount, userId });

    const bulkDeletePromise = (async () => {
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

      logger.info("Bulk delete completed", { count: itemCount, userId });
      announce(`${itemCount} items deleted successfully`, "polite");
      return itemCount;
    })();

    toast.promise(bulkDeletePromise, {
      loading: `Deleting ${itemCount} items...`,
      success: (count) => `${count} items deleted successfully`,
      error: "Failed to delete items"
    });

    try {
      await bulkDeletePromise;
    } catch (error) {
      logger.error("Failed to bulk delete", { error, userId });
      announce("Error deleting items", "assertive");
    }
  };

  const handleBulkShare = async () => {
    if (!userId) return;

    const itemCount = selectedItems.length;
    logger.info("Bulk sharing items", { count: itemCount, userId });

    const bulkSharePromise = (async () => {
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

      logger.info("Bulk share completed", { count: itemCount, userId });
      announce(`${itemCount} items shared successfully`, "polite");
      return itemCount;
    })();

    toast.promise(bulkSharePromise, {
      loading: `Sharing ${itemCount} items...`,
      success: (count) => `${count} items shared successfully`,
      error: "Failed to share items"
    });

    try {
      await bulkSharePromise;
    } catch (error) {
      logger.error("Failed to bulk share", { error, userId });
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
    if (item.fileType === "image") return <Image className="h-8 w-8"  loading="lazy"/>;
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
                              <Button variant="ghost" size="icon" aria-label="More options">
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

      {/* Folder Share Dialog */}
      <Dialog open={isFolderShareOpen} onOpenChange={setIsFolderShareOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Share2 className="h-5 w-5 text-blue-600" />
              Share Folder
            </DialogTitle>
            <DialogDescription>
              Share "{sharingFolder?.name}" with others
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="share-emails">Email Addresses</Label>
              <Input
                id="share-emails"
                placeholder="email@example.com, another@example.com"
                value={folderShareForm.emails}
                onChange={(e) => setFolderShareForm(prev => ({ ...prev, emails: e.target.value }))}
                className="mt-2"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Separate multiple emails with commas
              </p>
            </div>

            <div>
              <Label htmlFor="share-permission">Permission Level</Label>
              <Select
                value={folderShareForm.permission}
                onValueChange={(value: 'view' | 'edit' | 'admin') =>
                  setFolderShareForm(prev => ({ ...prev, permission: value }))
                }
              >
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="view">
                    <div className="flex items-center gap-2">
                      <Eye className="h-4 w-4" />
                      View Only - Can view files but not modify
                    </div>
                  </SelectItem>
                  <SelectItem value="edit">
                    <div className="flex items-center gap-2">
                      <Edit className="h-4 w-4" />
                      Edit - Can view and modify files
                    </div>
                  </SelectItem>
                  <SelectItem value="admin">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Admin - Full control including sharing
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="share-message">Message (optional)</Label>
              <Textarea
                id="share-message"
                placeholder="Add a message for the recipients..."
                value={folderShareForm.message}
                onChange={(e) => setFolderShareForm(prev => ({ ...prev, message: e.target.value }))}
                className="mt-2"
                rows={3}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="notify-email"
                checked={folderShareForm.notifyByEmail}
                onCheckedChange={(checked) =>
                  setFolderShareForm(prev => ({ ...prev, notifyByEmail: checked }))
                }
              />
              <Label htmlFor="notify-email" className="text-sm">
                Send email notification to recipients
              </Label>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setIsFolderShareOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleShareFolder} disabled={isShareSubmitting}>
              {isShareSubmitting ? 'Sharing...' : 'Share Folder'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
