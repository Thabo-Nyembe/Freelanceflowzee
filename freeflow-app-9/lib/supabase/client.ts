"use client";

import { createBrowserClient } from '@supabase/ssr';
import type { Database as SupabaseDatabase } from '@/types/supabase';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useCallback } from 'react';
import { Database } from '../database.types';

export const createClient = () => {
  return createBrowserClient<SupabaseDatabase>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// Re-export for convenience
export { createClient as createBrowserSupabaseClient }

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          username: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          username?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          username?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      posts: {
        Row: {
          id: string
          user_id: string
          title: string
          content: string
          category: string
          media_urls: string[]
          likes_count: number
          comments_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          content: string
          category: string
          media_urls?: string[]
          likes_count?: number
          comments_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          content?: string
          category?: string
          media_urls?: string[]
          likes_count?: number
          comments_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      comments: {
        Row: {
          id: string
          post_id: string
          user_id: string
          content: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          post_id: string
          user_id: string
          content: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          post_id?: string
          user_id?: string
          content?: string
          created_at?: string
          updated_at?: string
        }
      }
      likes: {
        Row: {
          id: string
          post_id: string
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          post_id: string
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          post_id?: string
          user_id?: string
          created_at?: string
        }
      }
      ai_analysis: {
        Row: {
          id: string
          user_id: string
          file_type: string
          status: string
          result: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          file_type: string
          status: string
          result: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          file_type?: string
          status?: string
          result?: string
          created_at?: string
          updated_at?: string
        }
      }
      ai_generation: {
        Row: {
          id: string
          user_id: string
          type: string
          prompt: string
          settings: {
            creativity: number
            quality: string
            model: string
          }
          status: string
          result: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          prompt: string
          settings: {
            creativity: number
            quality: string
            model: string
          }
          status: string
          result: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: string
          prompt?: string
          settings?: {
            creativity: number
            quality: string
            model: string
          }
          status?: string
          result?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}

export function useSupabase() {
  return useCallback(() => {
    return createClientComponentClient<Database>();
  }, [])();
} 