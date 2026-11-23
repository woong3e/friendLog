import { createClient } from '@supabase/supabase-js';
import type { Database } from '../../database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;
const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
  auth: {
    storage: localStorage,
    storageKey: 'friendlog-token',
    persistSession: true,
    autoRefreshToken: true,
  },
});

export default supabase;
