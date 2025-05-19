import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type ServiceProvider = {
  id: string;
  full_name: string;
  profession: string;
  experience_years: number;
  specialization: string | null;
  availability: string | null;
  age: number;
  phone: string;
  location: string;
  photo_url: string | null;
  created_at: string | null;
  updated_at: string | null;
};

export type SavedProvider = {
  id: string;
  user_id: string;
  provider_id: string;
  created_at: string;
};

export type AuthError = {
  message: string;
};