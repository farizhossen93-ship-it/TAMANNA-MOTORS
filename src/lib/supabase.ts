import { createClient } from '@supabase/supabase-js';

export const SUPABASE_URL = 'https://ymvpphrryprluwjoivur.supabase.co';
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltdnBwaHJyeXBybHV3am9pdnVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTEzMDEyNTcsImV4cCI6MjEwNjg3NzI1N30.6c8uKTyv5jiO_Ru_kpUpDUfcrlsKulHt3KEqYLib8bY';
export const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltdnBwaHJyeXBybHV3am9pdnVyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MTMwMTI1NywiZXhwIjoyMTA2ODc3MjU3fQ.09nhKU7ryicuoamgwDSxVo6Gb0X5j2NfBttb27t0inM';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export const isSupabaseConfigured = () => {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
};

// Helper for testing connection to Supabase database
export async function testSupabaseConnection(): Promise<{ success: boolean; message: string; details?: any }> {
  try {
    if (!isSupabaseConfigured()) {
      return { success: false, message: 'Supabase credentials missing' };
    }

    // Ping simple RPC or standard table
    const { data, error } = await supabase.from('products').select('id').limit(1);
    
    if (error) {
      if (error.message && error.message.includes('relation "public.products" does not exist')) {
        return { 
          success: true, 
          message: 'Supabase প্রজেক্ট কানেক্টেড আছে! SQL Editor-এ একবার স্কিমা স্ক্রিপ্ট রান করলে ডেটাবেস প্রস্তুত হবে।',
          details: { code: 'TABLES_NOT_INITIALIZED' }
        };
      }
      return { success: false, message: error.message, details: error };
    }
    
    return { 
      success: true, 
      message: 'Supabase ক্লাউড ডেটাবেজ সফলভাবে সংযুক্ত ও সম্পূর্ণ সক্রিয় রয়েছে।',
      details: { connected: true, timestamp: new Date().toISOString() }
    };
  } catch (err: any) {
    return { success: false, message: err?.message || 'Supabase connection failed' };
  }
}
