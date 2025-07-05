# Universal Feedback & Collaboration System

This document outlines the architecture and implementation of the universal feedback, commenting, and suggestion system in FreeFlow. The goal is to create a unified collaboration experience across all types of content, including video, audio, images, text, and code.

## 1. Vision & Core Features

The system is designed to support:
- **Pinpoint Commenting:** Users can leave comments tied to specific contexts (e.g., a video timestamp, a region of an image, a line of code, or a selection of text).
- **Suggestion Mode:** For text-based content, users can propose changes (insertions, deletions) directly on the document, which can then be accepted or rejected by the author.

## 2. Backend Architecture

The backend is built on Supabase and consists of two primary tables.

### `feedback` Table
Stores all contextual comments.
- **Key Columns:**
  - `target_type`: An `ENUM` specifying the type of content (`video`, `text`, etc.).
  - `target_id`: An identifier for the specific content block.
  - `comment`: The text of the comment.
  - `context_data`: A `JSONB` field for storing metadata like timestamps or text selections.

### `suggestions` Table
Stores all proposed text edits.
- **Key Columns:**
  - `target_id`: The text block the suggestion applies to.
  - `status`: An `ENUM` for the state (`pending`, `accepted`, `rejected`).
  - `suggestion_data`: A `JSONB` field detailing the change (e.g., `{ "type": "insertion", "text": "new words" }`).

**Migration File:** `supabase/migrations/V15_universal_feedback_system.sql`

## 3. Frontend Implementation

### TypeScript Types
- **Location:** `lib/types/collaboration.ts`
- **Details:** Provides static types for `Feedback`, `Suggestion`, and related enums, ensuring type safety between the frontend and the Supabase API.

### React Hook: `useCollaboration`
- **Location:** `hooks/collaboration/useCollaboration.ts`
- **Purpose:** A centralized hook for all interactions with the feedback and suggestions tables.
- **Functions:**
  - `fetchFeedback(documentId)`: Fetches all comments for a document.
  - `fetchSuggestions(documentId)`: Fetches all suggestions for a document.
  - `addFeedback(newFeedback)`: Creates a new comment.
  - `updateSuggestionStatus(suggestionId, status)`: Accepts or rejects a suggestion.

### UI Component: `FeedbackSidebar`
- **Location:** `components/collaboration/FeedbackSidebar.tsx`
- **Purpose:** A reusable sidebar component that displays lists of comments and suggestions.
- **Functionality:** It uses the `useCollaboration` hook to fetch data and renders it in a clear, user-friendly format, separating comments from suggestions.

### Test Page
- **Location:** `app/collaboration-test/page.tsx`
- **Purpose:** A simple page for rendering and visually testing the `FeedbackSidebar` component with a mock document ID.

## 4. Next Steps

The current implementation provides the foundational backend and data-fetching layers. The next phase of development will focus on:
1.  **Block Editor Integration:** Integrating a rich text editor (like Tiptap) that will serve as the canvas for text-based collaboration.
2.  **In-Context UI:** Building the UI for highlighting text to leave a comment.
3.  **Suggestion UI:** Implementing the visual feedback for "Suggestion Mode" (green/red highlights) and the pop-ups for accepting/rejecting changes.
4.  **Real-time Updates:** Integrating Supabase Realtime to push updates to all connected clients instantly. 