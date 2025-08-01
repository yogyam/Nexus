// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://qvxcpqzofrchgwxhjhfv.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2eGNwcXpvZnJjaGd3eGhqaGZ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM4NTI2NDQsImV4cCI6MjA2OTQyODY0NH0.PYOIcfmlGtAoXeU3kUjYzNIaUlQTmVjK4te-vK-d4eE";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});