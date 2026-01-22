import "react-native-url-polyfill/auto";
import "react-native-get-random-values";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";


const supabaseUrl = "https://vsvlywnllgzgnvqjydrc.supabase.co"
// const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL as string
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZzdmx5d25sbGd6Z252cWp5ZHJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg4NDkxMzIsImV4cCI6MjA4NDQyNTEzMn0.OCup2sUBKTMp6Y5e4pxQjJ--jwKPIhP1z7nZgfWJz28"
// const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY as string

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase environment variables are missing')
}

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      storage: AsyncStorage,  
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false,
    },
  }
)
