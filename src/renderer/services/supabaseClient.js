import { createClient } from '@supabase/supabase-js';

const supabaseUrl = window.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = window.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    'Supabase URL or Anon Key is missing. Please check your environment variables.',
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

console.log('Supabase client created:', !!supabase);
