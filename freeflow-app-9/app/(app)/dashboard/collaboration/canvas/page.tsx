"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Pencil,
  Eraser,
  Square,
  Circle,
  Triangle,
  Type,
  Image,
  Download,
  Upload,
  Save,
  Trash2,
  Undo,
  Redo,
  ZoomIn,
  ZoomOut,
  Move,
  MousePointer,
  Palette,
  Settings,
  Users,
  Share2,
  Copy,
  Grid3x3,
  Maximize,
  Minimize,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Layers,
  Plus,
  Minus,
  RotateCw,
  RotateCcw,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  Italic,
  Underline,
  RefreshCw,
  FileText,
  Sparkles,
  Star,
  Heart,
  CheckCircle,
  XCircle,
  AlertCircle,
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
import { Slider } from "@/components/ui/slider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";

const logger = createFeatureLogger("CollaborationCanvas");

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
  const [projects, setProjects] = useState<CanvasProject[]>([]);
  const [activeProject, setActiveProject] = useState<CanvasProject | null>(
    null
  );
  const [isNewProjectOpen, setIsNewProjectOpen] = useState(false);
  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false);
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
  }, []);

  useEffect(() => {
    if (activeProject && canvasRef.current) {
      initializeCanvas();
    }
  }, [activeProject]);

  const fetchCanvasData = async () => {
    try {
      setLoading(true);
      logger.info("Fetching canvas data");

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const mockProjects: CanvasProject[] = [
        {
          id: "1",
          name: "Product Wireframe",
          createdBy: "John Doe",
          createdAt: "2024-01-20",
          modifiedAt: "2024-01-22",
          collaborators: 3,
          isShared: true,
        },
        {
          id: "2",
          name: "UI Mockup",
          createdBy: "Sarah Johnson",
          createdAt: "2024-01-18",
          modifiedAt: "2024-01-21",
          collaborators: 2,
          isShared: false,
        },
        {
          id: "3",
          name: "Brainstorming Board",
          createdBy: "Mike Chen",
          createdAt: "2024-01-15",
          modifiedAt: "2024-01-20",
          collaborators: 5,
          isShared: true,
        },
      ];

      setProjects(mockProjects);

      setStats({
        totalProjects: mockProjects.length,
        activeCollaborators: mockProjects.reduce(
          (sum, p) => sum + p.collaborators,
          0
        ),
        totalDrawings: 156,
        savedTemplates: 12,
      });

      logger.info("Canvas data fetched successfully");
      toast.success("Canvas loaded");
    } catch (error) {
      logger.error("Failed to fetch canvas data", { error });
      toast.error("Failed to load canvas");
    } finally {
      setLoading(false);
    }
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
    const formData = new FormData(e.currentTarget);

    try {
      logger.info("Creating new canvas project");

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 800));

      const newProject: CanvasProject = {
        id: Date.now().toString(),
        name: formData.get("projectName") as string,
        createdBy: "Current User",
        createdAt: new Date().toISOString().split("T")[0],
        modifiedAt: new Date().toISOString().split("T")[0],
        collaborators: 1,
        isShared: false,
      };

      setProjects([newProject, ...projects]);
      setActiveProject(newProject);
      setIsNewProjectOpen(false);
      setActiveTab("canvas");

      logger.info("Project created successfully", { projectId: newProject.id });
      toast.success("Canvas project created");
    } catch (error) {
      logger.error("Failed to create project", { error });
      toast.error("Failed to create project");
    }
  };

  const handleOpenProject = async (project: CanvasProject) => {
    try {
      logger.info("Opening canvas project", { projectId: project.id });

      setActiveProject(project);
      setActiveTab("canvas");

      logger.info("Project opened successfully");
      toast.success("Canvas opened");
    } catch (error) {
      logger.error("Failed to open project", { error });
      toast.error("Failed to open project");
    }
  };

  const handleSaveCanvas = async () => {
    try {
      logger.info("Saving canvas");

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 800));

      if (activeProject) {
        setProjects(
          projects.map((p) =>
            p.id === activeProject.id
              ? {
                  ...p,
                  modifiedAt: new Date().toISOString().split("T")[0],
                }
              : p
          )
        );
      }

      logger.info("Canvas saved successfully");
      toast.success("Canvas saved");
    } catch (error) {
      logger.error("Failed to save canvas", { error });
      toast.error("Failed to save canvas");
    }
  };

  const handleExportCanvas = async (format: "png" | "pdf" | "svg") => {
    try {
      logger.info("Exporting canvas", { format });

      const canvas = canvasRef.current;
      if (!canvas) return;

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (format === "png") {
        const dataUrl = canvas.toDataURL("image/png");
        const link = document.createElement("a");
        link.download = `${activeProject?.name || "canvas"}.png`;
        link.href = dataUrl;
        link.click();
      }

      logger.info("Canvas exported successfully");
      toast.success(`Exported as ${format.toUpperCase()}`);
    } catch (error) {
      logger.error("Failed to export canvas", { error });
      toast.error("Failed to export canvas");
    }
  };

  const handleClearCanvas = async () => {
    try {
      logger.info("Clearing canvas");

      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      saveToHistory();

      logger.info("Canvas cleared");
      toast.success("Canvas cleared");
    } catch (error) {
      logger.error("Failed to clear canvas", { error });
      toast.error("Failed to clear canvas");
    }
  };

  const handleUndo = async () => {
    try {
      if (historyStep > 0) {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        setHistoryStep(historyStep - 1);
        ctx.putImageData(history[historyStep - 1], 0, 0);

        logger.info("Undo performed");
        toast.success("Undo");
      }
    } catch (error) {
      logger.error("Failed to undo", { error });
      toast.error("Failed to undo");
    }
  };

  const handleRedo = async () => {
    try {
      if (historyStep < history.length - 1) {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        setHistoryStep(historyStep + 1);
        ctx.putImageData(history[historyStep + 1], 0, 0);

        logger.info("Redo performed");
        toast.success("Redo");
      }
    } catch (error) {
      logger.error("Failed to redo", { error });
      toast.error("Failed to redo");
    }
  };

  const handleZoomIn = async () => {
    try {
      logger.info("Zooming in");

      setCanvasState({
        ...canvasState,
        zoom: Math.min(canvasState.zoom + 10, 200),
      });

      logger.info("Zoomed in");
      toast.success("Zoomed in");
    } catch (error) {
      logger.error("Failed to zoom in", { error });
      toast.error("Failed to zoom in");
    }
  };

  const handleZoomOut = async () => {
    try {
      logger.info("Zooming out");

      setCanvasState({
        ...canvasState,
        zoom: Math.max(canvasState.zoom - 10, 50),
      });

      logger.info("Zoomed out");
      toast.success("Zoomed out");
    } catch (error) {
      logger.error("Failed to zoom out", { error });
      toast.error("Failed to zoom out");
    }
  };

  const handleToggleGrid = async () => {
    try {
      logger.info("Toggling grid");

      setCanvasState({
        ...canvasState,
        gridVisible: !canvasState.gridVisible,
      });

      logger.info("Grid toggled");
      toast.success(canvasState.gridVisible ? "Grid hidden" : "Grid visible");
    } catch (error) {
      logger.error("Failed to toggle grid", { error });
      toast.error("Failed to toggle grid");
    }
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
    try {
      logger.info("Sharing canvas");

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      if (activeProject) {
        setProjects(
          projects.map((p) =>
            p.id === activeProject.id ? { ...p, isShared: true } : p
          )
        );
      }

      navigator.clipboard.writeText(
        `https://app.example.com/canvas/${activeProject?.id}`
      );

      logger.info("Canvas shared");
      toast.success("Share link copied to clipboard");
    } catch (error) {
      logger.error("Failed to share canvas", { error });
      toast.error("Failed to share canvas");
    }
  };

  const handleDuplicateCanvas = async () => {
    try {
      logger.info("Duplicating canvas");

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 800));

      if (activeProject) {
        const duplicatedProject: CanvasProject = {
          ...activeProject,
          id: Date.now().toString(),
          name: `${activeProject.name} (Copy)`,
          createdAt: new Date().toISOString().split("T")[0],
          modifiedAt: new Date().toISOString().split("T")[0],
        };

        setProjects([duplicatedProject, ...projects]);
        logger.info("Canvas duplicated");
        toast.success("Canvas duplicated");
      }
    } catch (error) {
      logger.error("Failed to duplicate canvas", { error });
      toast.error("Failed to duplicate canvas");
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    try {
      logger.info("Deleting project", { projectId });

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      setProjects(projects.filter((p) => p.id !== projectId));

      if (activeProject?.id === projectId) {
        setActiveProject(null);
        setActiveTab("projects");
      }

      logger.info("Project deleted");
      toast.success("Project deleted");
    } catch (error) {
      logger.error("Failed to delete project", { error });
      toast.error("Failed to delete project");
    }
  };

  const handleLoadTemplate = async (templateName: string) => {
    try {
      logger.info("Loading template", { templateName });

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 800));

      setIsTemplatesOpen(false);

      logger.info("Template loaded");
      toast.success("Template loaded");
    } catch (error) {
      logger.error("Failed to load template", { error });
      toast.error("Failed to load template");
    }
  };

  const handleInviteCollaborator = async () => {
    try {
      logger.info("Inviting collaborator");

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      if (activeProject) {
        setProjects(
          projects.map((p) =>
            p.id === activeProject.id
              ? { ...p, collaborators: p.collaborators + 1 }
              : p
          )
        );
      }

      logger.info("Collaborator invited");
      toast.success("Invitation sent");
    } catch (error) {
      logger.error("Failed to invite collaborator", { error });
      toast.error("Failed to send invitation");
    }
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
