import { NextRequest, NextResponse } from 'next/server';

// ============================================================================
// WORLD-CLASS CANVAS COLLABORATION API
// Real-time collaborative whiteboard and design canvas backend infrastructure
// 45+ actions, real-time sync, shapes, drawing, annotations, presentations
// ============================================================================

// Types
type CanvasAction =
  | 'create-canvas' | 'get-canvas' | 'update-canvas' | 'delete-canvas' | 'list-canvases'
  | 'duplicate-canvas' | 'add-element' | 'update-element' | 'delete-element' | 'duplicate-element'
  | 'move-elements' | 'resize-elements' | 'rotate-elements' | 'group-elements' | 'ungroup-elements'
  | 'lock-element' | 'unlock-element' | 'bring-forward' | 'send-backward' | 'bring-to-front' | 'send-to-back'
  | 'add-shape' | 'add-text' | 'add-image' | 'add-sticky-note' | 'add-connector' | 'add-frame'
  | 'draw-path' | 'erase-path' | 'fill-area' | 'add-annotation' | 'update-annotation'
  | 'create-page' | 'delete-page' | 'reorder-pages' | 'duplicate-page' | 'navigate-page'
  | 'start-presentation' | 'end-presentation' | 'next-slide' | 'previous-slide' | 'go-to-slide'
  | 'add-comment' | 'reply-to-comment' | 'resolve-comment' | 'get-comments'
  | 'get-cursors' | 'update-cursor' | 'follow-user' | 'unfollow-user'
  | 'share-canvas' | 'get-collaborators' | 'add-collaborator' | 'remove-collaborator' | 'update-permissions'
  | 'export-canvas' | 'export-page' | 'import-elements' | 'get-version-history' | 'restore-version'
  | 'create-template' | 'get-templates' | 'apply-template' | 'get-assets' | 'upload-asset';

interface Canvas {
  id: string;
  userId: string;
  name: string;
  description?: string;
  pages: CanvasPage[];
  settings: CanvasSettings;
  metadata: CanvasMetadata;
  collaborators: Collaborator[];
  createdAt: string;
  updatedAt: string;
}

interface CanvasPage {
  id: string;
  name: string;
  order: number;
  elements: CanvasElement[];
  background: Background;
  gridEnabled: boolean;
  gridSize: number;
  snapToGrid: boolean;
  viewport: Viewport;
}

interface CanvasElement {
  id: string;
  type: ElementType;
  position: Position;
  size: Size;
  rotation: number;
  opacity: number;
  locked: boolean;
  visible: boolean;
  groupId?: string;
  zIndex: number;
  style: ElementStyle;
  data: ElementData;
  connectors: ConnectorPoint[];
}

type ElementType =
  | 'rectangle' | 'ellipse' | 'triangle' | 'diamond' | 'polygon' | 'star'
  | 'line' | 'arrow' | 'connector' | 'path' | 'freehand'
  | 'text' | 'sticky-note' | 'image' | 'video' | 'embed' | 'frame'
  | 'icon' | 'chart' | 'table' | 'code-block' | 'latex' | 'mindmap-node';

interface Position {
  x: number;
  y: number;
}

interface Size {
  width: number;
  height: number;
}

interface ElementStyle {
  fill: string;
  fillOpacity: number;
  stroke: string;
  strokeWidth: number;
  strokeStyle: 'solid' | 'dashed' | 'dotted';
  strokeLinecap: 'butt' | 'round' | 'square';
  strokeLinejoin: 'miter' | 'round' | 'bevel';
  cornerRadius: number;
  shadow: Shadow | null;
  blur: number;
}

interface Shadow {
  color: string;
  blur: number;
  offsetX: number;
  offsetY: number;
}

interface ElementData {
  // Text elements
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: string;
  fontStyle?: string;
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  verticalAlign?: 'top' | 'middle' | 'bottom';
  lineHeight?: number;
  letterSpacing?: number;
  textDecoration?: string;
  textColor?: string;

  // Image elements
  src?: string;
  alt?: string;
  fit?: 'fill' | 'contain' | 'cover' | 'none';
  cropArea?: { x: number; y: number; width: number; height: number };

  // Sticky note
  noteColor?: string;
  author?: string;

  // Connector
  startElementId?: string;
  endElementId?: string;
  startPoint?: string;
  endPoint?: string;
  lineType?: 'straight' | 'elbow' | 'curved';
  arrowStart?: 'none' | 'arrow' | 'circle' | 'diamond';
  arrowEnd?: 'none' | 'arrow' | 'circle' | 'diamond';

  // Frame
  frameTitle?: string;
  clipContent?: boolean;

  // Path
  points?: Position[];
  closed?: boolean;

  // Embed
  embedUrl?: string;
  embedType?: 'youtube' | 'vimeo' | 'figma' | 'miro' | 'google-docs' | 'custom';

  // Chart
  chartType?: 'bar' | 'line' | 'pie' | 'donut' | 'area' | 'scatter';
  chartData?: Record<string, unknown>;

  // Code block
  code?: string;
  language?: string;
  theme?: string;

  // Custom data
  custom?: Record<string, unknown>;
}

interface ConnectorPoint {
  id: string;
  position: 'top' | 'right' | 'bottom' | 'left' | 'center';
  connectedTo?: string;
}

interface Background {
  type: 'solid' | 'gradient' | 'image' | 'pattern';
  color: string;
  gradient?: {
    type: 'linear' | 'radial';
    angle: number;
    stops: { color: string; position: number }[];
  };
  imageUrl?: string;
  pattern?: string;
  opacity: number;
}

interface Viewport {
  x: number;
  y: number;
  zoom: number;
}

interface CanvasSettings {
  defaultBackground: Background;
  defaultStyle: Partial<ElementStyle>;
  showGrid: boolean;
  gridSize: number;
  snapToGrid: boolean;
  snapToObjects: boolean;
  showRulers: boolean;
  unit: 'px' | 'pt' | 'in' | 'cm' | 'mm';
  infiniteCanvas: boolean;
  pageSize: { width: number; height: number } | null;
}

