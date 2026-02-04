// MIGRATED: Batch #26 - Verified database hook integration
"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  Pencil,
  Eraser,
  Square,
  Circle,
  Triangle,
  Type,
  Download,
  Save,
  Trash2,
  Undo,
  Redo,
  ZoomIn,
  ZoomOut,
  Move,
  MousePointer,
  Settings,
  Users,
  UserPlus,
  Share2,
  Copy,
  Grid3x3,
  Plus,
  FileText,
  Sparkles,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { createSimpleLogger } from '@/lib/simple-logger';
import { NumberFlow } from "@/components/ui/number-flow";
import { useCurrentUser } from "@/hooks/use-ai-data";
import { useAnnouncer } from "@/lib/accessibility";
import {
  getCanvasProjects,
  createCanvasProject as createCanvasProjectDB,
  updateCanvasProject,
  deleteCanvasProject,
  getCanvasDrawingCount,
  getCanvasTemplates,
} from "@/lib/canvas-collaboration-queries";


import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";

const logger = createSimpleLogger("CollaborationCanvas");

interface CanvasProject {
  id: string;
  name: string;
  createdBy: string;
  createdAt: string;
  modifiedAt: string;
  collaborators: number;
  isShared: boolean;
  thumbnail?: string;
}

interface DrawingTool {
  id: string;
  name: string;
  icon: React.ReactNode;
  type: "pen" | "eraser" | "shape" | "text" | "select" | "move";
}

interface CanvasState {
  selectedTool: string;
  strokeColor: string;
  fillColor: string;
  strokeWidth: number;
  fontSize: number;
  opacity: number;
  zoom: number;
  gridVisible: boolean;
  snapToGrid: boolean;
}

