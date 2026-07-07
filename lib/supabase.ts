import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Client-side browser instance (singleton-safe)
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          calendly_access_token: string | null;
          calendly_refresh_token: string | null;
          calendly_token_expiry: string | null;
          calendly_user_uri: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          calendly_access_token?: string | null;
          calendly_refresh_token?: string | null;
          calendly_token_expiry?: string | null;
          calendly_user_uri?: string | null;
        };
        Update: {
          calendly_access_token?: string | null;
          calendly_refresh_token?: string | null;
          calendly_token_expiry?: string | null;
          calendly_user_uri?: string | null;
          updated_at?: string;
        };
      };
      installed_templates: {
        Row: {
          id: string;
          user_id: string;
          template_id: string;
          template_name: string;
          installed_at: string;
          event_count: number;
          status: "success" | "partial" | "failed";
        };
        Insert: {
          user_id: string;
          template_id: string;
          template_name: string;
          event_count: number;
          status: "success" | "partial" | "failed";
        };
      };
    };
  };
};
