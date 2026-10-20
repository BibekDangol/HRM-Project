import { Database } from '@/database.types';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';
import { secureStoreAdapter } from './secureStoreAdapter';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY =process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
if(!SUPABASE_URL || !SUPABASE_ANON_KEY){
  throw new Error('Missing supabase environment variable.')
}

//tells supabase to use expo store rather than localstoarage
export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY,{
  auth:{
    storage:secureStoreAdapter,
    autoRefreshToken:true,
    persistSession:true,
    detectSessionInUrl: Platform.OS === 'web', // required on web for OAuth/magic-link redirects; must stay false on native
  }
});
