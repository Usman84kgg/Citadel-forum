import { createClient } from "@supabase/supabase-js";

// Эти ключи открытые, их можно хранить в коде
const supabaseUrl = "https://lewytkfykerbxgtnyljv.supabase.co";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const supabase = createClient(supabaseUrl, supabaseKey || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxld3l0a2Z5a2VyYnhncm55bGp2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEzMjYwMDAsImV4cCI6MjA2NjkwMjAwMH0.placeholder");