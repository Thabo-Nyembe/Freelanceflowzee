# AI Integration Documentation

This document outlines the AI-powered content analysis feature in the FreeFlow application.

## 1. Feature Overview

The AI integration automatically generates valuable metadata for videos by analyzing their transcripts. This includes:

- **Concise Summary**: A one-paragraph summary of the video's content.
- **Tags/Keywords**: A list of 5-10 relevant tags that categorize the video.

This feature helps users quickly understand the content of a video and improves the searchability of the video library.

## 2. Technical Implementation

The system is composed of three main parts: a database function, a Supabase Edge Function, and a frontend component.

### 2.1. Database

- **`ai_metadata` Column**: A `JSONB` column was added to the `videos` table to store the structured AI output.
- **`generate_ai_metadata` Function**: A PostgreSQL function that triggers the analysis by making a non-blocking call to our edge function.
- **Migration File**: `supabase/migrations/V14_ai_integration.sql`

### 2.2. Supabase Edge Function

- **Location**: `supabase/functions/generate-ai-metadata/index.ts`
- **Purpose**: This is the core of the AI logic.
  1.  It receives a `video_id`.
  2.  It securely fetches the video's transcript from the database.
  3.  It sends the transcript to the OpenAI API with a carefully crafted prompt.
  4.  It parses the JSON response from OpenAI.
  5.  It updates the `ai_metadata` column for the video in the database.
- **Environment**: This is a Deno-based function.

### 2.3. Frontend

- **`generateAiMetadataAction` Server Action**: A Next.js server action located at `lib/actions/ai.ts`. It provides a a secure way for the client to call the database trigger.
- **`AiInsights` Component**: A client component located at `components/video/ai-insights.tsx`.
  - It provides the UI for users to initiate the AI analysis.
  - It displays a loading state while the analysis is in progress.
  - It renders the summary and tags in a clean card format once the `ai_metadata` is populated.

## 3. Setup and Configuration

For the AI integration to function, you **must** configure the following secrets in your Supabase project (`Project Settings > Secrets`):

- `OPENAI_API_KEY`: Your secret API key from OpenAI.

You must also deploy the edge function to your Supabase project:
```bash
npx supabase functions deploy generate-ai-metadata
```

## 4. Usage Flow

1.  A user navigates to a video page.
2.  The `AiInsights` component checks if `ai_metadata` exists for the video.
3.  If it does not, it displays a "Generate Insights" button.
4.  The user clicks the button, which calls the `generateAiMetadataAction` server action.
5.  The server action calls the `generate_ai_metadata` PostgreSQL function.
6.  The database function makes an asynchronous HTTP request to the `generate-ai-metadata` edge function.
7.  The edge function performs the analysis and updates the database.
8.  The user will see the results on the next page refresh (or the data can be fetched and updated in real-time with further implementation). 