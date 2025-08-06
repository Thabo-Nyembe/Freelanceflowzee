
/**
 * @file multi-modal-content-studio.tsx
 * @description Comprehensive Multi-modal Content Studio component for Phase 3 of the AI Enhancement Program.
 * Provides an intuitive interface for image generation, voice synthesis, cross-modal embeddings,
 * semantic search, multi-format content processing, and real-time collaboration.
 * @version 1.0.0
 */

"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useDropzone } from "react-dropzone";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";
import { useToast } from "@/components/ui/use-toast";
import { useHotkeys } from "react-hotkeys-hook";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { cn } from "@/lib/utils";
import {
  MultiModalAISystem,
  MultiModalOperationType,
  MultiModalProvider,
  MultiModalContentType,
  MultiModalEventType,
  ImageGenerationParams,
  VoiceSynthesisParams,
  CrossModalEmbeddingParams,
  SemanticSearchParams,
  ContentSimilarityParams,
  AutoGenerationParams,
  MultiModalUnderstandingParams,
  AssetLibraryParams,
  RealtimeCollaborationParams,
  AssetMetadata
} from "@/lib/ai/multi-modal-ai-system";
import { IntegratedAISystem } from "@/lib/ai/integrated-ai-system";

// UI Components
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  ResizablePanel,
  ResizablePanelGroup,
  ResizableHandle,
} from "@/components/ui/resizable";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

// Icons
import {
  AlertCircle,
  ArrowRight,
  AtSign,
  BarChart3,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  CircleDashed,
  Clipboard,
  Code,
  Cog,
  Command,
  Copy,
  CreditCard,
  Crop,
  Download,
  Edit,
  Eye,
  EyeOff,
  FileText,
  Filter,
  Fingerprint,
  Folder,
  FolderOpen,
  Grid,
  HelpCircle,
  History,
  Image as ImageIcon,
  Info,
  Layers,
  Link,
  List,
  Loader2,
  Lock,
  LucideProps,
  Maximize,
  Minimize,
  MoreHorizontal,
  MoreVertical,
  Music,
  Palette,
  Play,
  Plus,
  Redo,
  Refresh,
  Save,
  Search,
  Send,
  Settings,
  Share,
  Shuffle,
  Sliders,
  Sparkles,
  Square,
  Star,
  Tag,
  Trash,
  Undo,
  Upload,
  User,
  Users,
  Video,
  Volume2,
  Wand,
  X,
  Zap,
} from "lucide-react";

// Charts
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// Enhanced Navigation Integration
import { EnhancedNavigation } from "@/components/enhanced-navigation";
import { ContextualSidebar } from "@/components/contextual-sidebar";

// Form schemas
const imageGenerationFormSchema = z.object({
  prompt: z.string().min(1, "Prompt is required").max(4000),
  negativePrompt: z.string().optional(),
  width: z.number().int().min(64).max(4096).default(1024),
  height: z.number().int().min(64).max(4096).default(1024),
  numOutputs: z.number().int().min(1).max(10).default(1),
  style: z.string().optional(),
  quality: z.enum(["standard", "hd"]).default("standard"),
  provider: z.enum([
    MultiModalProvider.DALLE,
    MultiModalProvider.MIDJOURNEY,
    MultiModalProvider.STABLE_DIFFUSION,
    MultiModalProvider.AUTO,
  ]).default(MultiModalProvider.DALLE),
});

const voiceSynthesisFormSchema = z.object({
  text: z.string().min(1, "Text is required").max(4000),
  voice: z.string().default("alloy"),
  speed: z.number().min(0.25).max(4.0).default(1.0),
  pitch: z.number().min(-20).max(20).default(0),
  provider: z.enum([
    MultiModalProvider.ELEVENLABS,
    MultiModalProvider.OPENAI_TTS,
    MultiModalProvider.GOOGLE_TTS,
    MultiModalProvider.AMAZON_POLLY,
    MultiModalProvider.AUTO,
  ]).default(MultiModalProvider.ELEVENLABS),
});

const semanticSearchFormSchema = z.object({
  query: z.string().min(1, "Query is required"),
  queryType: z.nativeEnum(MultiModalContentType).default(MultiModalContentType.TEXT),
  collection: z.string().min(1, "Collection is required"),
  limit: z.number().int().min(1).max(100).default(10),
});

const autoGenerationFormSchema = z.object({
  input: z.string().min(1, "Input is required"),
  inputType: z.nativeEnum(MultiModalContentType).default(MultiModalContentType.TEXT),
  outputType: z.nativeEnum(MultiModalContentType).default(MultiModalContentType.IMAGE),
  intermediateResults: z.boolean().default(false),
});

const settingsFormSchema = z.object({
  defaultImageProvider: z.enum([
    MultiModalProvider.DALLE,
    MultiModalProvider.MIDJOURNEY,
    MultiModalProvider.STABLE_DIFFUSION,
    MultiModalProvider.AUTO,
  ]).default(MultiModalProvider.DALLE),
  defaultVoiceProvider: z.enum([
    MultiModalProvider.ELEVENLABS,
    MultiModalProvider.OPENAI_TTS,
    MultiModalProvider.GOOGLE_TTS,
    MultiModalProvider.AMAZON_POLLY,
    MultiModalProvider.AUTO,
  ]).default(MultiModalProvider.ELEVENLABS),
  defaultSearchProvider: z.enum([
    MultiModalProvider.PINECONE,
    MultiModalProvider.WEAVIATE,
    MultiModalProvider.AUTO,
  ]).default(MultiModalProvider.PINECONE),
  enableRealTimeCollaboration: z.boolean().default(true),
  showCostEstimates: z.boolean().default(true),
  autoSaveInterval: z.number().int().min(0).max(60).default(5),
  theme: z.enum(["light", "dark", "system"]).default("system"),
  compactMode: z.boolean().default(false),
  keyboardShortcuts: z.boolean().default(true),
  highQualityPreviews: z.boolean().default(true),
  developerMode: z.boolean().default(false),
});

// Types
type TabType = "image" | "voice" | "embeddings" | "search" | "workflows" | "multimodal" | "assets" | "analytics";

type CollaborationUser = {
  id: string;
  name: string;
  avatar?: string;
  color: string;
  position?: { x: number; y: number };
  lastActive: Date;
  isActive: boolean;
};

type ContentHistoryEntry = {
  id: string;
  timestamp: Date;
  type: MultiModalContentType;
  content: any;
  metadata?: any;
};

type AssetLibraryFilter = {
  contentTypes?: MultiModalContentType[];
  tags?: string[];
  categories?: string[];
  dateRange?: { start: Date; end: Date };
  searchQuery?: string;
};

