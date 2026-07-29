import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://lewytkfykerbxgtnyljv.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxld3l0a2Z5a2VyYnhndG55bGp2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUzMzE3NTMsImV4cCI6MjEwMDkwNzc1M30.CEarN_1JkaKiE4TSfE7va9rzw6FTNNZVt9FRfzORqU8";

export const supabase = createClient(supabaseUrl, supabaseKey);