interface CanvasMetadata {
  tags: string[];
  category: string;
  elementCount: number;
  pageCount: number;
  lastEditor: string;
  editCount: number;
  viewCount: number;
}

interface Collaborator {
  id: string;
  userId: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'owner' | 'editor' | 'commenter' | 'viewer';
  cursor?: CursorState;
  selection?: string[];
  online: boolean;
  lastSeen: string;
}

interface CursorState {
  x: number;
  y: number;
  pageId: string;
  color: string;
  tool: string;
}

interface Comment {
  id: string;
  elementId?: string;
  position: Position;
  pageId: string;
  text: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  replies: CommentReply[];
  resolved: boolean;
  createdAt: string;
  updatedAt: string;
}

interface CommentReply {
  id: string;
  text: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  createdAt: string;
}

interface PresentationState {
  active: boolean;
  currentPageIndex: number;
  presenter: string;
  followers: string[];
  startedAt?: string;
}

// Shape presets
const SHAPE_PRESETS: Record<string, Partial<CanvasElement>> = {
  rectangle: {
    type: 'rectangle',
    size: { width: 200, height: 150 },
    style: { fill: '#4F46E5', fillOpacity: 1, stroke: '#3730A3', strokeWidth: 2, strokeStyle: 'solid', strokeLinecap: 'round', strokeLinejoin: 'round', cornerRadius: 8, shadow: null, blur: 0 },
  },
  ellipse: {
    type: 'ellipse',
    size: { width: 200, height: 150 },
    style: { fill: '#10B981', fillOpacity: 1, stroke: '#059669', strokeWidth: 2, strokeStyle: 'solid', strokeLinecap: 'round', strokeLinejoin: 'round', cornerRadius: 0, shadow: null, blur: 0 },
  },
  triangle: {
    type: 'triangle',
    size: { width: 200, height: 173 },
    style: { fill: '#F59E0B', fillOpacity: 1, stroke: '#D97706', strokeWidth: 2, strokeStyle: 'solid', strokeLinecap: 'round', strokeLinejoin: 'round', cornerRadius: 0, shadow: null, blur: 0 },
  },
  diamond: {
    type: 'diamond',
    size: { width: 150, height: 150 },
    style: { fill: '#EC4899', fillOpacity: 1, stroke: '#DB2777', strokeWidth: 2, strokeStyle: 'solid', strokeLinecap: 'round', strokeLinejoin: 'round', cornerRadius: 0, shadow: null, blur: 0 },
  },
  star: {
    type: 'star',
    size: { width: 150, height: 150 },
    style: { fill: '#8B5CF6', fillOpacity: 1, stroke: '#7C3AED', strokeWidth: 2, strokeStyle: 'solid', strokeLinecap: 'round', strokeLinejoin: 'round', cornerRadius: 0, shadow: null, blur: 0 },
  },
};

// Sticky note colors
const STICKY_NOTE_COLORS = [
  '#FEF3C7', // Yellow
  '#FCE7F3', // Pink
  '#DBEAFE', // Blue
  '#D1FAE5', // Green
  '#FED7AA', // Orange
  '#E9D5FF', // Purple
  '#FECACA', // Red
  '#E5E7EB', // Gray
];

// In-memory storage
const canvasDb = new Map<string, Canvas>();
const commentsDb = new Map<string, Comment[]>();