type WorkspaceState = {
  activeTab: TabType;
  imageGeneration: {
    prompt: string;
    negativePrompt?: string;
    width: number;
    height: number;
    numOutputs: number;
    style?: string;
    quality: "standard" | "hd";
    provider: MultiModalProvider;
    results: Array<{ url: string; id: string }>;
  };
  voiceSynthesis: {
    text: string;
    voice: string;
    speed: number;
    pitch: number;
    provider: MultiModalProvider;
    results: Array<{ url: string; id: string }>;
  };
  embeddings: {
    content: any;
    contentType: MultiModalContentType;
    dimensions: number;
    model: string;
    results: Array<{ vector: number[]; id: string }>;
  };
  search: {
    query: string;
    queryType: MultiModalContentType;
    collection: string;
    results: Array<{ content: any; score: number; id: string }>;
  };
  workflows: {
    input: string;
    inputType: MultiModalContentType;
    outputType: MultiModalContentType;
    results: Array<{ content: any; type: MultiModalContentType; id: string }>;
  };
  multimodal: {
    contents: Array<{ content: any; contentType: MultiModalContentType }>;
    task: string;
    results: any;
  };
  assets: {
    filter: AssetLibraryFilter;
    selectedAssets: string[];
  };
  analytics: {
    timeRange: "day" | "week" | "month" | "year";
    metricType: "cost" | "usage" | "performance";
  };
  collaboration: {
    sessionId: string;
    users: CollaborationUser[];
    messages: Array<{ userId: string; message: string; timestamp: Date }>;
  };
  history: ContentHistoryEntry[];
};

// Default workspace state
const defaultWorkspaceState: WorkspaceState = {
  activeTab: "image",
  imageGeneration: {
    prompt: "",
    width: 1024,
    height: 1024,
    numOutputs: 1,
    quality: "standard",
    provider: MultiModalProvider.DALLE,
    results: [],
  },
  voiceSynthesis: {
    text: "",
    voice: "alloy",
    speed: 1.0,
    pitch: 0,
    provider: MultiModalProvider.ELEVENLABS,
    results: [],
  },
  embeddings: {
    content: "",
    contentType: MultiModalContentType.TEXT,
    dimensions: 1536,
    model: "text-embedding-ada-002",
    results: [],
  },
  search: {
    query: "",
    queryType: MultiModalContentType.TEXT,
    collection: "assets",
    results: [],
  },
  workflows: {
    input: "",
    inputType: MultiModalContentType.TEXT,
    outputType: MultiModalContentType.IMAGE,
    results: [],
  },
  multimodal: {
    contents: [],
    task: "",
    results: null,
  },
  assets: {
    filter: {},
    selectedAssets: [],
  },
  analytics: {
    timeRange: "week",
    metricType: "usage",
  },
  collaboration: {
    sessionId: "",
    users: [],
    messages: [],
  },
  history: [],
};

// Sample voice options
const voiceOptions = [
  { id: "alloy", name: "Alloy", provider: MultiModalProvider.OPENAI_TTS },
  { id: "echo", name: "Echo", provider: MultiModalProvider.OPENAI_TTS },
  { id: "fable", name: "Fable", provider: MultiModalProvider.OPENAI_TTS },
  { id: "onyx", name: "Onyx", provider: MultiModalProvider.OPENAI_TTS },
  { id: "nova", name: "Nova", provider: MultiModalProvider.OPENAI_TTS },
  { id: "shimmer", name: "Shimmer", provider: MultiModalProvider.OPENAI_TTS },
  { id: "rachel", name: "Rachel", provider: MultiModalProvider.ELEVENLABS },
  { id: "drew", name: "Drew", provider: MultiModalProvider.ELEVENLABS },
  { id: "clyde", name: "Clyde", provider: MultiModalProvider.ELEVENLABS },
  { id: "emily", name: "Emily", provider: MultiModalProvider.ELEVENLABS },
  { id: "en-US-Standard-A", name: "US Female", provider: MultiModalProvider.GOOGLE_TTS },
  { id: "en-US-Standard-B", name: "US Male", provider: MultiModalProvider.GOOGLE_TTS },
  { id: "en-GB-Standard-A", name: "UK Female", provider: MultiModalProvider.GOOGLE_TTS },
  { id: "en-GB-Standard-B", name: "UK Male", provider: MultiModalProvider.GOOGLE_TTS },
  { id: "Joanna", name: "Joanna", provider: MultiModalProvider.AMAZON_POLLY },
  { id: "Matthew", name: "Matthew", provider: MultiModalProvider.AMAZON_POLLY },
];

// Sample style presets
const stylePresets = [
  { id: "photorealistic", name: "Photorealistic", description: "Highly detailed photorealistic style" },
  { id: "digital-art", name: "Digital Art", description: "Modern digital art style" },
  { id: "anime", name: "Anime", description: "Japanese anime style" },
  { id: "3d-render", name: "3D Render", description: "3D rendered style" },
  { id: "pixel-art", name: "Pixel Art", description: "Retro pixel art style" },
  { id: "oil-painting", name: "Oil Painting", description: "Classical oil painting style" },
  { id: "watercolor", name: "Watercolor", description: "Soft watercolor style" },
  { id: "sketch", name: "Sketch", description: "Hand-drawn sketch style" },
  { id: "comic", name: "Comic", description: "Comic book style" },
  { id: "fantasy", name: "Fantasy", description: "Fantasy art style" },
];

// Sample workflow templates
const workflowTemplates = [
  { 
    id: "text-to-image", 
    name: "Text to Image", 
    description: "Generate images from text descriptions",
    inputType: MultiModalContentType.TEXT,
    outputType: MultiModalContentType.IMAGE,
  },
  { 
    id: "text-to-speech", 
    name: "Text to Speech", 
    description: "Convert text to spoken audio",
    inputType: MultiModalContentType.TEXT,
    outputType: MultiModalContentType.AUDIO,
  },
  { 
    id: "image-to-text", 
    name: "Image to Text", 
    description: "Generate descriptions from images",
    inputType: MultiModalContentType.IMAGE,
    outputType: MultiModalContentType.TEXT,
  },
  { 
    id: "speech-to-text-to-image", 
    name: "Speech to Image", 
    description: "Generate images from spoken descriptions",
    inputType: MultiModalContentType.AUDIO,
    outputType: MultiModalContentType.IMAGE,
  },
  { 
    id: "text-to-video", 
    name: "Text to Video", 
    description: "Generate videos from text descriptions",
    inputType: MultiModalContentType.TEXT,
    outputType: MultiModalContentType.VIDEO,
  },
  { 
    id: "image-variation", 
    name: "Image Variations", 
    description: "Generate variations of an image",
    inputType: MultiModalContentType.IMAGE,
    outputType: MultiModalContentType.IMAGE,
  },
  { 
    id: "image-style-transfer", 
    name: "Style Transfer", 
    description: "Apply artistic styles to images",
    inputType: MultiModalContentType.IMAGE,
    outputType: MultiModalContentType.IMAGE,
  },
  { 
    id: "multi-image-to-video", 
    name: "Images to Video", 
    description: "Create videos from multiple images",
    inputType: MultiModalContentType.IMAGE,
    outputType: MultiModalContentType.VIDEO,
  },
];

// Sample collections for semantic search
const searchCollections = [
  { id: "assets", name: "Asset Library" },
  { id: "projects", name: "Projects" },
  { id: "documents", name: "Documents" },
  { id: "images", name: "Images" },
  { id: "audio", name: "Audio" },
  { id: "videos", name: "Videos" },
];

/**
 * Multi-modal Content Studio Component
 */