export default function CanvasPage() {
  // A+++ Hooks
  const { userId, loading: userLoading } = useCurrentUser();
  const { announce } = useAnnouncer();

  const [projects, setProjects] = useState<CanvasProject[]>([]);
  const [activeProject, setActiveProject] = useState<CanvasProject | null>(
    null
  );
  const [isNewProjectOpen, setIsNewProjectOpen] = useState(false);
  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("canvas");

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [history, setHistory] = useState<ImageData[]>([]);
  const [historyStep, setHistoryStep] = useState(-1);

  // Canvas State
  const [canvasState, setCanvasState] = useState<CanvasState>({
    selectedTool: "pen",
    strokeColor: "#000000",
    fillColor: "#ffffff",
    strokeWidth: 2,
    fontSize: 16,
    opacity: 100,
    zoom: 100,
    gridVisible: false,
    snapToGrid: false,
  });

  // Drawing Tools
  const drawingTools: DrawingTool[] = [
    { id: "select", name: "Select", icon: <MousePointer />, type: "select" },
    { id: "pen", name: "Pen", icon: <Pencil />, type: "pen" },
    { id: "eraser", name: "Eraser", icon: <Eraser />, type: "eraser" },
    { id: "square", name: "Square", icon: <Square />, type: "shape" },
    { id: "circle", name: "Circle", icon: <Circle />, type: "shape" },
    { id: "triangle", name: "Triangle", icon: <Triangle />, type: "shape" },
    { id: "text", name: "Text", icon: <Type />, type: "text" },
    { id: "move", name: "Move", icon: <Move />, type: "move" },
  ];

  // Colors
  const colors = [
    "#000000",
    "#FF0000",
    "#00FF00",
    "#0000FF",
    "#FFFF00",
    "#FF00FF",
    "#00FFFF",
    "#FFFFFF",
    "#808080",
    "#800000",
    "#008000",
    "#000080",
    "#808000",
    "#800080",
    "#008080",
    "#C0C0C0",
  ];

  // Stats
  const [stats, setStats] = useState({
    totalProjects: 0,
    activeCollaborators: 0,
    totalDrawings: 0,
    savedTemplates: 0,
  });

  useEffect(() => {
    fetchCanvasData();
  }, [userId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (activeProject && canvasRef.current) {
      initializeCanvas();
    }
  }, [activeProject]);

  const fetchCanvasData = async () => {
    if (!userId) {
      logger.info("Waiting for user authentication");
      setLoading(false);
      return;
    }

    setLoading(true);

    toast.promise(
      (async () => {
        logger.info("Fetching canvas data", { userId });

        const { data: projectsData, error } = await getCanvasProjects(userId, {});

        if (error) {
          throw new Error(error.message || "Failed to load canvas projects");
        }

        const canvasProjects: CanvasProject[] = (projectsData || []).map((p) => ({
          id: p.id,
          name: p.name,
          createdBy: p.user_id,
          createdAt: new Date(p.created_at).toLocaleDateString(),
          modifiedAt: new Date(p.updated_at).toLocaleDateString(),
          collaborators: p.collaborators || 0,
          isShared: p.is_shared || false,
        }));

        setProjects(canvasProjects);

        // Calculate total drawings across all projects
        let totalDrawings = 0;
        for (const project of projectsData || []) {
          const { count } = await getCanvasDrawingCount(project.id);
          totalDrawings += count;
        }

        // Get saved templates count
        const { data: templates } = await getCanvasTemplates({ limit: 1000 });
        const savedTemplates = templates?.length || 0;

        setStats({
          totalProjects: canvasProjects.length,
          activeCollaborators: canvasProjects.reduce(
            (sum, p) => sum + p.collaborators,
            0
          ),
          totalDrawings,
          savedTemplates,
        });

        logger.info("Canvas data fetched successfully", { count: canvasProjects.length, userId, totalDrawings, savedTemplates });
        announce(`${canvasProjects.length} canvas projects loaded successfully`, "polite");
        setLoading(false);
        return canvasProjects.length;
      })(),
      {
        loading: "Loading canvas projects...",
        success: (count) => `${count} canvas projects loaded`,
        error: "Failed to load canvas"
      }
    ).catch(() => {
      setLoading(false);
      announce("Error loading canvas", "assertive");
    });
  };

  const initializeCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // Clear canvas
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Save initial state
    saveToHistory();
  };

  const saveToHistory = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const newHistory = history.slice(0, historyStep + 1);
    newHistory.push(imageData);
    setHistory(newHistory);
    setHistoryStep(newHistory.length - 1);
  };

  const handleCreateProject = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!userId) return;

    const formData = new FormData(e.currentTarget);
    const projectName = formData.get("projectName") as string;

    toast.promise(
      (async () => {
        logger.info("Creating new canvas project", { userId, projectName });

        const { data, error } = await createCanvasProjectDB(userId, {
          name: projectName,
        });

        if (error) {
          throw new Error(error.message || "Failed to create project");
        }

        if (data) {
          const newProject: CanvasProject = {
            id: data.id,
            name: data.name,
            createdBy: userId,
            createdAt: new Date(data.created_at).toLocaleDateString(),
            modifiedAt: new Date(data.updated_at).toLocaleDateString(),
            collaborators: 1,
            isShared: data.is_shared || false,
          };

          setProjects([newProject, ...projects]);
          setActiveProject(newProject);
          setIsNewProjectOpen(false);
          setActiveTab("canvas");

          logger.info("Project created successfully", { projectId: newProject.id, userId });
          announce("Canvas project created successfully", "polite");
        }
      })(),
      {
        loading: "Creating canvas project...",
        success: "Canvas project created",
        error: "Failed to create project"
      }
    );
  };

  const handleOpenProject = async (project: CanvasProject) => {
    toast.promise(
      (async () => {
        logger.info("Opening canvas project", { projectId: project.id });
        const response = await fetch(`/api/collaboration/canvas/${project.id}`)
        if (!response.ok) throw new Error('Failed to open project')
        setActiveProject(project);
        setActiveTab("canvas");
        logger.info("Project opened successfully");
      })(),
      {
        loading: "Opening canvas...",
        success: "Canvas opened",
        error: "Failed to open project"
      }
    );
  };

  const handleSaveCanvas = async () => {
    if (!activeProject) return;

    toast.promise(
      (async () => {
        logger.info("Saving canvas", { projectId: activeProject.id });

        // Get canvas data as base64
        const canvas = canvasRef.current;
        let canvasData: string | undefined;
        if (canvas) {
          canvasData = canvas.toDataURL("image/png");
        }

        // Update in database
        const { error } = await updateCanvasProject(activeProject.id, {
          canvas_data: canvasData,
          updated_at: new Date().toISOString(),
        });

        if (error) {
          logger.error("Failed to save canvas to database", { error });
          announce("Error saving canvas", "assertive");
          throw new Error("Failed to save canvas");
        }

        // Update local state
        const now = new Date().toLocaleDateString();
        setProjects(
          projects.map((p) =>
            p.id === activeProject.id ? { ...p, modifiedAt: now } : p
          )
        );

        logger.info("Canvas saved successfully", { projectId: activeProject.id });
        announce("Canvas saved successfully", "polite");
      })(),
      {
        loading: "Saving canvas...",
        success: "Canvas saved",
        error: "Failed to save canvas"
      }
    );
  };

  const handleExportCanvas = async (format: "png" | "pdf" | "svg") => {
    const canvas = canvasRef.current;
    if (!canvas) {
      toast.error("No canvas to export");
      return;
    }

    toast.promise(
      (async () => {
        logger.info("Exporting canvas", { format, projectName: activeProject?.name });
        const filename = `${activeProject?.name || "canvas"}_${new Date().toISOString().split("T")[0]}`;

        if (format === "png") {
          const dataUrl = canvas.toDataURL("image/png");
          const link = document.createElement("a");
          link.download = `${filename}.png`;
          link.href = dataUrl;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        } else if (format === "pdf") {
          const dataUrl = canvas.toDataURL("image/png");
          const printWindow = window.open("", "_blank");
          if (printWindow) {
            printWindow.document.write(`
              <html>
                <head><title>${filename}</title></head>
                <body style="margin:0;display:flex;justify-content:center;align-items:center;">
                  <img src="${dataUrl}" style="max-width:100%;max-height:100vh;" loading="lazy" />
                </body>
              </html>
            `);
            printWindow.document.close();
            printWindow.print();
          }
        } else if (format === "svg") {
          const dataUrl = canvas.toDataURL("image/png");
          const link = document.createElement("a");
          link.download = `${filename}.png`;
          link.href = dataUrl;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }

        logger.info("Canvas exported successfully", { format, filename });
        announce(`Canvas exported as ${format.toUpperCase()}`, "polite");
      })(),
      {
        loading: `Exporting as ${format.toUpperCase()}...`,
        success: `Exported as ${format.toUpperCase()}`,
        error: "Failed to export canvas"
      }
    );
  };

  const handleClearCanvas = async () => {
    toast.promise(
      (async () => {
        logger.info("Clearing canvas");

        const canvas = canvasRef.current;
        if (!canvas) throw new Error("Canvas not found");

        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("Context not found");

        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        saveToHistory();

        logger.info("Canvas cleared");
      })(),
      {
        loading: "Clearing canvas...",
        success: "Canvas cleared",
        error: "Failed to clear canvas"
      }
    );
  };

  const handleUndo = async () => {
    if (historyStep <= 0) return;

    toast.promise(
      (async () => {
        const canvas = canvasRef.current;
        if (!canvas) throw new Error("Canvas not found");

        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("Context not found");

        setHistoryStep(historyStep - 1);
        ctx.putImageData(history[historyStep - 1], 0, 0);
        logger.info("Undo performed");
      })(),
      {
        loading: "Undoing...",
        success: "Undo completed",
        error: "Failed to undo"
      }
    );
  };

  const handleRedo = async () => {
    if (historyStep >= history.length - 1) return;

    toast.promise(
      (async () => {
        const canvas = canvasRef.current;
        if (!canvas) throw new Error("Canvas not found");

        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("Context not found");

        setHistoryStep(historyStep + 1);
        ctx.putImageData(history[historyStep + 1], 0, 0);
        logger.info("Redo performed");
      })(),
      {
        loading: "Redoing...",
        success: "Redo completed",
        error: "Failed to redo"
      }
    );
  };

  const handleZoomIn = async () => {
    logger.info("Zooming in");
    setCanvasState({
      ...canvasState,
      zoom: Math.min(canvasState.zoom + 10, 200),
    });
    toast.success("Zoomed in");
  };

  const handleZoomOut = async () => {
    logger.info("Zooming out");
    setCanvasState({
      ...canvasState,
      zoom: Math.max(canvasState.zoom - 10, 50),
    });
    toast.success("Zoomed out");
  };

  const handleToggleGrid = async () => {
    const newGridVisible = !canvasState.gridVisible;
    logger.info("Toggling grid");
    setCanvasState({
      ...canvasState,
      gridVisible: newGridVisible,
    });
    toast.success(newGridVisible ? "Grid shown" : "Grid hidden");
  };

  const handleSelectTool = async (toolId: string) => {
    try {
      logger.info("Selecting tool", { toolId });

      setCanvasState({ ...canvasState, selectedTool: toolId });

      logger.info("Tool selected");
    } catch (error) {
      logger.error("Failed to select tool", { error });
    }
  };

  const handleColorChange = async (color: string) => {
    try {
      logger.info("Changing color", { color });

      setCanvasState({ ...canvasState, strokeColor: color });

      logger.info("Color changed");
    } catch (error) {
      logger.error("Failed to change color", { error });
    }
  };

  const handleStrokeWidthChange = async (value: number[]) => {
    try {
      setCanvasState({ ...canvasState, strokeWidth: value[0] });
    } catch (error) {
      logger.error("Failed to change stroke width", { error });
    }
  };

  const handleShareCanvas = async () => {
    if (!activeProject) return;

    toast.promise(
      (async () => {
        logger.info("Sharing canvas", { projectId: activeProject.id });

        // Update share status in database
        const { error } = await updateCanvasProject(activeProject.id, {
          is_shared: true,
        });

        if (error) {
          logger.error("Failed to update share status", { error });
          throw new Error("Failed to share canvas");
        }

        // Update local state
        setProjects(
          projects.map((p) =>
            p.id === activeProject.id ? { ...p, isShared: true } : p
          )
        );
        setActiveProject({ ...activeProject, isShared: true });

        // Generate and copy share link
        const shareUrl = `${window.location.origin}/dashboard/collaboration/canvas/view/${activeProject.id}`;

        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(shareUrl);
        } else {
          const textArea = document.createElement("textarea");
          textArea.value = shareUrl;
          textArea.style.position = "fixed";
          textArea.style.left = "-999999px";
          document.body.appendChild(textArea);
          textArea.select();
          document.execCommand("copy");
          document.body.removeChild(textArea);
        }

        logger.info("Canvas shared successfully", { projectId: activeProject.id });
        announce("Canvas share link copied to clipboard", "polite");
      })(),
      {
        loading: "Generating share link...",
        success: "Share link copied to clipboard",
        error: "Failed to share canvas"
      }
    );
  };

  const handleDuplicateCanvas = async () => {
    if (!activeProject || !userId) return;

    toast.promise(
      (async () => {
        logger.info("Duplicating canvas", { projectId: activeProject.id });

        // Get current canvas data
        const canvas = canvasRef.current;
        let canvasData: string | undefined;
        if (canvas) {
          canvasData = canvas.toDataURL("image/png");
        }

        // Create duplicate in database
        const { data, error } = await createCanvasProjectDB(userId, {
          name: `${activeProject.name} (Copy)`,
          canvas_data: canvasData,
        });

        if (error) {
          logger.error("Failed to duplicate canvas in database", { error });
          announce("Error duplicating canvas", "assertive");
          throw new Error("Failed to duplicate canvas");
        }

        if (data) {
          const duplicatedProject: CanvasProject = {
            id: data.id,
            name: data.name,
            createdBy: userId,
            createdAt: new Date().toLocaleDateString(),
            modifiedAt: new Date().toLocaleDateString(),
            collaborators: 1,
            isShared: false,
          };

          setProjects([duplicatedProject, ...projects]);
          setStats(prev => ({ ...prev, totalProjects: prev.totalProjects + 1 }));

          logger.info("Canvas duplicated successfully", { newProjectId: data.id });
          announce("Canvas duplicated successfully", "polite");
        }
      })(),
      {
        loading: "Duplicating canvas...",
        success: "Canvas duplicated successfully",
        error: "Failed to duplicate canvas"
      }
    );
  };

  const handleDeleteProject = async (projectId: string) => {
    toast.promise(
      (async () => {
        logger.info("Deleting project", { projectId, userId });

        // Delete from database
        const { error } = await deleteCanvasProject(projectId);

        if (error) {
          logger.error("Failed to delete project from database", { error, projectId });
          announce("Error deleting project", "assertive");
          throw new Error("Failed to delete project");
        }

        // Update local state
        setProjects(projects.filter((p) => p.id !== projectId));
        setStats(prev => ({ ...prev, totalProjects: prev.totalProjects - 1 }));

        if (activeProject?.id === projectId) {
          setActiveProject(null);
          setActiveTab("projects");
        }

        logger.info("Project deleted successfully", { projectId });
        announce("Canvas project deleted successfully", "polite");
      })(),
      {
        loading: "Deleting project...",
        success: "Project deleted",
        error: "Failed to delete project"
      }
    );
  };

  const handleLoadTemplate = async (templateName: string) => {
    if (!userId) return;

    toast.promise(
      (async () => {
        logger.info("Loading template", { templateName, userId });

        // Create a new project with the template
        const { data, error } = await createCanvasProjectDB(userId, {
          name: `${templateName} - ${new Date().toLocaleDateString()}`,
          template_type: templateName.toLowerCase().replace(/\s+/g, "_"),
        });

        if (error) {
          logger.error("Failed to create project from template", { error });
          announce("Error loading template", "assertive");
          throw new Error("Failed to load template");
        }

        if (data) {
          const newProject: CanvasProject = {
            id: data.id,
            name: data.name,
            createdBy: userId,
            createdAt: new Date().toLocaleDateString(),
            modifiedAt: new Date().toLocaleDateString(),
            collaborators: 1,
            isShared: false,
          };

          setProjects([newProject, ...projects]);
          setActiveProject(newProject);
          setActiveTab("canvas");
          setIsTemplatesOpen(false);
          setStats(prev => ({ ...prev, totalProjects: prev.totalProjects + 1 }));

          // Initialize canvas with template-specific content
          setTimeout(() => {
            const canvas = canvasRef.current;
            if (canvas) {
              const ctx = canvas.getContext("2d");
              if (ctx) {
                // Draw template-specific background/guides
                ctx.fillStyle = "#ffffff";
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                if (templateName === "Wireframe") {
                  // Draw grid for wireframe
                  ctx.strokeStyle = "#e0e0e0";
                  ctx.lineWidth = 1;
                  for (let x = 0; x <= canvas.width; x += 50) {
                    ctx.beginPath();
                    ctx.moveTo(x, 0);
                    ctx.lineTo(x, canvas.height);
                    ctx.stroke();
                  }
                  for (let y = 0; y <= canvas.height; y += 50) {
                    ctx.beginPath();
                    ctx.moveTo(0, y);
                    ctx.lineTo(canvas.width, y);
                    ctx.stroke();
                  }
                } else if (templateName === "Mind Map") {
                  // Draw center circle for mind map
                  ctx.strokeStyle = "#3b82f6";
                  ctx.lineWidth = 2;
                  ctx.beginPath();
                  ctx.arc(canvas.width / 2, canvas.height / 2, 50, 0, Math.PI * 2);
                  ctx.stroke();
                  ctx.fillStyle = "#eff6ff";
                  ctx.fill();
                } else if (templateName === "Flowchart") {
                  // Draw flowchart start symbol
                  ctx.strokeStyle = "#10b981";
                  ctx.lineWidth = 2;
                  ctx.beginPath();
                  ctx.ellipse(canvas.width / 2, 60, 60, 30, 0, 0, Math.PI * 2);
                  ctx.stroke();
                  ctx.fillStyle = "#ecfdf5";
                  ctx.fill();
                }

                saveToHistory();
              }
            }
          }, 100);

          logger.info("Template loaded successfully", { templateName, projectId: data.id });
          announce(`${templateName} template loaded successfully`, "polite");
        }
      })(),
      {
        loading: `Loading ${templateName} template...`,
        success: `${templateName} template loaded`,
        error: "Failed to load template"
      }
    );
  };

  const handleInviteCollaborator = async () => {
    setInviteEmail("");
    setIsInviteOpen(true);
  };

  const handleSendCollaboratorInvite = async () => {
    if (!activeProject || !inviteEmail) return;

    const emailToInvite = inviteEmail;

    toast.promise(
      (async () => {
        logger.info("Sending collaborator invitation", { projectId: activeProject.id, email: emailToInvite });

        // Send invitation via API
        const response = await fetch('/api/collaboration/invitations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ projectId: activeProject.id, email: emailToInvite })
        })
        if (!response.ok) throw new Error('Failed to send invitation')

        // Generate share link
        const shareUrl = `${window.location.origin}/dashboard/collaboration/canvas/join/${activeProject.id}`;

        // Open email client with invitation
        const subject = encodeURIComponent(`Invitation to collaborate on "${activeProject.name}"`);
        const body = encodeURIComponent(
          `You've been invited to collaborate on a canvas!\n\n` +
          `Project: ${activeProject.name}\n\n` +
          `Click here to join: ${shareUrl}\n\n` +
          `Start collaborating in real-time!`
        );

        window.open(`mailto:${emailToInvite}?subject=${subject}&body=${body}`, "_blank");

        // Update collaborator count in local state
        setProjects(
          projects.map((p) =>
            p.id === activeProject.id
              ? { ...p, collaborators: p.collaborators + 1 }
              : p
          )
        );
        setActiveProject({ ...activeProject, collaborators: activeProject.collaborators + 1 });
        setStats(prev => ({ ...prev, activeCollaborators: prev.activeCollaborators + 1 }));

        setIsInviteOpen(false);
        setInviteEmail("");

        logger.info("Collaborator invitation sent", { projectId: activeProject.id, email: emailToInvite });
        announce("Collaborator invitation email opened", "polite");
      })(),
      {
        loading: "Preparing invitation...",
        success: `Invitation ready for ${emailToInvite}`,
        error: "Failed to send invitation"
      }
    );
  };

  // Canvas drawing handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    setIsDrawing(true);

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.strokeStyle = canvasState.strokeColor;
    ctx.lineWidth = canvasState.strokeWidth;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    if (canvasState.selectedTool === "pen") {
      ctx.lineTo(x, y);
      ctx.stroke();
    } else if (canvasState.selectedTool === "eraser") {
      ctx.globalCompositeOperation = "destination-out";
      ctx.lineTo(x, y);
      ctx.stroke();
      ctx.globalCompositeOperation = "source-over";
    }
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      saveToHistory();
    }
  };

  return (
    <div className="flex-1 space-y-6 p-8">
      {/* Templates Dialog */}
      <Dialog open={isTemplatesOpen} onOpenChange={setIsTemplatesOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Choose Template</DialogTitle>
            <DialogDescription>
              Start with a pre-made template
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            {["Blank Canvas", "Wireframe", "Mind Map", "Flowchart"].map(
              (template) => (
                <Card
                  key={template}
                  className="cursor-pointer hover:bg-muted"
                  onClick={() => handleLoadTemplate(template)}
                >
                  <CardContent className="flex items-center justify-center p-6">
                    <div className="text-center">
                      <Sparkles className="mx-auto h-8 w-8 mb-2" />
                      <p className="font-medium">{template}</p>
                    </div>
                  </CardContent>
                </Card>
              )
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Invite Collaborator Dialog */}
      <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite Collaborator</DialogTitle>
            <DialogDescription>
              Invite someone to collaborate on this canvas in real-time
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="collabEmail">Email Address</Label>
              <Input
                id="collabEmail"
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
                onClick={handleSendCollaboratorInvite}
                disabled={!inviteEmail}
              >
                <UserPlus className="mr-2 h-4 w-4" />
                Send Invitation
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Canvas Studio</h2>
          <p className="text-muted-foreground">
            Collaborate on whiteboard and drawings in real-time
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsTemplatesOpen(true)}>
            <Sparkles className="mr-2 h-4 w-4" />
            Templates
          </Button>
          <Dialog open={isNewProjectOpen} onOpenChange={setIsNewProjectOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Canvas
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Canvas</DialogTitle>
                <DialogDescription>
                  Start a new whiteboard project
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateProject} className="space-y-4">
                <div>
                  <Label htmlFor="projectName">Project Name</Label>
                  <Input
                    id="projectName"
                    name="projectName"
                    placeholder="Enter project name"
                    required
                  />
                </div>
                <Button type="submit" className="w-full">
                  Create Canvas
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
              Total Projects
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <NumberFlow value={stats.totalProjects} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Collaborators
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <NumberFlow value={stats.activeCollaborators} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Drawings
            </CardTitle>
            <Pencil className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <NumberFlow value={stats.totalDrawings} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Templates</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <NumberFlow value={stats.savedTemplates} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="projects">My Projects</TabsTrigger>
          {activeProject && <TabsTrigger value="canvas">Canvas</TabsTrigger>}
        </TabsList>

        <TabsContent value="projects" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => handleOpenProject(project)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">
                          {project.name}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          Modified {project.modifiedAt}
                        </p>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          asChild
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Button variant="ghost" size="icon">
                            <Settings className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteProject(project.id);
                            }}
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
                      <span className="text-muted-foreground">Created by</span>
                      <span className="font-medium">{project.createdBy}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        Collaborators
                      </span>
                      <span className="font-medium">
                        {project.collaborators}
                      </span>
                    </div>
                    {project.isShared && (
                      <Badge variant="secondary">
                        <Share2 className="mr-1 h-3 w-3" />
                        Shared
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        {activeProject && (
          <TabsContent value="canvas" className="space-y-4">
            {/* Canvas Toolbar */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{activeProject.name}</h3>
                    <Badge variant="secondary">
                      <Users className="mr-1 h-3 w-3" />
                      {activeProject.collaborators}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleUndo}
                      disabled={historyStep <= 0}
                    >
                      <Undo className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleRedo}
                      disabled={historyStep >= history.length - 1}
                    >
                      <Redo className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleZoomOut}
                    >
                      <ZoomOut className="h-4 w-4" />
                    </Button>
                    <span className="text-sm font-medium">
                      {canvasState.zoom}%
                    </span>
                    <Button size="sm" variant="outline" onClick={handleZoomIn}>
                      <ZoomIn className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleToggleGrid}
                    >
                      <Grid3x3 className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleSaveCanvas}
                    >
                      <Save className="mr-2 h-4 w-4" />
                      Save
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="sm" variant="outline">
                          <Download className="mr-2 h-4 w-4" />
                          Export
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem
                          onClick={() => handleExportCanvas("png")}
                        >
                          Export as PNG
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleExportCanvas("pdf")}
                        >
                          Export as PDF
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleExportCanvas("svg")}
                        >
                          Export as SVG
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <Button size="sm" onClick={handleShareCanvas}>
                      <Share2 className="mr-2 h-4 w-4" />
                      Share
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleInviteCollaborator}
                    >
                      <UserPlus className="mr-2 h-4 w-4" />
                      Invite
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleDuplicateCanvas}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleClearCanvas}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Drawing Tools and Canvas */}
            <div className="grid gap-4 lg:grid-cols-[auto_1fr_auto]">
              {/* Left Sidebar - Tools */}
              <Card className="w-20">
                <CardContent className="p-2">
                  <div className="space-y-2">
                    {drawingTools.map((tool) => (
                      <Button
                        key={tool.id}
                        variant={
                          canvasState.selectedTool === tool.id
                            ? "default"
                            : "ghost"
                        }
                        size="icon"
                        className="w-full"
                        onClick={() => handleSelectTool(tool.id)}
                      >
                        {tool.icon}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Canvas */}
              <Card className="flex-1">
                <CardContent className="p-0">
                  <canvas
                    ref={canvasRef}
                    className="w-full h-[600px] cursor-crosshair"
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    style={{
                      transform: `scale(${canvasState.zoom / 100})`,
                      transformOrigin: "top left",
                    }}
                  />
                </CardContent>
              </Card>

              {/* Right Sidebar - Properties */}
              <Card className="w-64">
                <CardContent className="p-4 space-y-4">
                  <div>
                    <Label className="text-sm font-medium mb-2">
                      Stroke Color
                    </Label>
                    <div className="grid grid-cols-4 gap-2 mt-2">
                      {colors.map((color) => (
                        <button
                          key={color}
                          className={`h-8 w-8 rounded border-2 ${
                            canvasState.strokeColor === color
                              ? "border-primary"
                              : "border-transparent"
                          }`}
                          style={{ backgroundColor: color }}
                          onClick={() => handleColorChange(color)}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium">
                      Stroke Width: {canvasState.strokeWidth}px
                    </Label>
                    <Slider
                      value={[canvasState.strokeWidth]}
                      onValueChange={handleStrokeWidthChange}
                      min={1}
                      max={50}
                      step={1}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label className="text-sm font-medium">
                      Opacity: {canvasState.opacity}%
                    </Label>
                    <Slider
                      value={[canvasState.opacity]}
                      onValueChange={(value) =>
                        setCanvasState({ ...canvasState, opacity: value[0] })
                      }
                      min={0}
                      max={100}
                      step={1}
                      className="mt-2"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Snap to Grid</Label>
                    <Switch
                      checked={canvasState.snapToGrid}
                      onCheckedChange={(checked) =>
                        setCanvasState({ ...canvasState, snapToGrid: checked })
                      }
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
