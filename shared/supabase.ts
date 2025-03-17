import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://iwlvzcrrevajwwefqami.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml3bHZ6Y3JyZXZhand3ZWZxYW1pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDExMDM0OTQsImV4cCI6MjA1NjY3OTQ5NH0.1PsxnmxHUOPIHOdxVO6I6Ejd2T7yto0JUsWjp5vwPoo';

const supabaseServiceKey = 'YOUR_SERVICE_ROLE_KEY'; // Get this from Supabase dashboard
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export const uploadVehicleImage = async (file: File, path: string) => {
  const { data, error } = await supabase.storage
    .from('jerentcars-storage')
    .upload(`vehicles/${new Date().getFullYear()}/${new Date().getMonth() + 1}/${path}`, file);

  if (error) throw error;
  return data;
};
