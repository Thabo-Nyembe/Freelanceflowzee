# Freelanceflowzee

FreelanceFlowzee is a comprehensive platform designed to streamline the workflow for freelancers and their clients. It provides tools for project management, collaboration, and communication, all in one place.

## Getting Started

To get started with development, you'll need to have Node.js and npm installed.

1.  **Clone the repository:**
    git clone https://github.com/Thabo-Nyembe/Freelanceflowzee.git

2.  **Install dependencies:**
    npm install

3.  **Set up your environment variables:**
    cp .env.example .env

    You will need to fill in the required environment variables in the `.env` file.

4.  **Run the development server:**
    npm run dev

The application will be available at `http://localhost:3000`.

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