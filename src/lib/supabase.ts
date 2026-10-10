import { createClient, SupabaseClient } from '@supabase/supabase-js';

export const DEFAULT_SUPABASE_URL = 'https://iffbunouoeobkiotiwhn.supabase.co';
export const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlmZmJ1bm91b2VvYmtpb3Rpd2huIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE1NTE3MDUsImV4cCI6MjEwNzEyNzcwNX0.dUtheGuX6FAVDvUy8VGAeRm8TrcJ4w2xK6BGau1DF7g';

export const getSupabaseUrl = (): string => {
  try {
    return localStorage.getItem('tamanna_custom_supabase_url') || DEFAULT_SUPABASE_URL;
  } catch {
    return DEFAULT_SUPABASE_URL;
  }
};

export const getSupabaseAnonKey = (): string => {
  try {
    return localStorage.getItem('tamanna_custom_supabase_anon_key') || DEFAULT_SUPABASE_ANON_KEY;
  } catch {
    return DEFAULT_SUPABASE_ANON_KEY;
  }
};

export const isCustomSupabaseSet = (): boolean => {
  try {
    return Boolean(localStorage.getItem('tamanna_custom_supabase_url'));
  } catch {
    return false;
  }
};

let activeSupabaseClient: SupabaseClient = createClient(getSupabaseUrl(), getSupabaseAnonKey(), {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export const supabase = activeSupabaseClient;

export const setCustomSupabaseConfig = (url: string, anonKey: string): boolean => {
  try {
    const cleanUrl = url.trim().replace(/\/$/, '');
    const cleanKey = anonKey.trim();
    if (!cleanUrl || !cleanKey) return false;
    
    localStorage.setItem('tamanna_custom_supabase_url', cleanUrl);
    localStorage.setItem('tamanna_custom_supabase_anon_key', cleanKey);
    
    activeSupabaseClient = createClient(cleanUrl, cleanKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
    // Update exported proxy reference
    Object.assign(supabase, activeSupabaseClient);
    return true;
  } catch (e) {
    console.error('Error saving custom Supabase config:', e);
    return false;
  }
};

export const resetCustomSupabaseConfig = (): void => {
  try {
    localStorage.removeItem('tamanna_custom_supabase_url');
    localStorage.removeItem('tamanna_custom_supabase_anon_key');
    activeSupabaseClient = createClient(DEFAULT_SUPABASE_URL, DEFAULT_SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
    Object.assign(supabase, activeSupabaseClient);
  } catch (e) {
    console.error('Error resetting Supabase config:', e);
  }
};

export const isSupabaseConfigured = (): boolean => {
  return Boolean(getSupabaseUrl() && getSupabaseAnonKey());
};

// Helper for testing connection to Supabase database
export async function testSupabaseConnection(): Promise<{ success: boolean; message: string; details?: any }> {
  try {
    if (!isSupabaseConfigured()) {
      return { success: false, message: 'Supabase URL বা Anon Key খালি রয়েছে।' };
    }

    // Ping users or products table
    const { error } = await supabase.from('users').select('id').limit(1);
    
    if (error) {
      if (error.message && (error.message.includes('does not exist') || error.message.includes('relation "public.users"'))) {
        return { 
          success: true, 
          message: 'Supabase প্রজেক্ট সংযুক্ত হয়েছে! তবে SQL Editor-এ একবার স্কিমা স্ক্রিপ্ট রান করা প্রয়োজন।',
          details: { code: 'TABLES_NOT_INITIALIZED' }
        };
      }
      return { success: false, message: `কানেকশন এরর: ${error.message}`, details: error };
    }
    
    return { 
      success: true, 
      message: 'Supabase ক্লাউড ডেটাবেজ সফলভাবে সংযুক্ত ও সম্পূর্ণ সক্রিয় রয়েছে!',
      details: { connected: true, timestamp: new Date().toISOString() }
    };
  } catch (err: any) {
    return { success: false, message: err?.message || 'Supabase connection failed' };
  }
}
