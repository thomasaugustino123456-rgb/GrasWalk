
import { createClient } from '@supabase/supabase-js';

// Connection details for project: esdgnswzwknfnwaknsyo
const supabaseUrl = 'https://esdgnswzwknfnwaknsyo.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVzZGduc3d6d2tuZm53YWtuc3lvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg4MjYyNjIsImV4cCI6MjA4NDQwMjI2Mn0.77zRMuxBH7UHiKtS9O8AVnKAw3RRRoWTOdQheS0l6NE';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
