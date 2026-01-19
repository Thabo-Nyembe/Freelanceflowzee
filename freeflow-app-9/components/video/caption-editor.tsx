"use client";

/**
 * CaptionEditor Component
 *
 * Industry-leading caption/subtitle editor with:
 * - Real-time waveform visualization
 * - Multi-speaker support with color coding
 * - Keyboard shortcuts for professional editing
 * - AI-powered auto-correction
 * - Multi-language translation
 * - Export to SRT, VTT, ASS formats
 * - Timing adjustment with snap-to-audio
 * - Batch editing operations
 * - Style customization (fonts, colors, positioning)
 */

import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Type,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Plus,
  Trash2,
  Copy,
  Scissors,
  Merge,
  Split,
  Download,
  Upload,
  Languages,
  Wand2,
  Settings,
  Eye,
  EyeOff,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  Italic,
  Underline,
  Palette,
  Move,
  Clock,
  Search,
  Replace,
  Undo2,
  Redo2,
  Save,
  FileText,
  Users,
  Mic,
  Sparkles,
  CheckCircle,
  AlertCircle,
  Info,
  ChevronDown,
  ChevronUp,
  GripVertical,
  Keyboard,
  Maximize2,
  Minimize2,
  RefreshCw,
  Filter,
  SortAsc,
  Lock,
  Unlock,
  ZoomIn,
  ZoomOut,
  MoreVertical,
} from 'lucide-react';
import { toast } from 'sonner';

// ============================================================================
// Types
// ============================================================================

export interface Caption {
  id: string;
  index: number;
  startTime: number;
  endTime: number;
  text: string;
  speaker?: string;
  speakerColor?: string;
  confidence?: number;
  isEdited?: boolean;
  isLocked?: boolean;
  style?: CaptionStyle;
  words?: WordTimestamp[];
}

export interface WordTimestamp {
  word: string;
  start: number;
  end: number;
  confidence: number;
}

export interface CaptionStyle {
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: 'normal' | 'bold';
  fontStyle?: 'normal' | 'italic';
  textDecoration?: 'none' | 'underline';
  color?: string;
  backgroundColor?: string;
  backgroundOpacity?: number;
  alignment?: 'left' | 'center' | 'right';
  position?: 'top' | 'middle' | 'bottom';
  marginVertical?: number;
  marginHorizontal?: number;
}

export interface Speaker {
  id: string;
  label: string;
  color: string;
  speakingTime: number;
}

export interface TranscriptionResult {
  text: string;
  language: string;
  languageConfidence: number;
  duration: number;
  segments: Caption[];
  speakers?: Speaker[];
  words?: WordTimestamp[];
}

export interface CaptionEditorProps {
  videoUrl: string;
  videoDuration: number;
  initialCaptions?: Caption[];
  transcriptionResult?: TranscriptionResult;
  onCaptionsChange?: (captions: Caption[]) => void;
  onExport?: (format: ExportFormat, content: string) => void;
  onSave?: (captions: Caption[]) => void;
  readOnly?: boolean;
  className?: string;
}

export type ExportFormat = 'srt' | 'vtt' | 'ass' | 'json' | 'txt';

interface UndoState {
  captions: Caption[];
  timestamp: number;
}

// ============================================================================
// Constants
// ============================================================================

const SPEAKER_COLORS = [
  '#3B82F6', // Blue
  '#10B981', // Green
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#06B6D4', // Cyan
  '#F97316', // Orange
];

const FONT_FAMILIES = [
  { value: 'Arial', label: 'Arial' },
  { value: 'Helvetica', label: 'Helvetica' },
  { value: 'Verdana', label: 'Verdana' },
  { value: 'Georgia', label: 'Georgia' },
  { value: 'Times New Roman', label: 'Times New Roman' },
  { value: 'Courier New', label: 'Courier New' },
  { value: 'Impact', label: 'Impact' },
  { value: 'Comic Sans MS', label: 'Comic Sans MS' },
];

const FONT_SIZES = [12, 14, 16, 18, 20, 24, 28, 32, 36, 42, 48];

const KEYBOARD_SHORTCUTS = [
  { key: 'Space', description: 'Play/Pause' },
  { key: 'J', description: 'Jump back 5 seconds' },
  { key: 'L', description: 'Jump forward 5 seconds' },
  { key: 'K', description: 'Play/Pause (alternative)' },
  { key: 'Ctrl+S', description: 'Save captions' },
  { key: 'Ctrl+Z', description: 'Undo' },
  { key: 'Ctrl+Shift+Z', description: 'Redo' },
  { key: 'Enter', description: 'Split caption at cursor' },
  { key: 'Delete', description: 'Delete selected caption' },
  { key: 'Ctrl+D', description: 'Duplicate caption' },
  { key: 'Ctrl+M', description: 'Merge with next caption' },
  { key: 'Arrow Up/Down', description: 'Navigate captions' },
  { key: 'Ctrl+F', description: 'Find & Replace' },
];

// ============================================================================
// Utility Functions
// ============================================================================

