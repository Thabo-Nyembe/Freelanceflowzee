# FreeFlow App: Complete Component Inventory

This document provides a comprehensive inventory of every component in the FreeFlow application, organized by category with detailed technical specifications.

## Table of Contents

- [Core UI Components](#core-ui-components)
- [Business Logic Components](#business-logic-components)
- [AI-Powered Components](#ai-powered-components)
- [Collaboration Components](#collaboration-components)
- [Video & Media Components](#video--media-components)
- [Financial Components](#financial-components)
- [Navigation & Layout](#navigation--layout)
- [Data Display Components](#data-display-components)
- [Form Components](#form-components)
- [Integration Components](#integration-components)

---

## Core UI Components

### `components/ui/`

#### Button Components

**`button.tsx`**
- **Purpose**: Primary interactive element across the application
- **Variants**: default, destructive, outline, secondary, ghost, link
- **Sizes**: default, sm, lg, icon
- **Props**: `variant`, `size`, `asChild`, `className`, `disabled`
- **Usage**: Universal button component with shadcn/ui styling
- **Dependencies**: `class-variance-authority`, `@radix-ui/react-slot`

#### Form Components

**`input.tsx`**
- **Purpose**: Standard text input field with validation support
- **Features**: Built-in validation states, accessibility compliance
- **Props**: Standard HTML input props + `className`
- **Usage**: All form inputs throughout the application

**`textarea.tsx`**
- **Purpose**: Multi-line text input with auto-resize capabilities
- **Features**: Automatic height adjustment, character counting
- **Props**: Standard HTML textarea props + styling

**`select.tsx`**
- **Purpose**: Dropdown selection with search capabilities
- **Features**: Keyboard navigation, search filtering, multi-select
- **Dependencies**: `@radix-ui/react-select`

**`checkbox.tsx`**
- **Purpose**: Boolean input with indeterminate state support
- **Features**: Tri-state support, accessibility compliant
- **Dependencies**: `@radix-ui/react-checkbox`

**`label.tsx`**
- **Purpose**: Accessible form labels with proper association
- **Features**: Automatic field association, styling consistency

#### Layout Components

**`card.tsx`**
- **Purpose**: Flexible container for content organization
- **Components**: Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter
- **Usage**: Primary layout component for feature sections
- **Styling**: Glass morphism effects, responsive design

**`sheet.tsx`**
- **Purpose**: Slide-out panel for mobile navigation and modals
- **Features**: Responsive behavior, gesture support
- **Dependencies**: `@radix-ui/react-dialog`

**`dialog.tsx`**
- **Purpose**: Modal dialogs with overlay and focus management
- **Components**: Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
- **Features**: Automatic focus trapping, ESC key handling
- **Dependencies**: `@radix-ui/react-dialog`

**`tabs.tsx`**
- **Purpose**: Tabbed interface with keyboard navigation
- **Components**: Tabs, TabsList, TabsTrigger, TabsContent
- **Features**: Keyboard navigation, ARIA compliance
- **Dependencies**: `@radix-ui/react-tabs`

#### Navigation Components

**`navigation-menu.tsx`**
- **Purpose**: Multi-level navigation with dropdown support
- **Features**: Hover states, keyboard navigation, responsive design
- **Dependencies**: `@radix-ui/react-navigation-menu`

**`breadcrumb.tsx`**
- **Purpose**: Hierarchical navigation trail
- **Features**: Dynamic path generation, click navigation
- **Usage**: Project and file navigation

#### Data Display Components

**`table.tsx`**
- **Purpose**: Sortable, filterable data tables
- **Components**: Table, TableHeader, TableBody, TableHead, TableRow, TableCell
- **Features**: Sorting, filtering, pagination, row selection
- **Usage**: Project lists, invoice tables, analytics data

**`badge.tsx`**
- **Purpose**: Status indicators and labels
- **Variants**: default, secondary, destructive, outline
- **Usage**: Project status, user roles, feature flags

**`progress.tsx`**
- **Purpose**: Progress bars and loading indicators
- **Features**: Animated progress, percentage display
- **Usage**: File uploads, project completion, loading states

**`avatar.tsx`**
- **Purpose**: User profile images with fallbacks
- **Features**: Automatic fallback generation, size variants
- **Dependencies**: `@radix-ui/react-avatar`

---

## Business Logic Components

### Dashboard Components

**`components/dashboard/dashboard-overview.tsx`**
- **Purpose**: Main dashboard landing page with KPIs
- **Features**: Real-time metrics, quick actions, activity feed
- **State**: Dashboard metrics, user data, notifications
- **API Calls**: `/api/dashboard/metrics`, `/api/user/activity`

**`components/dashboard/demo-enhanced-nav.tsx`**
- **Purpose**: Enhanced navigation with demo capabilities
- **Features**: Feature highlighting, guided tours, demo modes
- **Props**: `demoMode`, `highlightFeatures`, `onFeatureClick`

### Hub Components

**`components/hubs/projects-hub.tsx`**
- **Purpose**: Comprehensive project management interface
- **Features**: Project CRUD operations, status tracking, team management
- **State**: Project list, filters, selected project, modal states
- **Components Used**: Card, Table, Dialog, Badge, Progress
- **API Integration**: Supabase projects table

**`components/hubs/files-hub.tsx`**
- **Purpose**: File management and organization system
- **Features**: Upload, download, sharing, version control
- **State**: File tree, uploads, permissions, search filters
- **Storage**: Multi-cloud (Supabase + Wasabi S3)

**`components/hubs/community-hub.tsx`**
- **Purpose**: Social networking and collaboration platform
- **Features**: User profiles, messaging, skill sharing
- **Components**: Creator marketplace, social wall, messaging system

**`components/hubs/financial-hub.tsx`**
- **Purpose**: Financial management dashboard
- **Features**: Invoice management, escrow tracking, analytics
- **Integration**: Stripe payments, escrow system

### Client Management

**`components/client/client-dashboard.tsx`**
- **Purpose**: Client-facing project management interface
- **Features**: Project tracking, approval workflows, communication
- **State Management**: useReducer for complex client state
- **Props**: `clientId`, `projects`, `onProjectUpdate`

**`components/client-zone-gallery.tsx`**
- **Purpose**: Secure client file access and gallery system
- **Features**: Password protection, watermarks, analytics
- **Security**: JWT tokens, access controls, audit trails
- **State**: Gallery files, access permissions, view analytics

### Portfolio Management

**`components/portfolio/portfolio.tsx`**
- **Purpose**: Professional portfolio presentation
- **Features**: Skills showcase, project gallery, testimonials
- **State**: Portfolio data, editing modes, skill management
- **Integration**: User profiles, project data

**`components/portfolio/enhanced-gallery.tsx`**
- **Purpose**: Advanced gallery with professional features
- **Features**: Lightbox, filtering, categorization
- **Props**: `images`, `categories`, `viewMode`

---

## AI-Powered Components

### AI Studio

**`components/ai/ai-create-studio.tsx`**
- **Purpose**: Multi-model AI content generation interface
- **Features**: Model switching, prompt optimization, result caching
- **AI Providers**: OpenAI, Anthropic, Google AI, OpenRouter
- **State Management**: useReducer for complex AI workflow state
- **Props**: `onGenerate`, `defaultModel`, `projectContext`

**`components/ai/ai-assistant.tsx`**
- **Purpose**: Conversational AI interface for task assistance
- **Features**: Context-aware responses, task integration
- **State**: Conversation history, context data, user preferences
- **Integration**: Project data, user analytics

**`components/ai/simple-ai-chat.tsx`**
- **Purpose**: Simplified chat interface for AI interactions
- **Features**: Message history, typing indicators, quick actions
- **Props**: `messages`, `onSendMessage`, `isLoading`

### AI Design Tools

**`components/ai/ai-design-assistant.tsx`**
- **Purpose**: AI-powered design analysis and feedback
- **Features**: Color analysis, layout review, accessibility audit
- **Analysis Types**: Design, Color, Layout, Typography, Accessibility
- **Integration**: File upload, real-time analysis

**`components/ai/advanced-settings-tab.tsx`**
- **Purpose**: Advanced AI configuration and settings
- **Features**: Model parameters, fine-tuning, custom prompts
- **Props**: `settings`, `onSettingsChange`, `availableModels`

### Content Generation

**`components/ai/content-generator.tsx`**
- **Purpose**: Specialized content creation with AI
- **Features**: Template-based generation, industry-specific prompts
- **Content Types**: Blog posts, social media, marketing copy
- **State**: Templates, generated content, editing mode

---

## Collaboration Components

### Real-Time Collaboration

**`components/collaboration/real-time-collaboration.tsx`**
- **Purpose**: Multi-user collaborative editing environment
- **Features**: Live cursors, real-time commenting, user presence
- **Technology**: Supabase Realtime, WebSocket connections
- **State Management**: Complex reducer for collaboration state
- **Props**: `documentId`, `initialUsers`, `onCollaborationChange`

**`components/collaboration/ai-create.tsx`**
- **Purpose**: AI-assisted collaborative content creation
- **Features**: Shared AI workspace, collaborative prompting
- **State**: Shared session, AI results, user contributions
- **Integration**: Real-time sync, AI services

### Communication Tools

**`components/messaging/chat.tsx`**
- **Purpose**: Professional messaging system
- **Features**: Thread management, file sharing, search
- **Components**: Message list, composer, thread view
- **State**: Conversations, active thread, typing indicators

**`components/collaboration/enhanced-client-collaboration.tsx`**
- **Purpose**: Advanced client communication and feedback system
- **Features**: Structured feedback, approval workflows, file annotations
- **Props**: `projectId`, `clientId`, `collaborationMode`

### Feedback Systems

**`components/collaboration/universal-pinpoint-feedback-system.tsx`**
- **Purpose**: Multi-media commenting and feedback system
- **Features**: Pixel-perfect positioning, timestamp comments, voice notes
- **Supported Media**: Images, videos, PDFs, code files, audio
- **State**: Comments, annotations, user interactions

**`components/feedback/comment-dialog.tsx`**
- **Purpose**: Rich comment creation interface
- **Features**: Text, voice, emoji reactions, @mentions
- **Props**: `position`, `mediaType`, `onSubmit`, `initialContent`

---

## Video & Media Components

### Video Studio

**`components/video/video-studio/`**
- **Purpose**: Professional video editing suite
- **Features**: Timeline editing, effects, transitions
- **Components**: Timeline, preview, effects panel, export controls
- **Integration**: Mux for video processing

**`components/collaboration/ai-video-recording-system.tsx`**
- **Purpose**: Intelligent video capture with AI enhancement
- **Features**: Screen + webcam recording, real-time analysis
- **AI Features**: Auto-chapters, quality optimization, smart cuts
- **State**: Recording state, AI analysis, export options

### AI Video Enhancement

**`components/video/ai/video-ai-panel.tsx`**
- **Purpose**: AI-powered video analysis and enhancement
- **Features**: Transcription, chapter generation, tag suggestions
- **AI Services**: Speech-to-text, content analysis, optimization
- **Props**: `videoId`, `analysisType`, `onAnalysisComplete`

**`components/video/ai/transcription-viewer.tsx`**
- **Purpose**: Interactive video transcription display
- **Features**: Clickable timestamps, editing, search
- **Props**: `transcription`, `videoRef`, `onTranscriptionEdit`

**`components/video/ai/ai-insights-dashboard.tsx`**
- **Purpose**: Video performance and engagement analytics
- **Features**: View analytics, engagement metrics, optimization tips
- **Data Sources**: Video analytics, user interaction data

### Media Viewers

**`components/feedback/audio-viewer.tsx`**
- **Purpose**: Audio file playback with waveform visualization
- **Features**: Waveform display, timestamp markers, comments
- **Props**: `audioUrl`, `waveformData`, `comments`

**`components/feedback/code-viewer.tsx`**
- **Purpose**: Code display with syntax highlighting and comments
- **Features**: Line-by-line commenting, syntax highlighting
- **Props**: `code`, `language`, `comments`, `onCommentAdd`

---

## Financial Components

### Escrow System

**`components/escrow-system.tsx`**
- **Purpose**: Secure payment escrow management
- **Features**: Milestone tracking, fund releases, dispute resolution
- **Integration**: Stripe for payment processing
- **State**: Escrow transactions, milestone status, payment history
- **Props**: `projectId`, `totalAmount`, `milestones`

**`components/enhanced-invoices.tsx`**
- **Purpose**: Professional invoice creation and management
- **Features**: Multiple templates, tax calculation, payment tracking
- **Templates**: Professional layouts with customization
- **Integration**: Stripe, PDF generation, email delivery
- **State**: Invoice data, template selection, payment status

### Payment Processing

**`components/payment/payment-form.tsx`**
- **Purpose**: Secure payment processing interface
- **Features**: Stripe Elements integration, multiple payment methods
- **Security**: PCI compliance, tokenization, fraud protection
- **Props**: `amount`, `clientSecret`, `onPaymentSuccess`

**`components/enhanced/smart-download-button.tsx`**
- **Purpose**: Intelligent file download with payment integration
- **Features**: Access control, payment gates, analytics tracking
- **Props**: `fileId`, `accessLevel`, `requiresPayment`

---

## Navigation & Layout

### Navigation Systems

**`components/navigation/main-navigation.tsx`**
- **Purpose**: Primary application navigation
- **Features**: Responsive design, dropdown menus, active states
- **Props**: `currentPath`, `user`, `navigationItems`

**`components/navigation/sidebar.tsx`**
- **Purpose**: Dashboard sidebar navigation
- **Features**: Collapsible, badge notifications, tooltips
- **Items**: Dashboard sections with progress indicators
- **State**: Collapsed state, active section

**`components/site-header.tsx`**
- **Purpose**: Global application header
- **Features**: Brand logo, user menu, global search, notifications
- **Components**: UserButton, GlobalSearch, ThemeToggle
- **Props**: `user`, `showSearch`, `onMenuToggle`

### Layout Components

**`components/dashboard-nav.tsx`**
- **Purpose**: Dashboard-specific navigation
- **Features**: Context-aware navigation, progress tracking
- **Props**: `currentRoute`, `completionStatus`

**`components/unified-sidebar.tsx`**
- **Purpose**: Unified sidebar for all dashboard sections
- **Features**: Consistent navigation, grade indicators
- **State**: Active section, completion badges

---

## Data Display Components

### Analytics & Metrics

**`components/analytics/analytics-dashboard.tsx`**
- **Purpose**: Comprehensive analytics and metrics display
- **Features**: Real-time data, interactive charts, export capabilities
- **Charts**: Revenue, project completion, user engagement
- **Integration**: Custom analytics API, real-time updates

**`components/dashboard/demo-feature-showcase.tsx`**
- **Purpose**: Interactive feature demonstration
- **Features**: Live demos, metrics display, feature highlights
- **Props**: `features`, `demoMode`, `onFeatureSelect`

### Content Display

**`components/global-search.tsx`**
- **Purpose**: Application-wide search functionality
- **Features**: Instant results, keyboard shortcuts, command palette
- **Search Scope**: Projects, files, contacts, settings
- **Props**: `onClose`, `defaultQuery`, `searchScope`

**`components/team-collaboration-hub.tsx`**
- **Purpose**: Team management and collaboration overview
- **Features**: Team member profiles, project assignments, communication
- **State**: Team data, project assignments, collaboration metrics

---

## Form Components

### Specialized Forms

**`components/forms/project-creation-form.tsx`**
- **Purpose**: Comprehensive project creation interface
- **Features**: Multi-step wizard, validation, file attachments
- **Fields**: Title, description, budget, timeline, team members
- **Validation**: Real-time validation with error messaging

**`components/forms/booking-form.tsx`**
- **Purpose**: Appointment and meeting scheduling
- **Features**: Calendar integration, timezone handling, availability checking
- **Integration**: Calendar APIs, notification system

**`components/contact-form.tsx`**
- **Purpose**: Customer contact and inquiry form
- **Features**: Multi-channel contact options, automated routing
- **Props**: `contactMethods`, `onSubmit`, `autoResponse`

### File Management Forms

**`components/files/file-upload.tsx`**
- **Purpose**: File upload interface with progress tracking
- **Features**: Drag-and-drop, progress bars, validation
- **Support**: Multiple files, size limits, type restrictions
- **Props**: `acceptedTypes`, `maxSize`, `onUpload`

**`components/files/file-upload-dialog.tsx`**
- **Purpose**: Modal file upload interface
- **Features**: Batch uploads, metadata entry, folder selection
- **Props**: `isOpen`, `onClose`, `uploadDestination`

---

## Integration Components

### External Service Components

**`components/enhanced/enhanced-upload-button.tsx`**
- **Purpose**: Advanced file upload with cloud integration
- **Features**: Multi-cloud routing, optimization, progress tracking
- **Integration**: Supabase Storage, Wasabi S3
- **Props**: `destination`, `optimizationSettings`

**`components/storage/enterprise-dashboard.tsx`**
- **Purpose**: Enterprise storage management interface
- **Features**: Usage analytics, cost optimization, performance monitoring
- **Metrics**: Storage usage, bandwidth, cost analysis

### API Integration Components

**`components/enhanced/smart-download-button.tsx`**
- **Purpose**: Intelligent download management
- **Features**: Access control, analytics, monetization
- **Integration**: Payment processing, usage tracking
- **Props**: `fileId`, `accessRules`, `pricingTier`

**`components/providers/analytics-provider.tsx`**
- **Purpose**: Analytics data provider for the application
- **Features**: Real-time data fetching, caching, error handling
- **Props**: `children`, `analyticsConfig`

---

## Component Dependencies

### Core Dependencies

**UI Framework**
- React 18+ with hooks and concurrent features
- Next.js 14+ with App Router
- TypeScript for type safety
- Tailwind CSS for styling

**Component Libraries**
- Radix UI for accessible primitives
- shadcn/ui for styled components
- Lucide React for icons
- Framer Motion for animations

**State Management**
- React hooks (useState, useEffect, useReducer)
- Context API for global state
- Custom hooks for reusable logic

**External Services**
- Supabase for backend services
- Stripe for payment processing
- AI providers (OpenAI, Anthropic, Google AI)
- Mux for video processing

### Component Relationships

**High-Level Architecture**
```
Dashboard
├── Navigation Components
├── Hub Components
│   ├── Projects Hub
│   ├── Files Hub
│   ├── Community Hub
│   └── Financial Hub
├── AI Components
│   ├── AI Create Studio
│   ├── AI Assistant
│   └── AI Design Tools
├── Collaboration Components
│   ├── Real-time Collaboration
│   ├── Messaging System
│   └── Feedback System
└── Integration Components
    ├── Payment Processing
    ├── File Management
    └── Analytics
```

**Component Communication**
- Props for parent-child communication
- Context for cross-component state
- Events for user interactions
- APIs for data persistence

---

*This inventory represents the complete component structure of the FreeFlow application as of the current analysis. Components are regularly updated and new ones added as features evolve.* 