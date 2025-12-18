import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = 'https://hsipbqpsvduidpqyznav.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzaXBicXBzdmR1aWRwcXl6bmF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU2MTQ5NzEsImV4cCI6MjA4MTE5MDk3MX0.P6_q98nSMdKe0Lf_bndv_TaFM_D_eKnvWOjjxhTAnbI';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
