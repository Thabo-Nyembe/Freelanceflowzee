# FreeFlowZee

FreeFlowZee is a next-generation platform for creative collaboration, designed to streamline the feedback process for videos, images, audio files, and more.

## Getting Started

To get started with local development, follow these steps:

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/Thabo-Nyembe/Freelanceflowzee.git
    cd Freelanceflowzee
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    *   Copy the `.env.example` file to a new file named `.env.local`.
    *   Fill in the required API keys and secrets in your new `.env.local` file. See the "Environment Variable Management" section for more details.

4.  **Run the development server:**
    ```bash
    npm run dev
    ```

## Environment Variable Management

This project uses a `.env.local` file to manage all API keys and secrets. This file is **not** committed to Git and must be created locally.

A template file, `.env.example`, is provided in the root of the repository. It lists all the necessary environment variables required for the application to function correctly.

-   `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL.
-   `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous public key.
-   `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key for admin-level operations.
-   `OPENAI_API_KEY`: Your API key for OpenAI services.
-   ... and other keys as listed in `.env.example`.

## Core Integrations

### Supabase Integration

The application uses Supabase as its backend for database storage, authentication, and more.

-   **Client-side Client**: A utility function to create a Supabase client for use in browser environments is located at `lib/supabase/client.ts`.
-   **Server-side Client**: A utility function to create a Supabase client for use in server-side logic (API routes, Server Components) is located at `lib/supabase/server.ts`. This client uses the `SUPABASE_SERVICE_ROLE_KEY` for elevated privileges.

### AI Services

The application leverages AI services like OpenAI for various features.

-   **Title Generation**: An API endpoint at `app/api/generate-title/route.ts` uses the OpenAI API to generate a video title from a transcript. This is a `POST` endpoint that expects a `transcript` in the request body. 