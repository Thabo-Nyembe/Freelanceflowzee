# 🚀 Freeflow - AI-Powered Project Management

[![Next.js](https://img.shields.io/badge/Next.js-14.x-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Backend-green?style=flat-square&logo=supabase)](https://supabase.com/)
[![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4-blueviolet?style=flat-square&logo=openai)](https://openai.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)

## ✨ Overview

Freeflow is a modern, AI-powered project management application designed to help freelancers and teams streamline their workflow. It combines traditional project management tools with a suite of advanced AI features, transforming it into an intelligent assistant that helps with content creation, task management, and reporting.

## 🎯 Key Features

- **Hierarchical Project Management**: Organize projects with parent-child relationships.
- **Rich-Text Editor**: A Notion-style editor for project descriptions and notes.
- **Project Archiving**: A trash can system to archive, restore, and permanently delete projects.
- **Customizable Dashboards**: Personalize your workspace with cover images and icons.
- **Dark Mode**: A sleek, user-friendly dark theme.
- **AI-Powered Summaries**: Instantly generate summaries of project content.
- **AI Action Item Detection**: Automatically identify and prioritize tasks from project notes.
- **Contextual Writing Assistant**: An in-editor AI to improve your writing on the fly.
- **AI Roll-up Reporting**: Generate comprehensive reports for nested projects.
- **Semantic Search**: A powerful global search that understands the meaning behind your query.

## 🏗️ Tech Stack

- **Framework**: Next.js (App Router)
- **Backend & Database**: Supabase (PostgreSQL, Auth, Storage)
- **AI Provider**: OpenAI (GPT-4-Turbo)
- **UI**: shadcn/ui, Tailwind CSS, Radix UI
- **Editor**: BlockNote
- **Icons**: lucide-react
- **Notifications**: Sonner

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or later)
- npm or yarn
- A Supabase account
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
    Create a `.env.local` file by copying the example:
    ```bash
    cp .env.example .env.local
    ```
    Fill in the required values in `.env.local`:
    - `NEXT_PUBLIC_SUPABASE_URL`
    - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
    - `SUPABASE_SERVICE_ROLE_KEY`
    - `OPENAI_API_KEY`

4.  **Set up the database:**
    - Log in to your Supabase account and navigate to the **SQL Editor**.
    - Open the `scripts/V2_super_migration_script.sql` file.
    - Copy its entire content and run it in the SQL Editor. This will set up all tables, functions, and AI capabilities.

5.  **Run the development server:**
    ```bash
    npm run dev
    ```
    The app will be available at `http://localhost:3000`.

## 🤖 AI Features in Detail

- **Project Summaries**: Click "Summarize" on any project page to get a concise AI-generated summary.
- **Action Item Detection**: Click "Find Action Items" to have the AI analyze your project content and suggest a prioritized task list.
- **Writing Assistant**: Select text in the editor to trigger a floating toolbar with AI actions like "Improve" and "Make Professional".
- **Roll-up Reporting**: On a parent project, click "Roll-up Report" to get a summary of the entire project hierarchy.
- **Semantic Search**: Use the global search bar to find projects based on concepts, not just keywords.

## 🤝 Contributing

Contributions are welcome! Please feel free to open an issue or submit a pull request.

## 📝 License

This project is licensed under the MIT License.