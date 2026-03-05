import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://uecgqdhxraxgupadghjm.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVlY2dxZGh4cmF4Z3VwYWRnaGptIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgxMzkyNTIsImV4cCI6MjA4MzcxNTI1Mn0.4KlhXcVW_42l8WttZRO6C5hhC692R0OE8UKJZmu-2Cs';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);