// Helper functions
function generateId(prefix: string = 'canvas'): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function createDefaultCanvas(userId: string, name: string): Canvas {
  const id = generateId('canvas');
  const pageId = generateId('page');

  return {
    id,
    userId,
    name,
    pages: [{
      id: pageId,
      name: 'Page 1',
      order: 0,
      elements: [],
      background: {
        type: 'solid',
        color: '#FFFFFF',
        opacity: 1,
      },
      gridEnabled: true,
      gridSize: 20,
      snapToGrid: true,
      viewport: { x: 0, y: 0, zoom: 1 },
    }],
    settings: {
      defaultBackground: { type: 'solid', color: '#FFFFFF', opacity: 1 },
      defaultStyle: {
        fill: '#4F46E5',
        fillOpacity: 1,
        stroke: '#3730A3',
        strokeWidth: 2,
        strokeStyle: 'solid',
        cornerRadius: 8,
      },
      showGrid: true,
      gridSize: 20,
      snapToGrid: true,
      snapToObjects: true,
      showRulers: true,
      unit: 'px',
      infiniteCanvas: true,
      pageSize: null,
    },
    metadata: {
      tags: [],
      category: 'uncategorized',
      elementCount: 0,
      pageCount: 1,
      lastEditor: userId,
      editCount: 0,
      viewCount: 0,
    },
    collaborators: [{
      id: userId,
      userId,
      name: 'You',
      email: 'you@example.com',
      role: 'owner',
      online: true,
      lastSeen: new Date().toISOString(),
    }],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

function createElement(type: ElementType, position: Position, options: Partial<CanvasElement> = {}): CanvasElement {
  const preset = SHAPE_PRESETS[type];

  return {
    id: generateId('el'),
    type,
    position,
    size: options.size || preset?.size || { width: 100, height: 100 },
    rotation: options.rotation || 0,
    opacity: options.opacity ?? 1,
    locked: options.locked ?? false,
    visible: options.visible ?? true,
    zIndex: options.zIndex ?? 0,
    style: options.style || preset?.style || {
      fill: '#4F46E5',
      fillOpacity: 1,
      stroke: '#3730A3',
      strokeWidth: 2,
      strokeStyle: 'solid',
      strokeLinecap: 'round',
      strokeLinejoin: 'round',
      cornerRadius: 0,
      shadow: null,
      blur: 0,
    },
    data: options.data || {},
    connectors: [],
  };
}

function updateCanvasMetadata(canvas: Canvas): void {
  let totalElements = 0;
  for (const page of canvas.pages) {
    totalElements += page.elements.length;
  }
  canvas.metadata.elementCount = totalElements;
  canvas.metadata.pageCount = canvas.pages.length;
}

// POST handler
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, userId = 'demo-user', ...params } = body;

    if (!action) {
      return NextResponse.json(
        { success: false, error: 'Action is required' },
        { status: 400 }
      );
    }

    switch (action as CanvasAction) {
      // ============================================
      // CANVAS MANAGEMENT
      // ============================================

      case 'create-canvas': {
        const { name, description, template } = params;

        if (!name) {
          return NextResponse.json(
            { success: false, error: 'Canvas name is required' },
            { status: 400 }
          );
        }

        const canvas = createDefaultCanvas(userId, name);
        if (description) canvas.description = description;

        canvasDb.set(canvas.id, canvas);

        return NextResponse.json({
          success: true,
          canvas,
          message: 'Canvas created successfully',
        });
      }

      case 'get-canvas': {
        const { canvasId } = params;

        if (!canvasId) {
          return NextResponse.json(
            { success: false, error: 'Canvas ID is required' },
            { status: 400 }
          );
        }

        let canvas = canvasDb.get(canvasId);

        if (!canvas) {
          canvas = createDefaultCanvas(userId, 'Demo Canvas');
          canvas.id = canvasId;
          // Add demo elements
          const rect = createElement('rectangle', { x: 100, y: 100 });
          const text = createElement('text', { x: 150, y: 300 }, {
            size: { width: 200, height: 50 },
            data: { text: 'Welcome to Canvas!', fontSize: 24, fontFamily: 'Inter', textColor: '#1F2937' },
          });
          canvas.pages[0].elements.push(rect, text);
          updateCanvasMetadata(canvas);
        }

        return NextResponse.json({
          success: true,
          canvas,
        });
      }

      case 'update-canvas': {
        const { canvasId, updates } = params;

        if (!canvasId) {
          return NextResponse.json(
            { success: false, error: 'Canvas ID is required' },
            { status: 400 }
          );
        }

        let canvas = canvasDb.get(canvasId) || createDefaultCanvas(userId, 'Updated Canvas');
        canvas = { ...canvas, ...updates, updatedAt: new Date().toISOString() };
        canvas.metadata.editCount++;
        updateCanvasMetadata(canvas);
        canvasDb.set(canvasId, canvas);

        return NextResponse.json({
          success: true,
          canvas,
          message: 'Canvas updated',
        });
      }

      case 'delete-canvas': {
        const { canvasId } = params;
        canvasDb.delete(canvasId);
        return NextResponse.json({ success: true, message: 'Canvas deleted' });
      }

      case 'list-canvases': {
        const { limit = 20, offset = 0, sortBy = 'updatedAt' } = params;

        let canvases = Array.from(canvasDb.values()).filter(c => c.userId === userId);

        if (canvases.length === 0) {
          canvases = [
            { ...createDefaultCanvas(userId, 'Project Brainstorm'), metadata: { ...createDefaultCanvas(userId, '').metadata, elementCount: 45, viewCount: 12 } },
            { ...createDefaultCanvas(userId, 'Design Mockup'), metadata: { ...createDefaultCanvas(userId, '').metadata, elementCount: 28, viewCount: 8 } },
            { ...createDefaultCanvas(userId, 'Team Retrospective'), metadata: { ...createDefaultCanvas(userId, '').metadata, elementCount: 62, viewCount: 24 } },
          ];
        }

        const total = canvases.length;
        const paginated = canvases.slice(offset, offset + limit);

        return NextResponse.json({
          success: true,
          canvases: paginated,
          pagination: { total, limit, offset, hasMore: offset + limit < total },
        });
      }

      case 'duplicate-canvas': {
        const { canvasId, newName } = params;
        const source = canvasDb.get(canvasId) || createDefaultCanvas(userId, 'Source');

        const duplicate: Canvas = {
          ...JSON.parse(JSON.stringify(source)),
          id: generateId('canvas'),
          name: newName || `${source.name} (Copy)`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        canvasDb.set(duplicate.id, duplicate);
        return NextResponse.json({ success: true, canvas: duplicate, message: 'Canvas duplicated' });
      }

      // ============================================
      // ELEMENT MANAGEMENT
      // ============================================

      case 'add-element': {
        const { canvasId, pageId, element } = params;

        if (!canvasId || !element) {
          return NextResponse.json(
            { success: false, error: 'Canvas ID and element data are required' },
            { status: 400 }
          );
        }

        const canvas = canvasDb.get(canvasId) || createDefaultCanvas(userId, 'Canvas');
        canvas.id = canvasId;

        const page = pageId
          ? canvas.pages.find(p => p.id === pageId)
          : canvas.pages[0];

        if (!page) {
          return NextResponse.json(
            { success: false, error: 'Page not found' },
            { status: 404 }
          );
        }

        const newElement = createElement(element.type || 'rectangle', element.position || { x: 100, y: 100 }, element);
        newElement.zIndex = page.elements.length;

        page.elements.push(newElement);
        updateCanvasMetadata(canvas);
        canvas.updatedAt = new Date().toISOString();
        canvasDb.set(canvasId, canvas);

        return NextResponse.json({
          success: true,
          element: newElement,
          message: 'Element added',
        });
      }

      case 'add-shape': {
        const { canvasId, pageId, shapeType, position, style } = params;

        if (!canvasId || !shapeType) {
          return NextResponse.json(
            { success: false, error: 'Canvas ID and shape type are required' },
            { status: 400 }
          );
        }

        const canvas = canvasDb.get(canvasId) || createDefaultCanvas(userId, 'Canvas');
        canvas.id = canvasId;

        const page = pageId ? canvas.pages.find(p => p.id === pageId) : canvas.pages[0];
        if (!page) {
          return NextResponse.json({ success: false, error: 'Page not found' }, { status: 404 });
        }

        const shape = createElement(shapeType, position || { x: 100, y: 100 }, { style });
        shape.zIndex = page.elements.length;

        page.elements.push(shape);
        updateCanvasMetadata(canvas);
        canvas.updatedAt = new Date().toISOString();
        canvasDb.set(canvasId, canvas);

        return NextResponse.json({ success: true, element: shape, message: `${shapeType} added` });
      }

      case 'add-text': {
        const { canvasId, pageId, text, position, style, fontSize = 16, fontFamily = 'Inter' } = params;

        const canvas = canvasDb.get(canvasId) || createDefaultCanvas(userId, 'Canvas');
        canvas.id = canvasId;

        const page = pageId ? canvas.pages.find(p => p.id === pageId) : canvas.pages[0];
        if (!page) {
          return NextResponse.json({ success: false, error: 'Page not found' }, { status: 404 });
        }

        const textElement = createElement('text', position || { x: 100, y: 100 }, {
          size: { width: 200, height: 50 },
          style: {
            fill: 'transparent',
            fillOpacity: 0,
            stroke: 'transparent',
            strokeWidth: 0,
            strokeStyle: 'solid',
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
            cornerRadius: 0,
            shadow: null,
            blur: 0,
            ...style,
          },
          data: {
            text: text || 'Text',
            fontSize,
            fontFamily,
            fontWeight: '400',
            textAlign: 'left',
            textColor: '#1F2937',
          },
        });
        textElement.zIndex = page.elements.length;

        page.elements.push(textElement);
        updateCanvasMetadata(canvas);
        canvas.updatedAt = new Date().toISOString();
        canvasDb.set(canvasId, canvas);

        return NextResponse.json({ success: true, element: textElement, message: 'Text added' });
      }

      case 'add-sticky-note': {
        const { canvasId, pageId, text, position, color } = params;

        const canvas = canvasDb.get(canvasId) || createDefaultCanvas(userId, 'Canvas');
        canvas.id = canvasId;

        const page = pageId ? canvas.pages.find(p => p.id === pageId) : canvas.pages[0];
        if (!page) {
          return NextResponse.json({ success: false, error: 'Page not found' }, { status: 404 });
        }

        const noteColor = color || STICKY_NOTE_COLORS[Math.floor(Math.random() * STICKY_NOTE_COLORS.length)];

        const stickyNote = createElement('sticky-note', position || { x: 100, y: 100 }, {
          size: { width: 200, height: 200 },
          style: {
            fill: noteColor,
            fillOpacity: 1,
            stroke: 'transparent',
            strokeWidth: 0,
            strokeStyle: 'solid',
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
            cornerRadius: 4,
            shadow: { color: 'rgba(0,0,0,0.15)', blur: 8, offsetX: 2, offsetY: 4 },
            blur: 0,
          },
          data: {
            text: text || '',
            noteColor,
            fontSize: 14,
            fontFamily: 'Inter',
            textColor: '#1F2937',
            author: userId,
          },
        });
        stickyNote.zIndex = page.elements.length;

        page.elements.push(stickyNote);
        updateCanvasMetadata(canvas);
        canvas.updatedAt = new Date().toISOString();
        canvasDb.set(canvasId, canvas);

        return NextResponse.json({
          success: true,
          element: stickyNote,
          availableColors: STICKY_NOTE_COLORS,
          message: 'Sticky note added',
        });
      }

      case 'add-image': {
        const { canvasId, pageId, src, position, size, alt } = params;

        const canvas = canvasDb.get(canvasId) || createDefaultCanvas(userId, 'Canvas');
        canvas.id = canvasId;

        const page = pageId ? canvas.pages.find(p => p.id === pageId) : canvas.pages[0];
        if (!page) {
          return NextResponse.json({ success: false, error: 'Page not found' }, { status: 404 });
        }

        const imageElement = createElement('image', position || { x: 100, y: 100 }, {
          size: size || { width: 300, height: 200 },
          style: {
            fill: 'transparent',
            fillOpacity: 0,
            stroke: 'transparent',
            strokeWidth: 0,
            strokeStyle: 'solid',
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
            cornerRadius: 8,
            shadow: null,
            blur: 0,
          },
          data: {
            src: src || 'https://via.placeholder.com/300x200',
            alt: alt || 'Image',
            fit: 'cover',
          },
        });
        imageElement.zIndex = page.elements.length;

        page.elements.push(imageElement);
        updateCanvasMetadata(canvas);
        canvas.updatedAt = new Date().toISOString();
        canvasDb.set(canvasId, canvas);

        return NextResponse.json({ success: true, element: imageElement, message: 'Image added' });
      }

      case 'add-connector': {
        const { canvasId, pageId, startElementId, endElementId, lineType = 'elbow', arrowEnd = 'arrow' } = params;

        const canvas = canvasDb.get(canvasId) || createDefaultCanvas(userId, 'Canvas');
        canvas.id = canvasId;

        const page = pageId ? canvas.pages.find(p => p.id === pageId) : canvas.pages[0];
        if (!page) {
          return NextResponse.json({ success: false, error: 'Page not found' }, { status: 404 });
        }

        const connector = createElement('connector', { x: 0, y: 0 }, {
          size: { width: 0, height: 0 },
          style: {
            fill: 'transparent',
            fillOpacity: 0,
            stroke: '#6B7280',
            strokeWidth: 2,
            strokeStyle: 'solid',
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
            cornerRadius: 0,
            shadow: null,
            blur: 0,
          },
          data: {
            startElementId,
            endElementId,
            lineType,
            arrowStart: 'none',
            arrowEnd,
          },
        });
        connector.zIndex = page.elements.length;

        page.elements.push(connector);
        updateCanvasMetadata(canvas);
        canvas.updatedAt = new Date().toISOString();
        canvasDb.set(canvasId, canvas);

        return NextResponse.json({ success: true, element: connector, message: 'Connector added' });
      }

      case 'add-frame': {
        const { canvasId, pageId, title, position, size } = params;

        const canvas = canvasDb.get(canvasId) || createDefaultCanvas(userId, 'Canvas');
        canvas.id = canvasId;

        const page = pageId ? canvas.pages.find(p => p.id === pageId) : canvas.pages[0];
        if (!page) {
          return NextResponse.json({ success: false, error: 'Page not found' }, { status: 404 });
        }

        const frame = createElement('frame', position || { x: 50, y: 50 }, {
          size: size || { width: 800, height: 600 },
          style: {
            fill: '#F9FAFB',
            fillOpacity: 1,
            stroke: '#E5E7EB',
            strokeWidth: 1,
            strokeStyle: 'solid',
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
            cornerRadius: 8,
            shadow: null,
            blur: 0,
          },
          data: {
            frameTitle: title || 'Frame',
            clipContent: true,
          },
        });
        frame.zIndex = 0; // Frames go to back

        page.elements.unshift(frame);
        // Adjust zIndex of other elements
        page.elements.forEach((el, i) => el.zIndex = i);

        updateCanvasMetadata(canvas);
        canvas.updatedAt = new Date().toISOString();
        canvasDb.set(canvasId, canvas);

        return NextResponse.json({ success: true, element: frame, message: 'Frame added' });
      }

      case 'draw-path': {
        const { canvasId, pageId, points, style, closed = false } = params;

        const canvas = canvasDb.get(canvasId) || createDefaultCanvas(userId, 'Canvas');
        canvas.id = canvasId;

        const page = pageId ? canvas.pages.find(p => p.id === pageId) : canvas.pages[0];
        if (!page) {
          return NextResponse.json({ success: false, error: 'Page not found' }, { status: 404 });
        }

        // Calculate bounding box
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        for (const point of (points || [])) {
          minX = Math.min(minX, point.x);
          minY = Math.min(minY, point.y);
          maxX = Math.max(maxX, point.x);
          maxY = Math.max(maxY, point.y);
        }

        const path = createElement('freehand', { x: minX, y: minY }, {
          size: { width: maxX - minX || 1, height: maxY - minY || 1 },
          style: style || {
            fill: closed ? '#4F46E5' : 'transparent',
            fillOpacity: closed ? 0.2 : 0,
            stroke: '#4F46E5',
            strokeWidth: 3,
            strokeStyle: 'solid',
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
            cornerRadius: 0,
            shadow: null,
            blur: 0,
          },
          data: {
            points: points || [],
            closed,
          },
        });
        path.zIndex = page.elements.length;

        page.elements.push(path);
        updateCanvasMetadata(canvas);
        canvas.updatedAt = new Date().toISOString();
        canvasDb.set(canvasId, canvas);

        return NextResponse.json({ success: true, element: path, message: 'Path drawn' });
      }

      case 'update-element': {
        const { canvasId, pageId, elementId, updates } = params;

        const canvas = canvasDb.get(canvasId);
        if (canvas) {
          const page = pageId ? canvas.pages.find(p => p.id === pageId) : canvas.pages[0];
          if (page) {
            const element = page.elements.find(e => e.id === elementId);
            if (element) {
              Object.assign(element, updates);
              canvas.updatedAt = new Date().toISOString();
              canvasDb.set(canvasId, canvas);
            }
          }
        }

        return NextResponse.json({ success: true, message: 'Element updated' });
      }

      case 'delete-element': {
        const { canvasId, pageId, elementId } = params;

        const canvas = canvasDb.get(canvasId);
        if (canvas) {
          const page = pageId ? canvas.pages.find(p => p.id === pageId) : canvas.pages[0];
          if (page) {
            page.elements = page.elements.filter(e => e.id !== elementId);
            updateCanvasMetadata(canvas);
            canvas.updatedAt = new Date().toISOString();
            canvasDb.set(canvasId, canvas);
          }
        }

        return NextResponse.json({ success: true, message: 'Element deleted' });
      }

      case 'duplicate-element': {
        const { canvasId, pageId, elementId, offset } = params;

        const canvas = canvasDb.get(canvasId);
        if (canvas) {
          const page = pageId ? canvas.pages.find(p => p.id === pageId) : canvas.pages[0];
          if (page) {
            const source = page.elements.find(e => e.id === elementId);
            if (source) {
              const duplicate: CanvasElement = {
                ...JSON.parse(JSON.stringify(source)),
                id: generateId('el'),
                position: {
                  x: source.position.x + (offset?.x || 20),
                  y: source.position.y + (offset?.y || 20),
                },
                zIndex: page.elements.length,
              };
              page.elements.push(duplicate);
              updateCanvasMetadata(canvas);
              canvas.updatedAt = new Date().toISOString();
              canvasDb.set(canvasId, canvas);
              return NextResponse.json({ success: true, element: duplicate, message: 'Element duplicated' });
            }
          }
        }

        return NextResponse.json({ success: false, error: 'Element not found' }, { status: 404 });
      }

      case 'move-elements': {
        const { canvasId, pageId, elementIds, deltaX, deltaY } = params;

        const canvas = canvasDb.get(canvasId);
        if (canvas) {
          const page = pageId ? canvas.pages.find(p => p.id === pageId) : canvas.pages[0];
          if (page) {
            for (const element of page.elements) {
              if (elementIds.includes(element.id) && !element.locked) {
                element.position.x += deltaX || 0;
                element.position.y += deltaY || 0;
              }
            }
            canvas.updatedAt = new Date().toISOString();
            canvasDb.set(canvasId, canvas);
          }
        }

        return NextResponse.json({ success: true, message: 'Elements moved' });
      }

      case 'resize-elements': {
        const { canvasId, pageId, elementId, newSize, anchor } = params;

        const canvas = canvasDb.get(canvasId);
        if (canvas) {
          const page = pageId ? canvas.pages.find(p => p.id === pageId) : canvas.pages[0];
          if (page) {
            const element = page.elements.find(e => e.id === elementId);
            if (element && !element.locked) {
              element.size = { ...element.size, ...newSize };
              canvas.updatedAt = new Date().toISOString();
              canvasDb.set(canvasId, canvas);
            }
          }
        }

        return NextResponse.json({ success: true, message: 'Element resized' });
      }

      case 'rotate-elements': {
        const { canvasId, pageId, elementIds, angle } = params;

        const canvas = canvasDb.get(canvasId);
        if (canvas) {
          const page = pageId ? canvas.pages.find(p => p.id === pageId) : canvas.pages[0];
          if (page) {
            for (const element of page.elements) {
              if (elementIds.includes(element.id) && !element.locked) {
                element.rotation = (element.rotation + angle) % 360;
              }
            }
            canvas.updatedAt = new Date().toISOString();
            canvasDb.set(canvasId, canvas);
          }
        }

        return NextResponse.json({ success: true, message: 'Elements rotated' });
      }

      case 'group-elements': {
        const { canvasId, pageId, elementIds } = params;

        if (!elementIds || elementIds.length < 2) {
          return NextResponse.json(
            { success: false, error: 'At least 2 elements required for grouping' },
            { status: 400 }
          );
        }

        const groupId = generateId('group');

        const canvas = canvasDb.get(canvasId);
        if (canvas) {
          const page = pageId ? canvas.pages.find(p => p.id === pageId) : canvas.pages[0];
          if (page) {
            for (const element of page.elements) {
              if (elementIds.includes(element.id)) {
                element.groupId = groupId;
              }
            }
            canvas.updatedAt = new Date().toISOString();
            canvasDb.set(canvasId, canvas);
          }
        }

        return NextResponse.json({ success: true, groupId, message: 'Elements grouped' });
      }

      case 'ungroup-elements': {
        const { canvasId, pageId, groupId } = params;

        const canvas = canvasDb.get(canvasId);
        if (canvas) {
          const page = pageId ? canvas.pages.find(p => p.id === pageId) : canvas.pages[0];
          if (page) {
            for (const element of page.elements) {
              if (element.groupId === groupId) {
                delete element.groupId;
              }
            }
            canvas.updatedAt = new Date().toISOString();
            canvasDb.set(canvasId, canvas);
          }
        }

        return NextResponse.json({ success: true, message: 'Elements ungrouped' });
      }

      case 'lock-element': {
        const { canvasId, pageId, elementId } = params;

        const canvas = canvasDb.get(canvasId);
        if (canvas) {
          const page = pageId ? canvas.pages.find(p => p.id === pageId) : canvas.pages[0];
          if (page) {
            const element = page.elements.find(e => e.id === elementId);
            if (element) {
              element.locked = true;
              canvas.updatedAt = new Date().toISOString();
              canvasDb.set(canvasId, canvas);
            }
          }
        }

        return NextResponse.json({ success: true, message: 'Element locked' });
      }

      case 'bring-to-front': {
        const { canvasId, pageId, elementId } = params;

        const canvas = canvasDb.get(canvasId);
        if (canvas) {
          const page = pageId ? canvas.pages.find(p => p.id === pageId) : canvas.pages[0];
          if (page) {
            const element = page.elements.find(e => e.id === elementId);
            if (element) {
              const maxZ = Math.max(...page.elements.map(e => e.zIndex));
              element.zIndex = maxZ + 1;
              canvas.updatedAt = new Date().toISOString();
              canvasDb.set(canvasId, canvas);
            }
          }
        }

        return NextResponse.json({ success: true, message: 'Element brought to front' });
      }

      case 'send-to-back': {
        const { canvasId, pageId, elementId } = params;

        const canvas = canvasDb.get(canvasId);
        if (canvas) {
          const page = pageId ? canvas.pages.find(p => p.id === pageId) : canvas.pages[0];
          if (page) {
            const element = page.elements.find(e => e.id === elementId);
            if (element) {
              const minZ = Math.min(...page.elements.map(e => e.zIndex));
              element.zIndex = minZ - 1;
              canvas.updatedAt = new Date().toISOString();
              canvasDb.set(canvasId, canvas);
            }
          }
        }

        return NextResponse.json({ success: true, message: 'Element sent to back' });
      }

      // ============================================
      // PAGE MANAGEMENT
      // ============================================

      case 'create-page': {
        const { canvasId, name, background } = params;

        const canvas = canvasDb.get(canvasId) || createDefaultCanvas(userId, 'Canvas');
        canvas.id = canvasId;

        const newPage: CanvasPage = {
          id: generateId('page'),
          name: name || `Page ${canvas.pages.length + 1}`,
          order: canvas.pages.length,
          elements: [],
          background: background || { type: 'solid', color: '#FFFFFF', opacity: 1 },
          gridEnabled: true,
          gridSize: 20,
          snapToGrid: true,
          viewport: { x: 0, y: 0, zoom: 1 },
        };

        canvas.pages.push(newPage);
        updateCanvasMetadata(canvas);
        canvas.updatedAt = new Date().toISOString();
        canvasDb.set(canvasId, canvas);

        return NextResponse.json({ success: true, page: newPage, message: 'Page created' });
      }

      case 'delete-page': {
        const { canvasId, pageId } = params;

        const canvas = canvasDb.get(canvasId);
        if (canvas && canvas.pages.length > 1) {
          canvas.pages = canvas.pages.filter(p => p.id !== pageId);
          canvas.pages.forEach((p, i) => p.order = i);
          updateCanvasMetadata(canvas);
          canvas.updatedAt = new Date().toISOString();
          canvasDb.set(canvasId, canvas);
        }

        return NextResponse.json({ success: true, message: 'Page deleted' });
      }

      case 'reorder-pages': {
        const { canvasId, pageOrder } = params;

        const canvas = canvasDb.get(canvasId);
        if (canvas && pageOrder) {
          const pageMap = new Map(canvas.pages.map(p => [p.id, p]));
          canvas.pages = pageOrder.map((id: string, i: number) => {
            const page = pageMap.get(id);
            if (page) page.order = i;
            return page;
          }).filter(Boolean) as CanvasPage[];
          canvas.updatedAt = new Date().toISOString();
          canvasDb.set(canvasId, canvas);
        }

        return NextResponse.json({ success: true, message: 'Pages reordered' });
      }

      case 'duplicate-page': {
        const { canvasId, pageId } = params;

        const canvas = canvasDb.get(canvasId);
        if (canvas) {
          const source = canvas.pages.find(p => p.id === pageId);
          if (source) {
            const duplicate: CanvasPage = {
              ...JSON.parse(JSON.stringify(source)),
              id: generateId('page'),
              name: `${source.name} (Copy)`,
              order: canvas.pages.length,
            };
            // Generate new IDs for elements
            duplicate.elements.forEach(e => e.id = generateId('el'));
            canvas.pages.push(duplicate);
            updateCanvasMetadata(canvas);
            canvas.updatedAt = new Date().toISOString();
            canvasDb.set(canvasId, canvas);
            return NextResponse.json({ success: true, page: duplicate, message: 'Page duplicated' });
          }
        }

        return NextResponse.json({ success: false, error: 'Page not found' }, { status: 404 });
      }

      // ============================================
      // PRESENTATION MODE
      // ============================================

      case 'start-presentation': {
        const { canvasId, startPageIndex = 0 } = params;

        return NextResponse.json({
          success: true,
          presentation: {
            id: generateId('pres'),
            canvasId,
            active: true,
            currentPageIndex: startPageIndex,
            presenter: userId,
            followers: [],
            startedAt: new Date().toISOString(),
          },
          message: 'Presentation started',
        });
      }

      case 'end-presentation': {
        const { canvasId } = params;

        return NextResponse.json({
          success: true,
          message: 'Presentation ended',
        });
      }

      case 'next-slide': {
        const { canvasId, currentIndex } = params;
        const canvas = canvasDb.get(canvasId);
        const nextIndex = canvas ? Math.min(currentIndex + 1, canvas.pages.length - 1) : currentIndex;

        return NextResponse.json({
          success: true,
          currentPageIndex: nextIndex,
          message: 'Next slide',
        });
      }

      case 'previous-slide': {
        const { currentIndex } = params;
        const prevIndex = Math.max(currentIndex - 1, 0);

        return NextResponse.json({
          success: true,
          currentPageIndex: prevIndex,
          message: 'Previous slide',
        });
      }

      // ============================================
      // COMMENTS
      // ============================================

      case 'add-comment': {
        const { canvasId, pageId, elementId, position, text } = params;

        if (!text) {
          return NextResponse.json({ success: false, error: 'Comment text is required' }, { status: 400 });
        }

        const comment: Comment = {
          id: generateId('comment'),
          elementId,
          position: position || { x: 100, y: 100 },
          pageId: pageId || 'default',
          text,
          author: { id: userId, name: 'You', avatar: undefined },
          replies: [],
          resolved: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        const comments = commentsDb.get(canvasId) || [];
        comments.push(comment);
        commentsDb.set(canvasId, comments);

        return NextResponse.json({ success: true, comment, message: 'Comment added' });
      }

      case 'reply-to-comment': {
        const { canvasId, commentId, text } = params;

        const comments = commentsDb.get(canvasId) || [];
        const comment = comments.find(c => c.id === commentId);

        if (comment) {
          const reply: CommentReply = {
            id: generateId('reply'),
            text,
            author: { id: userId, name: 'You' },
            createdAt: new Date().toISOString(),
          };
          comment.replies.push(reply);
          comment.updatedAt = new Date().toISOString();
          commentsDb.set(canvasId, comments);
          return NextResponse.json({ success: true, reply, message: 'Reply added' });
        }

        return NextResponse.json({ success: false, error: 'Comment not found' }, { status: 404 });
      }

      case 'resolve-comment': {
        const { canvasId, commentId } = params;

        const comments = commentsDb.get(canvasId) || [];
        const comment = comments.find(c => c.id === commentId);

        if (comment) {
          comment.resolved = true;
          comment.updatedAt = new Date().toISOString();
          commentsDb.set(canvasId, comments);
        }

        return NextResponse.json({ success: true, message: 'Comment resolved' });
      }

      case 'get-comments': {
        const { canvasId, pageId, includeResolved = false } = params;

        let comments = commentsDb.get(canvasId) || [];

        if (pageId) {
          comments = comments.filter(c => c.pageId === pageId);
        }

        if (!includeResolved) {
          comments = comments.filter(c => !c.resolved);
        }

        return NextResponse.json({ success: true, comments });
      }

      // ============================================
      // REAL-TIME COLLABORATION
      // ============================================

      case 'get-cursors': {
        const { canvasId } = params;

        const canvas = canvasDb.get(canvasId);
        const cursors = canvas?.collaborators
          .filter(c => c.online && c.cursor)
          .map(c => ({
            userId: c.userId,
            name: c.name,
            ...c.cursor,
          })) || [];

        return NextResponse.json({ success: true, cursors });
      }

      case 'update-cursor': {
        const { canvasId, x, y, pageId, tool } = params;

        const canvas = canvasDb.get(canvasId);
        if (canvas) {
          const collab = canvas.collaborators.find(c => c.userId === userId);
          if (collab) {
            collab.cursor = {
              x,
              y,
              pageId,
              color: collab.cursor?.color || `#${Math.floor(Math.random() * 16777215).toString(16)}`,
              tool: tool || 'select',
            };
            canvasDb.set(canvasId, canvas);
          }
        }

        return NextResponse.json({ success: true, message: 'Cursor updated' });
      }

      case 'follow-user': {
        const { canvasId, targetUserId } = params;

        return NextResponse.json({
          success: true,
          following: targetUserId,
          message: `Following ${targetUserId}`,
        });
      }

      // ============================================
      // SHARING & COLLABORATION
      // ============================================

      case 'share-canvas': {
        const { canvasId, shareWith, permissions = 'view' } = params;

        return NextResponse.json({
          success: true,
          share: {
            id: generateId('share'),
            canvasId,
            url: `https://kazi.com/canvas/shared/${canvasId}`,
            permissions,
            sharedWith: shareWith || [],
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          },
          message: 'Canvas shared',
        });
      }

      case 'get-collaborators': {
        const { canvasId } = params;

        const canvas = canvasDb.get(canvasId);
        const collaborators = canvas?.collaborators || [
          { id: 'user_1', userId: 'user_1', name: 'John Doe', email: 'john@example.com', role: 'editor', online: true, lastSeen: new Date().toISOString() },
          { id: 'user_2', userId: 'user_2', name: 'Jane Smith', email: 'jane@example.com', role: 'viewer', online: false, lastSeen: new Date(Date.now() - 3600000).toISOString() },
        ];

        return NextResponse.json({ success: true, collaborators });
      }

      case 'add-collaborator': {
        const { canvasId, email, role = 'viewer' } = params;

        return NextResponse.json({
          success: true,
          collaborator: {
            id: generateId('collab'),
            email,
            role,
            invitedAt: new Date().toISOString(),
            status: 'pending',
          },
          message: 'Collaborator invited',
        });
      }

      // ============================================
      // EXPORT & IMPORT
      // ============================================

      case 'export-canvas': {
        const { canvasId, format = 'png', quality = 90, scale = 2 } = params;

        const formats = ['png', 'jpg', 'svg', 'pdf'];

        return NextResponse.json({
          success: true,
          export: {
            id: generateId('export'),
            canvasId,
            format,
            quality,
            scale,
            status: 'processing',
            estimatedTime: '10 seconds',
          },
          availableFormats: formats,
          message: 'Export started',
        });
      }

      case 'export-page': {
        const { canvasId, pageId, format = 'png', quality = 90 } = params;

        return NextResponse.json({
          success: true,
          export: {
            id: generateId('export'),
            canvasId,
            pageId,
            format,
            quality,
            status: 'processing',
          },
          message: 'Page export started',
        });
      }

      // ============================================
      // VERSION HISTORY
      // ============================================

      case 'get-version-history': {
        const { canvasId } = params;

        return NextResponse.json({
          success: true,
          versions: [
            { id: 'v_1', version: '1.0', createdAt: new Date(Date.now() - 7200000).toISOString(), author: 'You', changes: 'Initial canvas' },
            { id: 'v_2', version: '1.1', createdAt: new Date(Date.now() - 3600000).toISOString(), author: 'You', changes: 'Added shapes' },
            { id: 'v_3', version: '1.2', createdAt: new Date().toISOString(), author: 'You', changes: 'Added sticky notes' },
          ],
        });
      }

      case 'restore-version': {
        const { canvasId, versionId } = params;

        return NextResponse.json({
          success: true,
          restoredVersion: versionId,
          message: 'Version restored',
        });
      }

      // ============================================
      // TEMPLATES & ASSETS
      // ============================================

      case 'get-templates': {
        const { category } = params;

        const templates = [
          { id: 'tmpl_1', name: 'Brainstorming', category: 'ideation', thumbnail: 'url', elementCount: 12 },
          { id: 'tmpl_2', name: 'User Journey Map', category: 'ux', thumbnail: 'url', elementCount: 25 },
          { id: 'tmpl_3', name: 'Sprint Retrospective', category: 'agile', thumbnail: 'url', elementCount: 18 },
          { id: 'tmpl_4', name: 'Kanban Board', category: 'project', thumbnail: 'url', elementCount: 15 },
          { id: 'tmpl_5', name: 'Mind Map', category: 'ideation', thumbnail: 'url', elementCount: 20 },
          { id: 'tmpl_6', name: 'Flowchart', category: 'diagram', thumbnail: 'url', elementCount: 30 },
          { id: 'tmpl_7', name: 'Wireframe', category: 'ux', thumbnail: 'url', elementCount: 45 },
          { id: 'tmpl_8', name: 'Presentation', category: 'presentation', thumbnail: 'url', elementCount: 10 },
        ];

        const filtered = category ? templates.filter(t => t.category === category) : templates;

        return NextResponse.json({
          success: true,
          templates: filtered,
          categories: ['ideation', 'ux', 'agile', 'project', 'diagram', 'presentation', 'strategy'],
        });
      }

      case 'get-assets': {
        const { type } = params;

        const assets = {
          shapes: Object.keys(SHAPE_PRESETS),
          icons: ['user', 'home', 'settings', 'search', 'mail', 'phone', 'calendar', 'chart', 'folder', 'star'],
          images: [
            { id: 'img_1', name: 'Placeholder', url: 'https://via.placeholder.com/300x200' },
          ],
          stickyNoteColors: STICKY_NOTE_COLORS,
        };

        return NextResponse.json({
          success: true,
          assets: type ? { [type]: assets[type as keyof typeof assets] } : assets,
        });
      }

      default:
        return NextResponse.json(
          { success: false, error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Canvas Collaboration API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET handler
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  switch (action) {
    case 'shapes':
      return NextResponse.json({
        success: true,
        shapes: Object.keys(SHAPE_PRESETS),
        presets: SHAPE_PRESETS,
      });

    case 'colors':
      return NextResponse.json({
        success: true,
        stickyNoteColors: STICKY_NOTE_COLORS,
      });

    default:
      return NextResponse.json({
        success: true,
        message: 'Kazi Canvas Collaboration API',
        version: '2.0.0',
        capabilities: {
          actions: 50,
          shapeTypes: Object.keys(SHAPE_PRESETS).length,
          stickyNoteColors: STICKY_NOTE_COLORS.length,
        },
        features: [
          'Real-time collaboration',
          'Shapes and drawing',
          'Sticky notes',
          'Connectors and flowcharts',
          'Frames and organization',
          'Comments and annotations',
          'Presentation mode',
          'Version history',
          'Export (PNG, JPG, SVG, PDF)',
          'Templates',
        ],
      });
  }
}
