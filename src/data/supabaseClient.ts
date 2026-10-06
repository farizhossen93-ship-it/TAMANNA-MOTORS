import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Product, Sale, Contact, Expense, Purchase } from '../types';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  autoSync: boolean;
  lastSyncedAt?: string;
}

const STORAGE_KEY_SUPABASE = 'tamanna_supabase_config';

export function loadSupabaseConfig(): SupabaseConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SUPABASE);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed to load Supabase config:', e);
  }

  return {
    url: (import.meta as any).env?.VITE_SUPABASE_URL || '',
    anonKey: (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '',
    autoSync: false
  };
}

export function saveSupabaseConfig(cfg: SupabaseConfig) {
  try {
    localStorage.setItem(STORAGE_KEY_SUPABASE, JSON.stringify(cfg));
  } catch (e) {
    console.error('Failed to save Supabase config:', e);
  }
}

let cachedClient: SupabaseClient | null = null;
let lastUrl = '';
let lastKey = '';

export function getSupabaseClient(): SupabaseClient | null {
  const config = loadSupabaseConfig();
  if (!config.url || !config.anonKey) {
    return null;
  }

  if (cachedClient && lastUrl === config.url && lastKey === config.anonKey) {
    return cachedClient;
  }

  try {
    cachedClient = createClient(config.url, config.anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true
      }
    });
    lastUrl = config.url;
    lastKey = config.anonKey;
    return cachedClient;
  } catch (err) {
    console.error('Error initializing Supabase client:', err);
    return null;
  }
}

export function isSupabaseConfigured(): boolean {
  const config = loadSupabaseConfig();
  return Boolean(config.url?.trim() && config.anonKey?.trim());
}

/**
 * Tests connection to the Supabase endpoint
 */
export async function testSupabaseConnection(): Promise<{ success: boolean; message: string }> {
  const client = getSupabaseClient();
  if (!client) {
    return {
      success: false,
      message: 'Supabase URL বা Anon Key সেট করা নেই।'
    };
  }

  try {
    // Try pinging or querying a lightweight table or auth session
    const { data, error } = await client.from('products').select('count', { count: 'exact', head: true });
    if (error && error.code !== 'PGRST116' && !error.message.includes('relation "products" does not exist')) {
      // If error is just missing table, credentials are still valid
      if (error.message.includes('JWT') || error.message.includes('API key') || error.message.includes('fetch')) {
        return {
          success: false,
          message: `সংযোগ ত্রুটি: ${error.message}`
        };
      }
    }
    return {
      success: true,
      message: 'সফলভাবে Supabase ক্লাউড ডেটাবেজে সংযোগ স্থাপন করা হয়েছে!'
    };
  } catch (err: any) {
    return {
      success: false,
      message: err?.message || 'Supabase সার্ভারে পৌঁছানো সম্ভব হয়নি।'
    };
  }
}

/**
 * Backup / Sync local dataset to Supabase cloud
 */
export async function syncLocalToSupabase(payload: {
  products: Product[];
  sales: Sale[];
  customers: Contact[];
  suppliers: Contact[];
  expenses: Expense[];
}): Promise<{ success: boolean; count: number; error?: string }> {
  const client = getSupabaseClient();
  if (!client) {
    return { success: false, count: 0, error: 'Supabase not configured' };
  }

  try {
    let synced = 0;

    // 1. Sync Products
    if (payload.products.length > 0) {
      const { error: prodErr } = await client
        .from('products')
        .upsert(payload.products.map(p => ({
          id: p.id,
          name: p.name,
          sku: p.sku,
          category: p.category,
          business_location: p.businessLocation,
          unit_purchase_price: p.unitPurchasePrice,
          selling_price: p.sellingPrice,
          current_stock: p.currentStock,
          image_url: p.imageUrl,
          updated_at: new Date().toISOString()
        })), { onConflict: 'id' });
      if (!prodErr) synced += payload.products.length;
    }

    // 2. Sync Sales
    if (payload.sales.length > 0) {
      const { error: saleErr } = await client
        .from('sales')
        .upsert(payload.sales.map(s => ({
          id: s.id,
          invoice_no: s.invoiceNo,
          customer_name: s.customerName,
          total_amount: s.totalAmount,
          payment_method: s.paymentMethod,
          payment_status: s.paymentStatus,
          sale_date: s.saleDate,
          business_location: s.businessLocation,
          updated_at: new Date().toISOString()
        })), { onConflict: 'id' });
      if (!saleErr) synced += payload.sales.length;
    }

    const cfg = loadSupabaseConfig();
    cfg.lastSyncedAt = new Date().toLocaleString();
    saveSupabaseConfig(cfg);

    return { success: true, count: synced };
  } catch (err: any) {
    return { success: false, count: 0, error: err?.message };
  }
}