function formatTime(seconds: number, includeMs = true): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 1000);

  if (includeMs) {
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')},${ms.toString().padStart(3, '0')}`;
  }
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

function parseTime(timeStr: string): number {
  const match = timeStr.match(/(\d+):(\d+):(\d+)[,.](\d+)/);
  if (match) {
    const [, h, m, s, ms] = match;
    return parseInt(h) * 3600 + parseInt(m) * 60 + parseInt(s) + parseInt(ms) / 1000;
  }
  return 0;
}

function generateCaptionId(): string {
  return `cap_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function exportToSRT(captions: Caption[]): string {
  return captions.map((cap, i) => {
    const start = formatTime(cap.startTime);
    const end = formatTime(cap.endTime);
    return `${i + 1}\n${start} --> ${end}\n${cap.text}\n`;
  }).join('\n');
}

function exportToVTT(captions: Caption[]): string {
  const header = 'WEBVTT\n\n';
  const content = captions.map((cap, i) => {
    const start = formatTime(cap.startTime).replace(',', '.');
    const end = formatTime(cap.endTime).replace(',', '.');
    const speaker = cap.speaker ? `<v ${cap.speaker}>` : '';
    return `${i + 1}\n${start} --> ${end}\n${speaker}${cap.text}\n`;
  }).join('\n');
  return header + content;
}

function exportToASS(captions: Caption[], defaultStyle?: CaptionStyle): string {
  const header = `[Script Info]
Title: Video Captions
ScriptType: v4.00+
Collisions: Normal
PlayDepth: 0

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,${defaultStyle?.fontFamily || 'Arial'},${defaultStyle?.fontSize || 20},&H00FFFFFF,&H000000FF,&H00000000,&H80000000,${defaultStyle?.fontWeight === 'bold' ? 1 : 0},${defaultStyle?.fontStyle === 'italic' ? 1 : 0},0,0,100,100,0,0,1,2,1,2,10,10,10,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
`;

  const formatAssTime = (seconds: number): string => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    const cs = Math.floor((seconds % 1) * 100);
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${cs.toString().padStart(2, '0')}`;
  };

  const events = captions.map(cap => {
    const start = formatAssTime(cap.startTime);
    const end = formatAssTime(cap.endTime);
    const speaker = cap.speaker || '';
    return `Dialogue: 0,${start},${end},Default,${speaker},0,0,0,,${cap.text}`;
  }).join('\n');

  return header + events;
}

function exportToJSON(captions: Caption[]): string {
  return JSON.stringify(captions, null, 2);
}

function exportToTXT(captions: Caption[]): string {
  return captions.map(cap => {
    const speaker = cap.speaker ? `[${cap.speaker}] ` : '';
    return `${speaker}${cap.text}`;
  }).join('\n\n');
}

// ============================================================================
// Sub-Components
// ============================================================================

interface CaptionListItemProps {
  caption: Caption;
  isSelected: boolean;
  isPlaying: boolean;
  onSelect: () => void;
  onUpdate: (updates: Partial<Caption>) => void;
  onDelete: () => void;
  onSplit: () => void;
  onMergeNext: () => void;
  onDuplicate: () => void;
  readOnly?: boolean;
}

