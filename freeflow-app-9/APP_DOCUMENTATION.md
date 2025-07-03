# Freeflow App Documentation

## 1. Project Overview

Freeflow is a modern, AI-powered project management application designed to help freelancers and teams streamline their workflow, manage projects, and enhance productivity. It combines traditional project management tools with a suite of advanced AI features, transforming it into an intelligent assistant that helps with content creation, task management, and reporting.

Built with a modern tech stack including Next.js, Supabase, and OpenAI, Freeflow offers a seamless, real-time, and collaborative experience.

## 2. Getting Started

Follow these instructions to get the project running locally for development and testing.

### Prerequisites

- Node.js (v18 or later)
- npm or yarn
- A Supabase account (for database and authentication)
- An OpenAI API key

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone <your-repository-url>
    cd freeflow-app-9
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    Create a `.env.local` file in the root of the project by copying the example file:
    ```bash
    cp .env.example .env.local
    ```
    Now, fill in the required values in `.env.local`:
    - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL.
    - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key.
    - `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key.
    - `OPENAI_API_KEY`: Your OpenAI API key.

4.  **Set up the database:**
    - Log in to your Supabase account and navigate to the SQL Editor.
    - Open the `scripts/V2_super_migration_script.sql` file from this project.
    - Copy its entire content and run it in the Supabase SQL Editor. This will create all the necessary tables, functions, and indexes.

5.  **Run the development server:**
    ```bash
    npm run dev
    ```
    The application should now be running at `http://localhost:3000`.

## 3. Core Features

- **Project Management**: Create, update, and organize projects with details like status, priority, and deadlines.
- **Hierarchical Projects**: Structure projects with parent-child relationships for better organization.
- **Rich-Text Editor**: A Notion-style editor for project descriptions and notes.
- **Project Archiving**: A trash can system to archive and permanently delete projects.
- **Customizable Dashboards**: Personalize your workspace with cover images and icons.

## 4. Advanced AI Features

This application is supercharged with several AI features designed to boost productivity.

### AI-Powered Project Summaries
- **What it is**: Instantly generate a concise summary of any project's content.
- **How to use**: In a project view, click the "Summarize" button. The AI will read the project details and provide a summary in a modal.

### AI-Powered Action Item Detection
- **What it is**: The AI analyzes project content to identify and suggest actionable tasks.
- **How to use**: Click the "Find Action Items" button in a project. The AI will return a list of tasks, each assigned a priority level (High, Medium, Low) indicated by colored badges.

### Contextual Writing Assistant
- **What it is**: An in-editor assistant to help improve your writing on the fly.
- **How to use**: Select any text (more than 10 characters) within the project editor. A floating toolbar will appear with options to "Improve," "Make Professional," or "Summarize" the selected text.

### AI-Powered Roll-up Reporting
- **What it is**: Generate a comprehensive progress report for a parent project and all its sub-projects.
- **How to use**: In a parent project's view, click the "Roll-up Report" button. The AI will generate a structured report including an overall summary, key achievements, and potential risks.

### Semantic Project Search
- **What it is**: A powerful global search that understands the *meaning* behind your query, not just keywords.
- **How to use**: Use the search bar in the main dashboard header. You can search for project concepts (e.g., "marketing campaign for a new product launch") and the AI will find the most relevant projects.

## 5. Technology Stack

- **Framework**: Next.js (App Router)
- **Backend & Database**: Supabase (PostgreSQL, Auth, Storage)
- **AI Provider**: OpenAI (GPT-4-Turbo)
- **UI**: shadcn/ui, Tailwind CSS, Radix UI
- **Editor**: BlockNote
- **Icons**: lucide-react
- **Notifications**: Sonner