export function MultiModalContentStudio() {
  // Initialize hooks
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  const supabase = useSupabaseClient();
  const user = useUser();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const isTablet = useMediaQuery("(max-width: 1024px)");
  
  // State
  const [workspace, setWorkspace] = useState<WorkspaceState>(defaultWorkspaceState);
  const [loading, setLoading] = useState<boolean>(true);
  const [processingOperation, setProcessingOperation] = useState<boolean>(false);
  const [operationProgress, setOperationProgress] = useState<number>(0);
  const [operationMessage, setOperationMessage] = useState<string>("");
  const [showAssetLibrary, setShowAssetLibrary] = useState<boolean>(!isMobile);
  const [showCollaboration, setShowCollaboration] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [settings, setSettings] = useLocalStorage<z.infer<typeof settingsFormSchema>>(
    "multi-modal-studio-settings",
    {
      defaultImageProvider: MultiModalProvider.DALLE,
      defaultVoiceProvider: MultiModalProvider.ELEVENLABS,
      defaultSearchProvider: MultiModalProvider.PINECONE,
      enableRealTimeCollaboration: true,
      showCostEstimates: true,
      autoSaveInterval: 5,
      theme: "system",
      compactMode: false,
      keyboardShortcuts: true,
      highQualityPreviews: true,
      developerMode: false,
    }
  );
  const [costData, setCostData] = useState<any[]>([]);
  const [usageData, setUsageData] = useState<any[]>([]);
  const [performanceData, setPerformanceData] = useState<any[]>([]);
  const [assets, setAssets] = useState<AssetMetadata[]>([]);
  const [webSocketStatus, setWebSocketStatus] = useState<"connecting" | "connected" | "disconnected" | "error">("disconnected");
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState<boolean>(false);
  const [activeAssetPreview, setActiveAssetPreview] = useState<AssetMetadata | null>(null);
  const [draggedAsset, setDraggedAsset] = useState<AssetMetadata | null>(null);
  const [dropTarget, setDropTarget] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [contentHistory, setContentHistory] = useState<ContentHistoryEntry[]>([]);
  const [undoStack, setUndoStack] = useState<WorkspaceState[]>([]);
  const [redoStack, setRedoStack] = useState<WorkspaceState[]>([]);
  const [activeCollaborationUsers, setActiveCollaborationUsers] = useState<CollaborationUser[]>([]);
  const [collaborationCursors, setCollaborationCursors] = useState<Record<string, { x: number; y: number }>>({});
  const [collaborationMessages, setCollaborationMessages] = useState<Array<{ userId: string; message: string; timestamp: Date }>>([]);
  const [newCollaborationMessage, setNewCollaborationMessage] = useState<string>("");
  const [costEstimate, setCostEstimate] = useState<{ low: number; high: number }>({ low: 0, high: 0 });
  const [quotaUsage, setQuotaUsage] = useState<{ used: number; total: number }>({ used: 0, total: 100 });
  
  // Refs
  const studioRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const websocketRef = useRef<WebSocket | null>(null);
  const multiModalSystemRef = useRef<MultiModalAISystem | null>(null);
  const sessionIdRef = useRef<string>("");
  const lastCursorUpdateRef = useRef<number>(0);
  const autoSaveIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Forms
  const imageGenerationForm = useForm<z.infer<typeof imageGenerationFormSchema>>({
    resolver: zodResolver(imageGenerationFormSchema),
    defaultValues: {
      prompt: "",
      negativePrompt: "",
      width: 1024,
      height: 1024,
      numOutputs: 1,
      quality: "standard",
      provider: settings.defaultImageProvider,
    },
  });
  
  const voiceSynthesisForm = useForm<z.infer<typeof voiceSynthesisFormSchema>>({
    resolver: zodResolver(voiceSynthesisFormSchema),
    defaultValues: {
      text: "",
      voice: "alloy",
      speed: 1.0,
      pitch: 0,
      provider: settings.defaultVoiceProvider,
    },
  });
  
  const semanticSearchForm = useForm<z.infer<typeof semanticSearchFormSchema>>({
    resolver: zodResolver(semanticSearchFormSchema),
    defaultValues: {
      query: "",
      queryType: MultiModalContentType.TEXT,
      collection: "assets",
      limit: 10,
    },
  });
  
  const autoGenerationForm = useForm<z.infer<typeof autoGenerationFormSchema>>({
    resolver: zodResolver(autoGenerationFormSchema),
    defaultValues: {
      input: "",
      inputType: MultiModalContentType.TEXT,
      outputType: MultiModalContentType.IMAGE,
      intermediateResults: false,
    },
  });
  
  const settingsForm = useForm<z.infer<typeof settingsFormSchema>>({
    resolver: zodResolver(settingsFormSchema),
    defaultValues: settings,
  });
  
  // Initialize Multi-modal AI System
  useEffect(() => {
    const initializeSystem = async () => {
      try {
        if (!multiModalSystemRef.current) {
          multiModalSystemRef.current = MultiModalAISystem.getInstance();
          await multiModalSystemRef.current.initialize({
            userOptions: {
              userId: user?.id,
            },
          });
        }
        
        // Generate a session ID if not exists
        if (!sessionIdRef.current) {
          sessionIdRef.current = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        }
        
        // Connect to WebSocket for real-time updates
        if (settings.enableRealTimeCollaboration) {
          connectWebSocket();
        }
        
        // Load assets
        loadAssets();
        
        // Load analytics data
        loadAnalyticsData();
        
        // Set up auto-save if enabled
        if (settings.autoSaveInterval > 0) {
          autoSaveIntervalRef.current = setInterval(() => {
            saveWorkspace();
          }, settings.autoSaveInterval * 60 * 1000);
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Failed to initialize Multi-modal AI System:", error);
        toast({
          title: "Initialization Error",
          description: "Failed to initialize the Multi-modal AI System. Please try refreshing the page.",
          variant: "destructive",
        });
        setLoading(false);
      }
    };
    
    initializeSystem();
    
    // Clean up
    return () => {
      if (websocketRef.current) {
        websocketRef.current.close();
      }
      
      if (autoSaveIntervalRef.current) {
        clearInterval(autoSaveIntervalRef.current);
      }
    };
  }, [user, settings.enableRealTimeCollaboration, settings.autoSaveInterval, toast]);
  
  // Subscribe to Multi-modal events
  useEffect(() => {
    if (!multiModalSystemRef.current) return;
    
    const system = multiModalSystemRef.current;
    
    const unsubscribeProgress = system.subscribe(
      MultiModalEventType.OPERATION_PROGRESS,
      (event) => {
        const progress = event.payload?.progress || 0;
        const message = event.payload?.message || "";
        setOperationProgress(progress);
        setOperationMessage(message);
      }
    );
    
    const unsubscribeCost = system.subscribe(
      MultiModalEventType.COST_TRACKED,
      (event) => {
        // Update cost data
        loadAnalyticsData();
      }
    );
    
    const unsubscribeAsset = system.subscribe(
      MultiModalEventType.ASSET_INDEXED,
      (event) => {
        // Refresh assets
        loadAssets();
      }
    );
    
    return () => {
      unsubscribeProgress();
      unsubscribeCost();
      unsubscribeAsset();
    };
  }, []);
  
  // Set up keyboard shortcuts
  useHotkeys("ctrl+z, cmd+z", () => handleUndo(), { enabled: settings.keyboardShortcuts });
  useHotkeys("ctrl+shift+z, cmd+shift+z", () => handleRedo(), { enabled: settings.keyboardShortcuts });
  useHotkeys("ctrl+s, cmd+s", (e) => { e.preventDefault(); saveWorkspace(); }, { enabled: settings.keyboardShortcuts });
  useHotkeys("ctrl+/, cmd+/", () => setShowKeyboardShortcuts(true), { enabled: settings.keyboardShortcuts });
  useHotkeys("escape", () => {
    if (showKeyboardShortcuts) {
      setShowKeyboardShortcuts(false);
    } else if (isFullscreen) {
      setIsFullscreen(false);
    }
  }, { enabled: settings.keyboardShortcuts });
  
  // Track mouse movements for collaboration
  useEffect(() => {
    if (!settings.enableRealTimeCollaboration || !canvasRef.current) return;
    
    const handleMouseMove = throttledCursorUpdate((e: MouseEvent) => {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      
      // Send cursor position to other users
      sendCollaborationCursorUpdate(x, y);
    }, 50);
    
    canvasRef.current.addEventListener("mousemove", handleMouseMove);
    
    return () => {
      canvasRef.current?.removeEventListener("mousemove", handleMouseMove);
    };
  }, [settings.enableRealTimeCollaboration]);
  
  // Connect to WebSocket
  const connectWebSocket = useCallback(() => {
    if (typeof window === "undefined") return;
    
    try {
      setWebSocketStatus("connecting");
      
      // Close existing connection if any
      if (websocketRef.current) {
        websocketRef.current.close();
      }
      
      // Create WebSocket URL with user ID
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/api/ai/multi-modal/websocket?userId=${user?.id}`;
      
      websocketRef.current = new WebSocket(wsUrl);
      
      // Connection opened
      websocketRef.current.addEventListener("open", () => {
        setWebSocketStatus("connected");
        
        // Join collaboration session
        if (sessionIdRef.current && user?.id) {
          sendCollaborationMessage({
            sessionId: sessionIdRef.current,
            userId: user.id,
            operation: "join",
          });
        }
      });
      
      // Listen for messages
      websocketRef.current.addEventListener("message", (event) => {
        try {
          const message = JSON.parse(event.data);
          handleWebSocketMessage(message);
        } catch (error) {
          console.error("Failed to parse WebSocket message:", error);
        }
      });
      
      // Connection closed
      websocketRef.current.addEventListener("close", () => {
        setWebSocketStatus("disconnected");
        
        // Attempt to reconnect after a delay
        setTimeout(connectWebSocket, 5000);
      });
      
      // Connection error
      websocketRef.current.addEventListener("error", () => {
        setWebSocketStatus("error");
      });
    } catch (error) {
      console.error("Failed to connect WebSocket:", error);
      setWebSocketStatus("error");
    }
  }, [user?.id]);
  
  // Handle WebSocket messages
  const handleWebSocketMessage = useCallback((message: any) => {
    switch (message.type) {
      case "connected":
        // Successfully connected
        break;
        
      case "collaboration_update":
        if (message.payload.sourceUserId !== user?.id) {
          // Update cursor position
          if (message.payload.position) {
            setCollaborationCursors((prev) => ({
              ...prev,
              [message.payload.sourceUserId]: message.payload.position,
            }));
          }
          
          // Update user activity
          setActiveCollaborationUsers((prev) => {
            const existingUserIndex = prev.findIndex(u => u.id === message.payload.sourceUserId);
            if (existingUserIndex >= 0) {
              const updatedUsers = [...prev];
              updatedUsers[existingUserIndex] = {
                ...updatedUsers[existingUserIndex],
                lastActive: new Date(),
                isActive: true,
              };
              return updatedUsers;
            }
            return prev;
          });
        }
        break;
        
      case "collaboration_message":
        if (message.payload.sessionId === sessionIdRef.current) {
          setCollaborationMessages((prev) => [
            ...prev,
            {
              userId: message.payload.userId,
              message: message.payload.message,
              timestamp: new Date(),
            },
          ]);
        }
        break;
        
      case "user_joined":
        if (message.payload.sessionId === sessionIdRef.current) {
          // Add user to active users
          setActiveCollaborationUsers((prev) => {
            if (prev.some(u => u.id === message.payload.userId)) {
              return prev;
            }
            return [
              ...prev,
              {
                id: message.payload.userId,
                name: message.payload.userName || `User ${message.payload.userId.substring(0, 6)}`,
                avatar: message.payload.userAvatar,
                color: getRandomColor(),
                lastActive: new Date(),
                isActive: true,
              },
            ];
          });
          
          // Show notification
          toast({
            title: "User Joined",
            description: `${message.payload.userName || "A new user"} joined the collaboration session.`,
          });
        }
        break;
        
      case "user_left":
        if (message.payload.sessionId === sessionIdRef.current) {
          // Remove user from active users
          setActiveCollaborationUsers((prev) => 
            prev.filter(u => u.id !== message.payload.userId)
          );
          
          // Remove cursor
          setCollaborationCursors((prev) => {
            const newCursors = { ...prev };
            delete newCursors[message.payload.userId];
            return newCursors;
          });
        }
        break;
        
      default:
        // Unknown message type
        break;
    }
  }, [user?.id, toast]);
  
  // Send collaboration cursor update
  const sendCollaborationCursorUpdate = useCallback((x: number, y: number) => {
    if (!settings.enableRealTimeCollaboration || !websocketRef.current || websocketRef.current.readyState !== WebSocket.OPEN) {
      return;
    }
    
    const now = Date.now();
    if (now - lastCursorUpdateRef.current < 50) {
      return; // Throttle updates to 20fps
    }
    lastCursorUpdateRef.current = now;
    
    websocketRef.current.send(JSON.stringify({
      type: "collaboration_update",
      payload: {
        sessionId: sessionIdRef.current,
        userId: user?.id,
        position: { x, y },
        timestamp: now,
      },
    }));
  }, [settings.enableRealTimeCollaboration, user?.id]);
  
  // Send collaboration message
  const sendCollaborationMessage = useCallback((message: any) => {
    if (!websocketRef.current || websocketRef.current.readyState !== WebSocket.OPEN) {
      return;
    }
    
    websocketRef.current.send(JSON.stringify({
      type: "collaboration_update",
      payload: message,
    }));
  }, []);
  
  // Load assets
  const loadAssets = useCallback(async () => {
    if (!multiModalSystemRef.current) return;
    
    try {
      const filter = workspace.assets.filter;
      const assets = multiModalSystemRef.current.searchAssets(filter.searchQuery || "", {
        contentTypes: filter.contentTypes,
        limit: 100,
      });
      
      setAssets(assets);
    } catch (error) {
      console.error("Failed to load assets:", error);
      toast({
        title: "Asset Loading Error",
        description: "Failed to load assets. Please try again.",
        variant: "destructive",
      });
    }
  }, [workspace.assets.filter, toast]);
  
  // Load analytics data
  const loadAnalyticsData = useCallback(async () => {
    if (!multiModalSystemRef.current) return;
    
    try {
      // Get time range
      const now = new Date();
      let startDate = new Date();
      
      switch (workspace.analytics.timeRange) {
        case "day":
          startDate.setDate(now.getDate() - 1);
          break;
        case "week":
          startDate.setDate(now.getDate() - 7);
          break;
        case "month":
          startDate.setMonth(now.getMonth() - 1);
          break;
        case "year":
          startDate.setFullYear(now.getFullYear() - 1);
          break;
      }
      
      // Get metrics
      const metrics = multiModalSystemRef.current.getPerformanceMetrics({
        timeRange: { start: startDate, end: now },
      });
      
      // Process cost data
      const costByDay = metrics.reduce((acc, metric) => {
        const date = new Date(metric.timestamp).toLocaleDateString();
        acc[date] = (acc[date] || 0) + metric.cost;
        return acc;
      }, {} as Record<string, number>);
      
      const costData = Object.entries(costByDay).map(([date, cost]) => ({
        date,
        cost,
      }));
      
      // Process usage data
      const usageByType = metrics.reduce((acc, metric) => {
        acc[metric.operationType] = (acc[metric.operationType] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      const usageData = Object.entries(usageByType).map(([type, count]) => ({
        type,
        count,
      }));
      
      // Process performance data
      const perfByProvider = metrics.reduce((acc, metric) => {
        if (!acc[metric.provider]) {
          acc[metric.provider] = {
            provider: metric.provider,
            count: 0,
            totalLatency: 0,
            avgLatency: 0,
          };
        }
        
        acc[metric.provider].count += 1;
        acc[metric.provider].totalLatency += metric.latency;
        acc[metric.provider].avgLatency = acc[metric.provider].totalLatency / acc[metric.provider].count;
        
        return acc;
      }, {} as Record<string, { provider: string; count: number; totalLatency: number; avgLatency: number }>);
      
      const performanceData = Object.values(perfByProvider);
      
      setCostData(costData);
      setUsageData(usageData);
      setPerformanceData(performanceData);
      
      // Get quota usage
      // This would typically come from a backend API
      setQuotaUsage({
        used: 45,
        total: 100,
      });
    } catch (error) {
      console.error("Failed to load analytics data:", error);
    }
  }, [workspace.analytics.timeRange, toast]);
  
  // Save workspace state
  const saveWorkspace = useCallback(async () => {
    try {
      // Save to localStorage
      localStorage.setItem("multi-modal-workspace", JSON.stringify(workspace));
      
      // Save to Supabase if authenticated
      if (user?.id && supabase) {
        const { error } = await supabase
          .from("user_workspaces")
          .upsert({
            user_id: user.id,
            workspace_id: "multi-modal-studio",
            data: workspace,
            updated_at: new Date().toISOString(),
          });
          
        if (error) {
          throw error;
        }
      }
      
      toast({
        title: "Workspace Saved",
        description: "Your workspace has been saved successfully.",
      });
    } catch (error) {
      console.error("Failed to save workspace:", error);
      toast({
        title: "Save Error",
        description: "Failed to save workspace. Please try again.",
        variant: "destructive",
      });
    }
  }, [workspace, user, supabase, toast]);
  
  // Handle tab change
  const handleTabChange = (tab: TabType) => {
    // Save current state to undo stack
    setUndoStack((prev) => [...prev, workspace]);
    setRedoStack([]);
    
    setWorkspace((prev) => ({
      ...prev,
      activeTab: tab,
    }));
  };
  
  // Handle undo
  const handleUndo = () => {
    if (undoStack.length === 0) return;
    
    const prevState = undoStack[undoStack.length - 1];
    setUndoStack((prev) => prev.slice(0, -1));
    setRedoStack((prev) => [...prev, workspace]);
    setWorkspace(prevState);
  };
  
  // Handle redo
  const handleRedo = () => {
    if (redoStack.length === 0) return;
    
    const nextState = redoStack[redoStack.length - 1];
    setRedoStack((prev) => prev.slice(0, -1));
    setUndoStack((prev) => [...prev, workspace]);
    setWorkspace(nextState);
  };
  
  // Handle image generation
  const handleImageGeneration = async (data: z.infer<typeof imageGenerationFormSchema>) => {
    if (!multiModalSystemRef.current) return;
    
    try {
      setProcessingOperation(true);
      setOperationProgress(0);
      setOperationMessage("Preparing image generation...");
      
      // Update workspace state
      setWorkspace((prev) => ({
        ...prev,
        imageGeneration: {
          ...prev.imageGeneration,
          prompt: data.prompt,
          negativePrompt: data.negativePrompt,
          width: data.width,
          height: data.height,
          numOutputs: data.numOutputs,
          quality: data.quality,
          provider: data.provider,
        },
      }));
      
      // Calculate cost estimate
      const estimatedCost = calculateCostEstimate("image", data);
      setCostEstimate(estimatedCost);
      
      // Generate image
      const result = await multiModalSystemRef.current.generateImage(
        {
          prompt: data.prompt,
          negativePrompt: data.negativePrompt,
          width: data.width,
          height: data.height,
          numOutputs: data.numOutputs,
          quality: data.quality,
        },
        {
          provider: data.provider,
          userId: user?.id,
        }
      );
      
      // Process result
      const images = Array.isArray(result.result) 
        ? result.result.map((img: any) => ({ url: img.url, id: img.id || `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` }))
        : [{ url: result.result.url, id: result.result.id || `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` }];
      
      // Update workspace with results
      setWorkspace((prev) => ({
        ...prev,
        imageGeneration: {
          ...prev.imageGeneration,
          results: [...images, ...prev.imageGeneration.results],
        },
        history: [
          {
            id: `hist_${Date.now()}`,
            timestamp: new Date(),
            type: MultiModalContentType.IMAGE,
            content: images,
            metadata: {
              prompt: data.prompt,
              provider: data.provider,
            },
          },
          ...prev.history,
        ],
      }));
      
      // Add to asset library if enabled
      if (images.length > 0) {
        for (const image of images) {
          await multiModalSystemRef.current.addOrUpdateAsset({
            id: image.id,
            name: `Generated Image: ${data.prompt.substring(0, 30)}...`,
            type: MultiModalContentType.IMAGE,
            size: 0, // Size would be calculated from the actual image
            creator: user?.id || "anonymous",
            tags: ["generated", "ai", data.provider],
            categories: ["images"],
            description: data.prompt,
            thumbnailUrl: image.url,
            sourceUrl: image.url,
          });
        }
      }
      
      toast({
        title: "Image Generated",
        description: `Successfully generated ${images.length} image(s).`,
      });
    } catch (error) {
      console.error("Image generation failed:", error);
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Failed to generate image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setProcessingOperation(false);
      setOperationProgress(100);
      setOperationMessage("Image generation complete");
      
      // Clear progress after a delay
      setTimeout(() => {
        setOperationProgress(0);
        setOperationMessage("");
      }, 3000);
    }
  };
  
  // Handle voice synthesis
  const handleVoiceSynthesis = async (data: z.infer<typeof voiceSynthesisFormSchema>) => {
    if (!multiModalSystemRef.current) return;
    
    try {
      setProcessingOperation(true);
      setOperationProgress(0);
      setOperationMessage("Preparing voice synthesis...");
      
      // Update workspace state
      setWorkspace((prev) => ({
        ...prev,
        voiceSynthesis: {
          ...prev.voiceSynthesis,
          text: data.text,
          voice: data.voice,
          speed: data.speed,
          pitch: data.pitch,
          provider: data.provider,
        },
      }));
      
      // Calculate cost estimate
      const estimatedCost = calculateCostEstimate("voice", data);
      setCostEstimate(estimatedCost);
      
      // Synthesize voice
      const result = await multiModalSystemRef.current.textToSpeech(
        {
          text: data.text,
          voice: data.voice,
          speed: data.speed,
          pitch: data.pitch,
        },
        {
          provider: data.provider,
          userId: user?.id,
        }
      );
      
      // Process result
      const audioUrl = result.result.audioUrl || result.result.url;
      const audioId = result.result.id || `audio_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Update workspace with results
      setWorkspace((prev) => ({
        ...prev,
        voiceSynthesis: {
          ...prev.voiceSynthesis,
          results: [{ url: audioUrl, id: audioId }, ...prev.voiceSynthesis.results],
        },
        history: [
          {
            id: `hist_${Date.now()}`,
            timestamp: new Date(),
            type: MultiModalContentType.AUDIO,
            content: { url: audioUrl, id: audioId },
            metadata: {
              text: data.text,
              voice: data.voice,
              provider: data.provider,
            },
          },
          ...prev.history,
        ],
      }));
      
      // Add to asset library
      await multiModalSystemRef.current.addOrUpdateAsset({
        id: audioId,
        name: `Synthesized Voice: ${data.text.substring(0, 30)}...`,
        type: MultiModalContentType.AUDIO,
        size: 0, // Size would be calculated from the actual audio
        creator: user?.id || "anonymous",
        tags: ["synthesized", "voice", data.voice],
        categories: ["audio"],
        description: data.text,
        sourceUrl: audioUrl,
      });
      
      toast({
        title: "Voice Synthesized",
        description: "Successfully synthesized voice audio.",
      });
    } catch (error) {
      console.error("Voice synthesis failed:", error);
      toast({
        title: "Synthesis Failed",
        description: error instanceof Error ? error.message : "Failed to synthesize voice. Please try again.",
        variant: "destructive",
      });
    } finally {
      setProcessingOperation(false);
      setOperationProgress(100);
      setOperationMessage("Voice synthesis complete");
      
      // Clear progress after a delay
      setTimeout(() => {
        setOperationProgress(0);
        setOperationMessage("");
      }, 3000);
    }
  };
  
  // Handle semantic search
  const handleSemanticSearch = async (data: z.infer<typeof semanticSearchFormSchema>) => {
    if (!multiModalSystemRef.current) return;
    
    try {
      setProcessingOperation(true);
      setOperationProgress(0);
      setOperationMessage("Preparing semantic search...");
      
      // Update workspace state
      setWorkspace((prev) => ({
        ...prev,
        search: {
          ...prev.search,
          query: data.query,
          queryType: data.queryType,
          collection: data.collection,
        },
      }));
      
      // Perform semantic search
      const result = await multiModalSystemRef.current.semanticSearch(
        {
          query: data.query,
          queryType: data.queryType,
          collection: data.collection,
          limit: data.limit,
        },
        {
          provider: settings.defaultSearchProvider,
          userId: user?.id,
        }
      );
      
      // Process results
      const searchResults = result.result.map((item: any) => ({
        content: item.content,
        score: item.score,
        id: item.id || `result_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      }));
      
      // Update workspace with results
      setWorkspace((prev) => ({
        ...prev,
        search: {
          ...prev.search,
          results: searchResults,
        },
        history: [
          {
            id: `hist_${Date.now()}`,
            timestamp: new Date(),
            type: MultiModalContentType.TEXT,
            content: { query: data.query, results: searchResults },
            metadata: {
              collection: data.collection,
              queryType: data.queryType,
            },
          },
          ...prev.history,
        ],
      }));
      
      toast({
        title: "Search Complete",
        description: `Found ${searchResults.length} results for your query.`,
      });
    } catch (error) {
      console.error("Semantic search failed:", error);
      toast({
        title: "Search Failed",
        description: error instanceof Error ? error.message : "Failed to perform semantic search. Please try again.",
        variant: "destructive",
      });
    } finally {
      setProcessingOperation(false);
      setOperationProgress(100);
      setOperationMessage("Semantic search complete");
      
      // Clear progress after a delay
      setTimeout(() => {
        setOperationProgress(0);
        setOperationMessage("");
      }, 3000);
    }
  };
  
  // Handle auto-generation workflow
  const handleAutoGeneration = async (data: z.infer<typeof autoGenerationFormSchema>) => {
    if (!multiModalSystemRef.current) return;
    
    try {
      setProcessingOperation(true);
      setOperationProgress(0);
      setOperationMessage("Preparing workflow execution...");
      
      // Update workspace state
      setWorkspace((prev) => ({
        ...prev,
        workflows: {
          ...prev.workflows,
          input: data.input,
          inputType: data.inputType,
          outputType: data.outputType,
        },
      }));
      
      // Calculate cost estimate
      const estimatedCost = calculateCostEstimate("workflow", data);
      setCostEstimate(estimatedCost);
      
      // Execute workflow
      const result = await multiModalSystemRef.current.executeWorkflow(
        {
          input: data.input,
          inputType: data.inputType,
          outputType: data.outputType,
          intermediateResults: data.intermediateResults,
        },
        {
          userId: user?.id,
        }
      );
      
      // Process result
      const workflowResult = {
        content: result.result,
        type: result.resultType,
        id: `workflow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      };
      
      // Update workspace with results
      setWorkspace((prev) => ({
        ...prev,
        workflows: {
          ...prev.workflows,
          results: [workflowResult, ...prev.workflows.results],
        },
        history: [
          {
            id: `hist_${Date.now()}`,
            timestamp: new Date(),
            type: result.resultType,
            content: result.result,
            metadata: {
              input: data.input,
              inputType: data.inputType,
              outputType: data.outputType,
            },
          },
          ...prev.history,
        ],
      }));
      
      // Add to asset library if it's a media type
      if ([
        MultiModalContentType.IMAGE,
        MultiModalContentType.AUDIO,
        MultiModalContentType.VIDEO,
      ].includes(result.resultType)) {
        await multiModalSystemRef.current.addOrUpdateAsset({
          id: workflowResult.id,
          name: `Workflow Result: ${data.input.substring(0, 30)}...`,
          type: result.resultType,
          size: 0,
          creator: user?.id || "anonymous",
          tags: ["workflow", data.inputType, data.outputType],
          categories: ["generated"],
          description: `Generated from ${data.inputType} to ${data.outputType}`,
          sourceUrl: typeof result.result === "string" ? result.result : "",
        });
      }
      
      toast({
        title: "Workflow Complete",
        description: `Successfully processed ${data.inputType} to ${data.outputType}.`,
      });
    } catch (error) {
      console.error("Workflow execution failed:", error);
      toast({
        title: "Workflow Failed",
        description: error instanceof Error ? error.message : "Failed to execute workflow. Please try again.",
        variant: "destructive",
      });
    } finally {
      setProcessingOperation(false);
      setOperationProgress(100);
      setOperationMessage("Workflow execution complete");
      
      // Clear progress after a delay
      setTimeout(() => {
        setOperationProgress(0);
        setOperationMessage("");
      }, 3000);
    }
  };
  
  // Handle settings update
  const handleSettingsUpdate = (data: z.infer<typeof settingsFormSchema>) => {
    setSettings(data);
    
    // Apply theme
    if (typeof window !== "undefined") {
      const root = window.document.documentElement;
      
      if (data.theme === "system") {
        const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light";
        root.classList.remove("light", "dark");
        root.classList.add(systemTheme);
      } else {
        root.classList.remove("light", "dark");
        root.classList.add(data.theme);
      }
    }
    
    // Update WebSocket connection if needed
    if (data.enableRealTimeCollaboration !== settings.enableRealTimeCollaboration) {
      if (data.enableRealTimeCollaboration) {
        connectWebSocket();
      } else if (websocketRef.current) {
        websocketRef.current.close();
        setWebSocketStatus("disconnected");
      }
    }
    
    // Update auto-save interval if needed
    if (data.autoSaveInterval !== settings.autoSaveInterval) {
      if (autoSaveIntervalRef.current) {
        clearInterval(autoSaveIntervalRef.current);
      }
      
      if (data.autoSaveInterval > 0) {
        autoSaveIntervalRef.current = setInterval(() => {
          saveWorkspace();
        }, data.autoSaveInterval * 60 * 1000);
      }
    }
    
    toast({
      title: "Settings Updated",
      description: "Your settings have been updated successfully.",
    });
    
    setShowSettings(false);
  };
  
  // Handle asset selection
  const handleAssetSelect = (asset: AssetMetadata) => {
    setWorkspace((prev) => {
      const selectedAssets = prev.assets.selectedAssets.includes(asset.id)
        ? prev.assets.selectedAssets.filter(id => id !== asset.id)
        : [...prev.assets.selectedAssets, asset.id];
      
      return {
        ...prev,
        assets: {
          ...prev.assets,
          selectedAssets,
        },
      };
    });
  };
  
  // Handle asset preview
  const handleAssetPreview = (asset: AssetMetadata) => {
    setActiveAssetPreview(asset);
  };
  
  // Handle asset drag start
  const handleAssetDragStart = (asset: AssetMetadata) => {
    setDraggedAsset(asset);
  };
  
  // Handle asset drag end
  const handleAssetDragEnd = () => {
    setDraggedAsset(null);
    setDropTarget(null);
  };
  
  // Handle drop target change
  const handleDropTargetChange = (target: string | null) => {
    setDropTarget(target);
  };
  
  // Handle asset drop
  const handleAssetDrop = (target: string) => {
    if (!draggedAsset) return;
    
    // Handle drop based on target
    switch (target) {
      case "image-generation":
        // Set image as reference or variation source
        break;
        
      case "voice-synthesis":
        // Use audio as voice reference
        break;
        
      case "workflows":
        // Use asset as workflow input
        if (draggedAsset.type === MultiModalContentType.IMAGE) {
          autoGenerationForm.setValue("input", draggedAsset.sourceUrl || "");
          autoGenerationForm.setValue("inputType", MultiModalContentType.IMAGE);
        } else if (draggedAsset.type === MultiModalContentType.AUDIO) {
          autoGenerationForm.setValue("input", draggedAsset.sourceUrl || "");
          autoGenerationForm.setValue("inputType", MultiModalContentType.AUDIO);
        } else if (draggedAsset.type === MultiModalContentType.TEXT) {
          autoGenerationForm.setValue("input", draggedAsset.sourceUrl || "");
          autoGenerationForm.setValue("inputType", MultiModalContentType.TEXT);
        }
        break;
        
      case "multimodal":
        // Add asset to multimodal content
        setWorkspace((prev) => ({
          ...prev,
          multimodal: {
            ...prev.multimodal,
            contents: [
              ...prev.multimodal.contents,
              {
                content: draggedAsset.sourceUrl || "",
                contentType: draggedAsset.type,
              },
            ],
          },
        }));
        break;
        
      default:
        break;
    }
    
    setDraggedAsset(null);
    setDropTarget(null);
  };
  
  // Handle collaboration message send
  const handleSendCollaborationMessage = () => {
    if (!newCollaborationMessage.trim() || !user?.id) return;
    
    // Add message locally
    setCollaborationMessages((prev) => [
      ...prev,
      {
        userId: user.id!,
        message: newCollaborationMessage,
        timestamp: new Date(),
      },
    ]);
    
    // Send via WebSocket
    if (websocketRef.current && websocketRef.current.readyState === WebSocket.OPEN) {
      websocketRef.current.send(JSON.stringify({
        type: "collaboration_message",
        payload: {
          sessionId: sessionIdRef.current,
          userId: user.id,
          message: newCollaborationMessage,
          timestamp: new Date().toISOString(),
        },
      }));
    }
    
    setNewCollaborationMessage("");
  };
  
  // Calculate cost estimate
  const calculateCostEstimate = (operationType: string, data: any) => {
    let lowEstimate = 0;
    let highEstimate = 0;
    
    switch (operationType) {
      case "image":
        // Base cost per image
        const baseCost = data.quality === "hd" ? 0.08 : 0.04;
        
        // Adjust based on size
        const sizeMultiplier = (data.width * data.height) / (1024 * 1024);
        
        // Calculate total
        lowEstimate = baseCost * data.numOutputs * sizeMultiplier;
        highEstimate = lowEstimate * 1.2; // 20% buffer
        break;
        
      case "voice":
        // Base cost per character
        const charCost = data.provider === MultiModalProvider.ELEVENLABS ? 0.00003 : 0.000015;
        
        // Calculate total
        const charCount = data.text.length;
        lowEstimate = charCost * charCount;
        highEstimate = lowEstimate * 1.3; // 30% buffer
        break;
        
      case "workflow":
        // Base cost depends on workflow type
        if (data.outputType === MultiModalContentType.IMAGE) {
          lowEstimate = 0.05;
          highEstimate = 0.10;
        } else if (data.outputType === MultiModalContentType.AUDIO) {
          lowEstimate = 0.03;
          highEstimate = 0.06;
        } else if (data.outputType === MultiModalContentType.VIDEO) {
          lowEstimate = 0.15;
          highEstimate = 0.30;
        } else {
          lowEstimate = 0.02;
          highEstimate = 0.04;
        }
        break;
        
      default:
        lowEstimate = 0.01;
        highEstimate = 0.05;
        break;
    }
    
    return { low: lowEstimate, high: highEstimate };
  };
  
  // Throttle function for cursor updates
  const throttledCursorUpdate = (callback: Function, delay: number) => {
    let lastCall = 0;
    return (...args: any[]) => {
      const now = Date.now();
      if (now - lastCall < delay) return;
      lastCall = now;
      return callback(...args);
    };
  };
  
  // Generate random color for collaboration users
  const getRandomColor = () => {
    const colors = [
      "#FF5733", "#33FF57", "#3357FF", "#FF33A8", "#33FFF5",
      "#FFD133", "#8C33FF", "#FF8C33", "#33FFBD", "#FF3333",
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };
  
  // Render content preview based on type
  const renderContentPreview = (content: any, type: MultiModalContentType) => {
    switch (type) {
      case MultiModalContentType.IMAGE:
        return (
          <div className="relative w-full h-48 bg-muted rounded-md overflow-hidden">
            <Image
              src={typeof content === "string" ? content : content.url || ""}
              alt="Image preview"
              fill
              className="object-contain"
              unoptimized={!settings.highQualityPreviews}
            />
          </div>
        );
        
      case MultiModalContentType.AUDIO:
        return (
          <div className="w-full p-4 bg-muted rounded-md">
            <audio
              controls
              className="w-full"
              src={typeof content === "string" ? content : content.url || ""}
            />
          </div>
        );
        
      case MultiModalContentType.VIDEO:
        return (
          <div className="w-full bg-muted rounded-md overflow-hidden">
            <video
              controls
              className="w-full h-48 object-contain"
              src={typeof content === "string" ? content : content.url || ""}
            />
          </div>
        );
        
      case MultiModalContentType.TEXT:
        return (
          <div className="w-full p-4 bg-muted rounded-md max-h-48 overflow-y-auto">
            <p className="text-sm">
              {typeof content === "string" ? content : JSON.stringify(content)}
            </p>
          </div>
        );
        
      default:
        return (
          <div className="w-full p-4 bg-muted rounded-md">
            <p className="text-sm text-muted-foreground">Preview not available</p>
          </div>
        );
    }
  };
  
  // Render asset item
  const renderAssetItem = (asset: AssetMetadata) => {
    return (
      <div
        key={asset.id}
        className={cn(
          "group relative border rounded-md overflow-hidden cursor-pointer transition-all",
          "hover:border-primary hover:shadow-md",
          workspace.assets.selectedAssets.includes(asset.id) && "ring-2 ring-primary",
          dropTarget === "asset" && "border-dashed border-primary"
        )}
        onClick={() => handleAssetSelect(asset)}
        onDoubleClick={() => handleAssetPreview(asset)}
        draggable
        onDragStart={() => handleAssetDragStart(asset)}
        onDragEnd={handleAssetDragEnd}
      >
        <div className="aspect-square w-full bg-muted relative">
          {asset.type === MultiModalContentType.IMAGE ? (
            <Image
              src={asset.thumbnailUrl || asset.sourceUrl || ""}
              alt={asset.name}
              fill
              className="object-cover"
              unoptimized={!settings.highQualityPreviews}
            />
          ) : asset.type === MultiModalContentType.AUDIO ? (
            <div className="flex items-center justify-center h-full">
              <Music className="w-10 h-10 text-muted-foreground" />
            </div>
          ) : asset.type === MultiModalContentType.VIDEO ? (
            <div className="flex items-center justify-center h-full">
              <Video className="w-10 h-10 text-muted-foreground" />
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <FileText className="w-10 h-10 text-muted-foreground" />
            </div>
          )}
          
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-white"
              onClick={(e) => {
                e.stopPropagation();
                handleAssetPreview(asset);
              }}
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-white"
              onClick={(e) => {
                e.stopPropagation();
                // Handle edit
              }}
            >
              <Edit className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="p-2">
          <p className="text-sm font-medium truncate">{asset.name}</p>
          <p className="text-xs text-muted-foreground">
            {new Date(asset.createdAt).toLocaleDateString()}
          </p>
          
          <div className="flex flex-wrap gap-1 mt-1">
            {asset.tags.slice(0, 2).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {asset.tags.length > 2 && (
              <Badge variant="outline" className="text-xs">
                +{asset.tags.length - 2}
              </Badge>
            )}
          </div>
        </div>
      </div>
    );
  };
  
  // Render collaboration cursors
  const renderCollaborationCursors = () => {
    if (!settings.enableRealTimeCollaboration) return null;
    
    return (
      <>
        {activeCollaborationUsers.map((user) => {
          const cursor = collaborationCursors[user.id];
          if (!cursor) return null;
          
          const canvasRect = canvasRef.current?.getBoundingClientRect();
          if (!canvasRect) return null;
          
          const x = cursor.x * canvasRect.width;
          const y = cursor.y * canvasRect.height;
          
          return (
            <div
              key={user.id}
              className="absolute pointer-events-none z-50"
              style={{
                left: `${x}px`,
                top: `${y}px`,
                transform: "translate(-50%, -50%)",
              }}
            >
              <div
                className="w-4 h-4 rounded-full animate-pulse"
                style={{ backgroundColor: user.color }}
              />
              <div
                className="absolute top-5 left-2 px-2 py-1 rounded text-xs text-white whitespace-nowrap"
                style={{ backgroundColor: user.color }}
              >
                {user.name}
              </div>
            </div>
          );
        })}
      </>
    );
  };
  
  // Main component render
  return (
    <div
      ref={studioRef}
      className={cn(
        "flex flex-col w-full h-full min-h-screen bg-background",
        settings.compactMode && "text-sm",
        isFullscreen && "fixed inset-0 z-50"
      )}
    >
      {/* Enhanced Navigation Integration */}
      <EnhancedNavigation
        title="Multi-modal Content Studio"
        breadcrumbs={[
          { title: "Dashboard", href: "/dashboard" },
          { title: "AI Tools", href: "/dashboard/ai" },
          { title: "Multi-modal Studio", href: "/dashboard/ai/multi-modal" },
        ]}
        actions={[
          {
            label: "Save Workspace",
            icon: Save,
            onClick: saveWorkspace,
            shortcut: "⌘S",
          },
          {
            label: "Settings",
            icon: Settings,
            onClick: () => setShowSettings(true),
            shortcut: "⌘,",
          },
          {
            label: settings.enableRealTimeCollaboration ? "Collaboration" : "Enable Collaboration",
            icon: Users,
            onClick: () => {
              if (settings.enableRealTimeCollaboration) {
                setShowCollaboration(!showCollaboration);
              } else {
                setSettings({ ...settings, enableRealTimeCollaboration: true });
                connectWebSocket();
                setShowCollaboration(true);
              }
            },
            shortcut: "⌘K C",
            status: webSocketStatus === "connected" ? "success" : webSocketStatus === "connecting" ? "warning" : "error",
          },
        ]}
      />
      
      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Asset Library Sidebar */}
        {showAssetLibrary && !isMobile && (
          <ResizablePanel
            defaultSize={20}
            minSize={15}
            maxSize={30}
            className="border-r"
          >
            <div className="h-full flex flex-col">
              <div className="p-4 border-b flex items-center justify-between">
                <h3 className="font-semibold">Asset Library</h3>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowAssetLibrary(false)}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="p-4 border-b">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search assets..."
                    className="pl-8"
                    value={workspace.assets.filter.searchQuery || ""}
                    onChange={(e) => {
                      setWorkspace((prev) => ({
                        ...prev,
                        assets: {
                          ...prev.assets,
                          filter: {
                            ...prev.assets.filter,
                            searchQuery: e.target.value,
                          },
                        },
                      }));
                    }}
                  />
                </div>
                
                <div className="mt-2 flex flex-wrap gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs h-7"
                    onClick={() => {
                      setWorkspace((prev) => ({
                        ...prev,
                        assets: {
                          ...prev.assets,
                          filter: {
                            ...prev.assets.filter,
                            contentTypes: [MultiModalContentType.IMAGE],
                          },
                        },
                      }));
                      loadAssets();
                    }}
                  >
                    <ImageIcon className="h-3 w-3 mr-1" />
                    Images
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs h-7"
                    onClick={() => {
                      setWorkspace((prev) => ({
                        ...prev,
                        assets: {
                          ...prev.assets,
                          filter: {
                            ...prev.assets.filter,
                            contentTypes: [MultiModalContentType.AUDIO],
                          },
                        },
                      }));
                      loadAssets();
                    }}
                  >
                    <Volume2 className="h-3 w-3 mr-1" />
                    Audio
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs h-7"
                    onClick={() => {
                      setWorkspace((prev) => ({
                        ...prev,
                        assets: {
                          ...prev.assets,
                          filter: {
                            ...prev.assets.filter,
                            contentTypes: [MultiModalContentType.VIDEO],
                          },
                        },
                      }));