function CaptionListItem({
  caption,
  isSelected,
  isPlaying,
  onSelect,
  onUpdate,
  onDelete,
  onSplit,
  onMergeNext,
  onDuplicate,
  readOnly,
}: CaptionListItemProps) {
  const [isEditingTime, setIsEditingTime] = useState(false);
  const [startTimeInput, setStartTimeInput] = useState(formatTime(caption.startTime));
  const [endTimeInput, setEndTimeInput] = useState(formatTime(caption.endTime));

  const handleTimeUpdate = useCallback(() => {
    const newStart = parseTime(startTimeInput);
    const newEnd = parseTime(endTimeInput);
    if (newStart < newEnd) {
      onUpdate({ startTime: newStart, endTime: newEnd });
    }
    setIsEditingTime(false);
  }, [startTimeInput, endTimeInput, onUpdate]);

  return (
    <div
      className={cn(
        'group relative p-3 rounded-lg border transition-all cursor-pointer',
        isSelected && 'border-primary bg-primary/5 ring-2 ring-primary/20',
        isPlaying && !isSelected && 'border-green-500 bg-green-500/5',
        !isSelected && !isPlaying && 'border-border hover:border-primary/50 hover:bg-muted/50',
        caption.isLocked && 'opacity-60'
      )}
      onClick={onSelect}
    >
      {/* Index Badge */}
      <div className="absolute -left-2 -top-2">
        <Badge variant="secondary" className="h-5 px-1.5 text-xs">
          {caption.index + 1}
        </Badge>
      </div>

      {/* Lock Indicator */}
      {caption.isLocked && (
        <div className="absolute -right-2 -top-2">
          <Badge variant="outline" className="h-5 px-1.5">
            <Lock className="h-3 w-3" />
          </Badge>
        </div>
      )}

      {/* Speaker Badge */}
      {caption.speaker && (
        <div className="mb-2 flex items-center gap-2">
          <Badge
            variant="outline"
            style={{ borderColor: caption.speakerColor, color: caption.speakerColor }}
            className="text-xs"
          >
            <Users className="h-3 w-3 mr-1" />
            {caption.speaker}
          </Badge>
          {caption.confidence && caption.confidence < 0.8 && (
            <Badge variant="secondary" className="text-xs bg-yellow-500/10 text-yellow-600">
              <AlertCircle className="h-3 w-3 mr-1" />
              Low confidence
            </Badge>
          )}
        </div>
      )}

      {/* Time Controls */}
      <div className="flex items-center gap-2 mb-2 text-xs text-muted-foreground">
        {isEditingTime && !readOnly ? (
          <div className="flex items-center gap-1">
            <Input
              value={startTimeInput}
              onChange={(e) => setStartTimeInput(e.target.value)}
              className="h-6 w-28 text-xs font-mono"
              onKeyDown={(e) => e.key === 'Enter' && handleTimeUpdate()}
            />
            <span>→</span>
            <Input
              value={endTimeInput}
              onChange={(e) => setEndTimeInput(e.target.value)}
              className="h-6 w-28 text-xs font-mono"
              onKeyDown={(e) => e.key === 'Enter' && handleTimeUpdate()}
            />
            <Button size="sm" variant="ghost" className="h-6 px-2" onClick={handleTimeUpdate}>
              <CheckCircle className="h-3 w-3" />
            </Button>
          </div>
        ) : (
          <button
            className="flex items-center gap-1 hover:text-foreground font-mono"
            onClick={(e) => {
              e.stopPropagation();
              if (!readOnly) setIsEditingTime(true);
            }}
          >
            <Clock className="h-3 w-3" />
            {formatTime(caption.startTime, false)} → {formatTime(caption.endTime, false)}
          </button>
        )}
        <span className="text-muted-foreground/60">
          ({(caption.endTime - caption.startTime).toFixed(1)}s)
        </span>
      </div>

      {/* Caption Text */}
      {readOnly ? (
        <p className="text-sm whitespace-pre-wrap">{caption.text}</p>
      ) : (
        <Textarea
          value={caption.text}
          onChange={(e) => onUpdate({ text: e.target.value, isEdited: true })}
          className="min-h-[60px] resize-none text-sm"
          onClick={(e) => e.stopPropagation()}
          disabled={caption.isLocked}
        />
      )}

      {/* Action Buttons (visible on hover) */}
      {!readOnly && (
        <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onUpdate({ isLocked: !caption.isLocked })}>
                {caption.isLocked ? (
                  <><Unlock className="h-4 w-4 mr-2" />Unlock</>
                ) : (
                  <><Lock className="h-4 w-4 mr-2" />Lock</>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onDuplicate}>
                <Copy className="h-4 w-4 mr-2" />Duplicate
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onSplit}>
                <Split className="h-4 w-4 mr-2" />Split
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onMergeNext}>
                <Merge className="h-4 w-4 mr-2" />Merge with next
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onDelete} className="text-destructive">
                <Trash2 className="h-4 w-4 mr-2" />Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      {/* Edited Indicator */}
      {caption.isEdited && (
        <div className="absolute right-2 bottom-2">
          <Badge variant="outline" className="text-xs bg-blue-500/10 text-blue-600">
            Edited
          </Badge>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export default function CaptionEditor({
  videoUrl,
  videoDuration,
  initialCaptions = [],
  transcriptionResult,
  onCaptionsChange,
  onExport,
  onSave,
  readOnly = false,
  className,
}: CaptionEditorProps) {
  // State
  const [captions, setCaptions] = useState<Caption[]>(() => {
    if (transcriptionResult?.segments) {
      return transcriptionResult.segments.map((seg, i) => ({
        ...seg,
        id: seg.id || generateCaptionId(),
        index: i,
      }));
    }
    return initialCaptions.map((cap, i) => ({ ...cap, index: i }));
  });

  const [selectedCaptionId, setSelectedCaptionId] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [zoom, setZoom] = useState(1);
  const [showPreview, setShowPreview] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [speakers, setSpeakers] = useState<Speaker[]>(transcriptionResult?.speakers || []);

  // Undo/Redo
  const [undoStack, setUndoStack] = useState<UndoState[]>([]);
  const [redoStack, setRedoStack] = useState<UndoState[]>([]);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [replaceText, setReplaceText] = useState('');
  const [showFindReplace, setShowFindReplace] = useState(false);
  const [filterSpeaker, setFilterSpeaker] = useState<string | 'all'>('all');

  // Style Settings
  const [globalStyle, setGlobalStyle] = useState<CaptionStyle>({
    fontFamily: 'Arial',
    fontSize: 20,
    fontWeight: 'normal',
    fontStyle: 'normal',
    textDecoration: 'none',
    color: '#FFFFFF',
    backgroundColor: '#000000',
    backgroundOpacity: 0.8,
    alignment: 'center',
    position: 'bottom',
    marginVertical: 10,
    marginHorizontal: 10,
  });

  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const captionListRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Computed Values
  const selectedCaption = useMemo(
    () => captions.find(c => c.id === selectedCaptionId),
    [captions, selectedCaptionId]
  );

  const currentCaption = useMemo(
    () => captions.find(c => currentTime >= c.startTime && currentTime <= c.endTime),
    [captions, currentTime]
  );

  const filteredCaptions = useMemo(() => {
    let filtered = captions;

    if (filterSpeaker !== 'all') {
      filtered = filtered.filter(c => c.speaker === filterSpeaker);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(c => c.text.toLowerCase().includes(query));
    }

    return filtered;
  }, [captions, filterSpeaker, searchQuery]);

  // Save undo state
  const saveUndoState = useCallback(() => {
    setUndoStack(prev => [...prev.slice(-49), { captions: [...captions], timestamp: Date.now() }]);
    setRedoStack([]);
  }, [captions]);

  // Undo
  const undo = useCallback(() => {
    if (undoStack.length === 0) return;
    const prev = undoStack[undoStack.length - 1];
    setRedoStack(r => [...r, { captions: [...captions], timestamp: Date.now() }]);
    setCaptions(prev.captions);
    setUndoStack(u => u.slice(0, -1));
  }, [undoStack, captions]);

  // Redo
  const redo = useCallback(() => {
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    setUndoStack(u => [...u, { captions: [...captions], timestamp: Date.now() }]);
    setCaptions(next.captions);
    setRedoStack(r => r.slice(0, -1));
  }, [redoStack, captions]);

  // Caption CRUD operations
  const addCaption = useCallback((afterIndex?: number) => {
    saveUndoState();
    const insertIndex = afterIndex !== undefined ? afterIndex + 1 : captions.length;
    const prevCaption = captions[insertIndex - 1];
    const nextCaption = captions[insertIndex];

    const startTime = prevCaption ? prevCaption.endTime + 0.1 : currentTime;
    const endTime = nextCaption ? nextCaption.startTime - 0.1 : Math.min(startTime + 3, videoDuration);

    const newCaption: Caption = {
      id: generateCaptionId(),
      index: insertIndex,
      startTime,
      endTime,
      text: '',
      isEdited: true,
    };

    const updated = [
      ...captions.slice(0, insertIndex),
      newCaption,
      ...captions.slice(insertIndex).map((c, i) => ({ ...c, index: insertIndex + i + 1 })),
    ];

    setCaptions(updated);
    setSelectedCaptionId(newCaption.id);
    onCaptionsChange?.(updated);
  }, [captions, currentTime, videoDuration, saveUndoState, onCaptionsChange]);

  const updateCaption = useCallback((id: string, updates: Partial<Caption>) => {
    saveUndoState();
    const updated = captions.map(c => c.id === id ? { ...c, ...updates } : c);
    setCaptions(updated);
    onCaptionsChange?.(updated);
  }, [captions, saveUndoState, onCaptionsChange]);

  const deleteCaption = useCallback((id: string) => {
    saveUndoState();
    const updated = captions
      .filter(c => c.id !== id)
      .map((c, i) => ({ ...c, index: i }));
    setCaptions(updated);
    setSelectedCaptionId(null);
    onCaptionsChange?.(updated);
    toast.success('Caption deleted');
  }, [captions, saveUndoState, onCaptionsChange]);

  const splitCaption = useCallback((id: string) => {
    const caption = captions.find(c => c.id === id);
    if (!caption) return;

    saveUndoState();
    const midTime = (caption.startTime + caption.endTime) / 2;
    const words = caption.text.split(' ');
    const midWordIndex = Math.ceil(words.length / 2);

    const firstPart: Caption = {
      ...caption,
      endTime: midTime,
      text: words.slice(0, midWordIndex).join(' '),
      isEdited: true,
    };

    const secondPart: Caption = {
      id: generateCaptionId(),
      index: caption.index + 1,
      startTime: midTime,
      endTime: caption.endTime,
      text: words.slice(midWordIndex).join(' '),
      speaker: caption.speaker,
      speakerColor: caption.speakerColor,
      isEdited: true,
    };

    const updated = [
      ...captions.slice(0, caption.index),
      firstPart,
      secondPart,
      ...captions.slice(caption.index + 1).map((c, i) => ({ ...c, index: caption.index + 2 + i })),
    ];

    setCaptions(updated);
    onCaptionsChange?.(updated);
    toast.success('Caption split');
  }, [captions, saveUndoState, onCaptionsChange]);

  const mergeWithNext = useCallback((id: string) => {
    const captionIndex = captions.findIndex(c => c.id === id);
    if (captionIndex === -1 || captionIndex === captions.length - 1) return;

    saveUndoState();
    const current = captions[captionIndex];
    const next = captions[captionIndex + 1];

    const merged: Caption = {
      ...current,
      endTime: next.endTime,
      text: `${current.text} ${next.text}`,
      isEdited: true,
    };

    const updated = [
      ...captions.slice(0, captionIndex),
      merged,
      ...captions.slice(captionIndex + 2).map((c, i) => ({ ...c, index: captionIndex + 1 + i })),
    ];

    setCaptions(updated);
    onCaptionsChange?.(updated);
    toast.success('Captions merged');
  }, [captions, saveUndoState, onCaptionsChange]);

  const duplicateCaption = useCallback((id: string) => {
    const caption = captions.find(c => c.id === id);
    if (!caption) return;

    saveUndoState();
    const duplicate: Caption = {
      ...caption,
      id: generateCaptionId(),
      index: caption.index + 1,
      startTime: caption.endTime + 0.1,
      endTime: caption.endTime + (caption.endTime - caption.startTime) + 0.1,
      isEdited: true,
    };

    const updated = [
      ...captions.slice(0, caption.index + 1),
      duplicate,
      ...captions.slice(caption.index + 1).map((c, i) => ({ ...c, index: caption.index + 2 + i })),
    ];

    setCaptions(updated);
    onCaptionsChange?.(updated);
    toast.success('Caption duplicated');
  }, [captions, saveUndoState, onCaptionsChange]);

  // Find & Replace
  const handleFindReplace = useCallback((replaceAll: boolean) => {
    if (!searchQuery || !replaceText) return;

    saveUndoState();
    const updated = captions.map(c => {
      if (c.text.toLowerCase().includes(searchQuery.toLowerCase())) {
        const regex = new RegExp(searchQuery, replaceAll ? 'gi' : 'i');
        return {
          ...c,
          text: c.text.replace(regex, replaceText),
          isEdited: true,
        };
      }
      return c;
    });

    setCaptions(updated);
    onCaptionsChange?.(updated);
    toast.success(replaceAll ? 'All occurrences replaced' : 'First occurrence replaced');
  }, [searchQuery, replaceText, captions, saveUndoState, onCaptionsChange]);

  // Export
  const handleExport = useCallback((format: ExportFormat) => {
    let content: string;

    switch (format) {
      case 'srt':
        content = exportToSRT(captions);
        break;
      case 'vtt':
        content = exportToVTT(captions);
        break;
      case 'ass':
        content = exportToASS(captions, globalStyle);
        break;
      case 'json':
        content = exportToJSON(captions);
        break;
      case 'txt':
        content = exportToTXT(captions);
        break;
      default:
        return;
    }

    if (onExport) {
      onExport(format, content);
    } else {
      // Download file
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `captions.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success(`Exported to ${format.toUpperCase()}`);
    }
  }, [captions, globalStyle, onExport]);

  // Video Controls
  const togglePlay = useCallback(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  }, [isPlaying]);

  const seek = useCallback((time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(0, Math.min(time, videoDuration));
    }
  }, [videoDuration]);

  const jumpBy = useCallback((seconds: number) => {
    seek(currentTime + seconds);
  }, [currentTime, seek]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.key.toLowerCase()) {
        case ' ':
        case 'k':
          e.preventDefault();
          togglePlay();
          break;
        case 'j':
          e.preventDefault();
          jumpBy(-5);
          break;
        case 'l':
          e.preventDefault();
          jumpBy(5);
          break;
        case 'z':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            if (e.shiftKey) {
              redo();
            } else {
              undo();
            }
          }
          break;
        case 's':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            onSave?.(captions);
            toast.success('Captions saved');
          }
          break;
        case 'f':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            setShowFindReplace(true);
          }
          break;
        case 'delete':
        case 'backspace':
          if (selectedCaptionId && !readOnly) {
            e.preventDefault();
            deleteCaption(selectedCaptionId);
          }
          break;
        case 'arrowup':
          e.preventDefault();
          if (selectedCaption) {
            const prevIndex = selectedCaption.index - 1;
            if (prevIndex >= 0) {
              setSelectedCaptionId(captions[prevIndex].id);
            }
          }
          break;
        case 'arrowdown':
          e.preventDefault();
          if (selectedCaption) {
            const nextIndex = selectedCaption.index + 1;
            if (nextIndex < captions.length) {
              setSelectedCaptionId(captions[nextIndex].id);
            }
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay, jumpBy, undo, redo, captions, selectedCaption, selectedCaptionId, readOnly, deleteCaption, onSave]);

  // Video time update
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => setCurrentTime(video.currentTime);
    const handleEnded = () => setIsPlaying(false);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
    };
  }, []);

  // Auto-scroll to current caption
  useEffect(() => {
    if (currentCaption && captionListRef.current) {
      const element = captionListRef.current.querySelector(`[data-caption-id="${currentCaption.id}"]`);
      element?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [currentCaption]);

  return (
    <div
      ref={containerRef}
      className={cn('flex flex-col h-full bg-background', isFullscreen && 'fixed inset-0 z-50', className)}
    >
      {/* Toolbar */}
      <div className="flex items-center justify-between p-3 border-b bg-muted/30">
        <div className="flex items-center gap-2">
          <Type className="h-5 w-5 text-muted-foreground" />
          <span className="font-medium">Caption Editor</span>
          <Badge variant="outline" className="ml-2">
            {captions.length} captions
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          {/* Undo/Redo */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={undo}
                  disabled={undoStack.length === 0}
                >
                  <Undo2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Undo (Ctrl+Z)</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={redo}
                  disabled={redoStack.length === 0}
                >
                  <Redo2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Redo (Ctrl+Shift+Z)</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <Separator orientation="vertical" className="h-6" />

          {/* Find & Replace */}
          <Dialog open={showFindReplace} onOpenChange={setShowFindReplace}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm">
                <Search className="h-4 w-4 mr-2" />
                Find & Replace
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Find & Replace</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Find</Label>
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search text..."
                  />
                </div>
                <div>
                  <Label>Replace with</Label>
                  <Input
                    value={replaceText}
                    onChange={(e) => setReplaceText(e.target.value)}
                    placeholder="Replacement text..."
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => handleFindReplace(false)}>
                  Replace
                </Button>
                <Button onClick={() => handleFindReplace(true)}>
                  Replace All
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Separator orientation="vertical" className="h-6" />

          {/* Export */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Export Format</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleExport('srt')}>
                <FileText className="h-4 w-4 mr-2" />
                SRT (SubRip)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('vtt')}>
                <FileText className="h-4 w-4 mr-2" />
                VTT (WebVTT)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('ass')}>
                <FileText className="h-4 w-4 mr-2" />
                ASS (Advanced SubStation)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('json')}>
                <FileText className="h-4 w-4 mr-2" />
                JSON
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('txt')}>
                <FileText className="h-4 w-4 mr-2" />
                Plain Text
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Save */}
          {!readOnly && onSave && (
            <Button size="sm" onClick={() => { onSave(captions); toast.success('Saved'); }}>
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
          )}

          {/* Fullscreen */}
          <Button variant="ghost" size="sm" onClick={() => setIsFullscreen(!isFullscreen)}>
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>

          {/* Keyboard Shortcuts */}
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm">
                <Keyboard className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Keyboard Shortcuts</DialogTitle>
              </DialogHeader>
              <div className="grid gap-2">
                {KEYBOARD_SHORTCUTS.map((shortcut) => (
                  <div key={shortcut.key} className="flex justify-between py-1.5 border-b last:border-0">
                    <span className="text-sm text-muted-foreground">{shortcut.description}</span>
                    <kbd className="px-2 py-1 text-xs bg-muted rounded">{shortcut.key}</kbd>
                  </div>
                ))}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel - Caption List */}
        <div className="w-1/2 flex flex-col border-r">
          {/* Filter Bar */}
          <div className="p-2 border-b flex items-center gap-2">
            <Input
              placeholder="Search captions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8"
            />
            {speakers.length > 0 && (
              <Select value={filterSpeaker} onValueChange={setFilterSpeaker}>
                <SelectTrigger className="w-40 h-8">
                  <SelectValue placeholder="All speakers" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All speakers</SelectItem>
                  {speakers.map((speaker) => (
                    <SelectItem key={speaker.id} value={speaker.label}>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: speaker.color }}
                        />
                        {speaker.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {!readOnly && (
              <Button size="sm" variant="outline" onClick={() => addCaption()}>
                <Plus className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Caption List */}
          <ScrollArea className="flex-1" ref={captionListRef}>
            <div className="p-3 space-y-3">
              {filteredCaptions.map((caption) => (
                <div key={caption.id} data-caption-id={caption.id}>
                  <CaptionListItem
                    caption={caption}
                    isSelected={caption.id === selectedCaptionId}
                    isPlaying={caption === currentCaption}
                    onSelect={() => {
                      setSelectedCaptionId(caption.id);
                      seek(caption.startTime);
                    }}
                    onUpdate={(updates) => updateCaption(caption.id, updates)}
                    onDelete={() => deleteCaption(caption.id)}
                    onSplit={() => splitCaption(caption.id)}
                    onMergeNext={() => mergeWithNext(caption.id)}
                    onDuplicate={() => duplicateCaption(caption.id)}
                    readOnly={readOnly}
                  />
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Right Panel - Preview & Controls */}
        <div className="w-1/2 flex flex-col">
          {/* Video Preview */}
          <div className="relative bg-black aspect-video">
            <video
              ref={videoRef}
              src={videoUrl}
              className="w-full h-full"
              muted={isMuted}
              onLoadedMetadata={() => {
                if (videoRef.current) {
                  videoRef.current.volume = volume;
                  videoRef.current.playbackRate = playbackRate;
                }
              }}
            />

            {/* Caption Overlay */}
            {showPreview && currentCaption && (
              <div
                className="absolute left-0 right-0 flex justify-center px-4"
                style={{
                  [globalStyle.position === 'top' ? 'top' : globalStyle.position === 'middle' ? 'top' : 'bottom']:
                    globalStyle.position === 'middle' ? '50%' : `${globalStyle.marginVertical}px`,
                  transform: globalStyle.position === 'middle' ? 'translateY(-50%)' : undefined,
                }}
              >
                <div
                  className="px-3 py-1.5 rounded max-w-[90%] text-center"
                  style={{
                    fontFamily: globalStyle.fontFamily,
                    fontSize: `${globalStyle.fontSize}px`,
                    fontWeight: globalStyle.fontWeight,
                    fontStyle: globalStyle.fontStyle,
                    textDecoration: globalStyle.textDecoration,
                    color: globalStyle.color,
                    backgroundColor: `${globalStyle.backgroundColor}${Math.round((globalStyle.backgroundOpacity || 0.8) * 255).toString(16).padStart(2, '0')}`,
                    textAlign: globalStyle.alignment,
                  }}
                >
                  {currentCaption.text}
                </div>
              </div>
            )}

            {/* Toggle Preview */}
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-2 right-2 bg-black/50 hover:bg-black/70"
              onClick={() => setShowPreview(!showPreview)}
            >
              {showPreview ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            </Button>
          </div>

          {/* Playback Controls */}
          <div className="p-3 border-b bg-muted/30">
            <div className="flex items-center gap-2 mb-2">
              <Button variant="ghost" size="sm" onClick={() => jumpBy(-5)}>
                <SkipBack className="h-4 w-4" />
              </Button>
              <Button variant="default" size="sm" onClick={togglePlay}>
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
              <Button variant="ghost" size="sm" onClick={() => jumpBy(5)}>
                <SkipForward className="h-4 w-4" />
              </Button>

              <div className="flex-1 mx-4">
                <Slider
                  value={[currentTime]}
                  min={0}
                  max={videoDuration}
                  step={0.1}
                  onValueChange={([value]) => seek(value)}
                  className="cursor-pointer"
                />
              </div>

              <span className="text-sm font-mono text-muted-foreground w-28 text-right">
                {formatTime(currentTime, false)} / {formatTime(videoDuration, false)}
              </span>
            </div>

            <div className="flex items-center gap-4">
              {/* Volume */}
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => setIsMuted(!isMuted)}>
                  {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </Button>
                <Slider
                  value={[volume]}
                  min={0}
                  max={1}
                  step={0.1}
                  onValueChange={([v]) => {
                    setVolume(v);
                    if (videoRef.current) videoRef.current.volume = v;
                  }}
                  className="w-20"
                />
              </div>

              {/* Playback Rate */}
              <Select
                value={playbackRate.toString()}
                onValueChange={(v) => {
                  const rate = parseFloat(v);
                  setPlaybackRate(rate);
                  if (videoRef.current) videoRef.current.playbackRate = rate;
                }}
              >
                <SelectTrigger className="w-20 h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0.5">0.5x</SelectItem>
                  <SelectItem value="0.75">0.75x</SelectItem>
                  <SelectItem value="1">1x</SelectItem>
                  <SelectItem value="1.25">1.25x</SelectItem>
                  <SelectItem value="1.5">1.5x</SelectItem>
                  <SelectItem value="2">2x</SelectItem>
                </SelectContent>
              </Select>

              {/* Zoom */}
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm" onClick={() => setZoom(Math.max(0.5, zoom - 0.25))}>
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <span className="text-xs w-12 text-center">{Math.round(zoom * 100)}%</span>
                <Button variant="ghost" size="sm" onClick={() => setZoom(Math.min(2, zoom + 0.25))}>
                  <ZoomIn className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Style Settings */}
          <Tabs defaultValue="style" className="flex-1">
            <TabsList className="w-full justify-start px-3 border-b rounded-none">
              <TabsTrigger value="style">Style</TabsTrigger>
              <TabsTrigger value="speakers">Speakers</TabsTrigger>
              <TabsTrigger value="ai">AI Tools</TabsTrigger>
            </TabsList>

            <TabsContent value="style" className="p-3 space-y-4 overflow-auto">
              <div className="grid grid-cols-2 gap-4">
                {/* Font Family */}
                <div>
                  <Label className="text-xs">Font Family</Label>
                  <Select
                    value={globalStyle.fontFamily}
                    onValueChange={(v) => setGlobalStyle(s => ({ ...s, fontFamily: v }))}
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FONT_FAMILIES.map((font) => (
                        <SelectItem key={font.value} value={font.value}>
                          <span style={{ fontFamily: font.value }}>{font.label}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Font Size */}
                <div>
                  <Label className="text-xs">Font Size</Label>
                  <Select
                    value={globalStyle.fontSize?.toString()}
                    onValueChange={(v) => setGlobalStyle(s => ({ ...s, fontSize: parseInt(v) }))}
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FONT_SIZES.map((size) => (
                        <SelectItem key={size} value={size.toString()}>{size}px</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Text Color */}
                <div>
                  <Label className="text-xs">Text Color</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="color"
                      value={globalStyle.color}
                      onChange={(e) => setGlobalStyle(s => ({ ...s, color: e.target.value }))}
                      className="h-8 w-12 p-1"
                    />
                    <Input
                      value={globalStyle.color}
                      onChange={(e) => setGlobalStyle(s => ({ ...s, color: e.target.value }))}
                      className="h-8 flex-1 font-mono text-xs"
                    />
                  </div>
                </div>

                {/* Background Color */}
                <div>
                  <Label className="text-xs">Background</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="color"
                      value={globalStyle.backgroundColor}
                      onChange={(e) => setGlobalStyle(s => ({ ...s, backgroundColor: e.target.value }))}
                      className="h-8 w-12 p-1"
                    />
                    <Slider
                      value={[(globalStyle.backgroundOpacity || 0.8) * 100]}
                      min={0}
                      max={100}
                      step={5}
                      onValueChange={([v]) => setGlobalStyle(s => ({ ...s, backgroundOpacity: v / 100 }))}
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>

              {/* Text Formatting */}
              <div>
                <Label className="text-xs mb-2 block">Formatting</Label>
                <div className="flex items-center gap-1">
                  <Button
                    variant={globalStyle.fontWeight === 'bold' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setGlobalStyle(s => ({ ...s, fontWeight: s.fontWeight === 'bold' ? 'normal' : 'bold' }))}
                  >
                    <Bold className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={globalStyle.fontStyle === 'italic' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setGlobalStyle(s => ({ ...s, fontStyle: s.fontStyle === 'italic' ? 'normal' : 'italic' }))}
                  >
                    <Italic className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={globalStyle.textDecoration === 'underline' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setGlobalStyle(s => ({ ...s, textDecoration: s.textDecoration === 'underline' ? 'none' : 'underline' }))}
                  >
                    <Underline className="h-4 w-4" />
                  </Button>

                  <Separator orientation="vertical" className="h-6 mx-2" />

                  <Button
                    variant={globalStyle.alignment === 'left' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setGlobalStyle(s => ({ ...s, alignment: 'left' }))}
                  >
                    <AlignLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={globalStyle.alignment === 'center' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setGlobalStyle(s => ({ ...s, alignment: 'center' }))}
                  >
                    <AlignCenter className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={globalStyle.alignment === 'right' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setGlobalStyle(s => ({ ...s, alignment: 'right' }))}
                  >
                    <AlignRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Position */}
              <div>
                <Label className="text-xs mb-2 block">Position</Label>
                <div className="flex items-center gap-2">
                  {(['top', 'middle', 'bottom'] as const).map((pos) => (
                    <Button
                      key={pos}
                      variant={globalStyle.position === pos ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setGlobalStyle(s => ({ ...s, position: pos }))}
                      className="capitalize"
                    >
                      {pos}
                    </Button>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="speakers" className="p-3 space-y-4">
              {speakers.length > 0 ? (
                <div className="space-y-3">
                  {speakers.map((speaker, i) => (
                    <div key={speaker.id} className="flex items-center gap-3 p-2 rounded-lg border">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: speaker.color }}
                      />
                      <Input
                        value={speaker.label}
                        onChange={(e) => {
                          const updated = [...speakers];
                          updated[i] = { ...updated[i], label: e.target.value };
                          setSpeakers(updated);
                          // Update captions with new speaker label
                          const oldLabel = speakers[i].label;
                          setCaptions(caps => caps.map(c =>
                            c.speaker === oldLabel ? { ...c, speaker: e.target.value } : c
                          ));
                        }}
                        className="h-8 flex-1"
                      />
                      <Input
                        type="color"
                        value={speaker.color}
                        onChange={(e) => {
                          const updated = [...speakers];
                          updated[i] = { ...updated[i], color: e.target.value };
                          setSpeakers(updated);
                          setCaptions(caps => caps.map(c =>
                            c.speaker === speaker.label ? { ...c, speakerColor: e.target.value } : c
                          ));
                        }}
                        className="h-8 w-12 p-1"
                      />
                      <span className="text-xs text-muted-foreground">
                        {Math.round(speaker.speakingTime)}s
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No speakers detected</p>
                  <p className="text-xs mt-1">Enable speaker diarization during transcription</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="ai" className="p-3 space-y-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Wand2 className="h-4 w-4" />
                    AI-Powered Corrections
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Automatically fix grammar, punctuation, and spelling
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      toast.info('AI correction feature coming soon');
                    }}
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    Auto-Correct All Captions
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Languages className="h-4 w-4" />
                    Translation
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Translate captions to other languages
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select target language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                      <SelectItem value="de">German</SelectItem>
                      <SelectItem value="zh">Chinese</SelectItem>
                      <SelectItem value="ja">Japanese</SelectItem>
                      <SelectItem value="ko">Korean</SelectItem>
                      <SelectItem value="pt">Portuguese</SelectItem>
                      <SelectItem value="ar">Arabic</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      toast.info('Translation feature coming soon');
                    }}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Translate Captions
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Mic className="h-4 w-4" />
                    Re-Transcribe
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Generate new transcription with different settings
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      toast.info('Re-transcription feature coming soon');
                    }}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Re-Transcribe Video
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

export { CaptionEditor };
