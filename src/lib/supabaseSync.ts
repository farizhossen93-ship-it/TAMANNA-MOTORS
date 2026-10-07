import { supabase, isSupabaseConfigured } from './supabase';
import { Product, Contact, Sale, Purchase, Expense, AuthUser, BusinessSettings, InvoiceSettings } from '../types';

export interface SyncResult {
  success: boolean;
  message: string;
  counts?: {
    products?: number;
    contacts?: number;
    sales?: number;
    purchases?: number;
    expenses?: number;
    users?: number;
  };
  error?: any;
}

/**
 * Syncs a single product or batch of products to Supabase
 */
export async function syncProductToSupabase(product: Product): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  try {
    const { error } = await supabase.from('products').upsert({
      id: product.id,
      name: product.name,
      sku: product.sku,
      category: product.category,
      business_location: product.businessLocation || 'Hazigonj Branch',
      unit_purchase_price: product.unitPurchasePrice,
      selling_price: product.sellingPrice,
      current_stock: product.currentStock,
      alert_quantity: product.alertQuantity,
      image_url: product.imageUrl || null,
      created_at: product.createdAt || new Date().toISOString()
    }, { onConflict: 'id' });

    if (error) {
      console.warn('Sync product to Supabase failed:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('syncProductToSupabase error:', err);
    return false;
  }
}

export async function deleteProductFromSupabase(productId: string): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  try {
    const { error } = await supabase.from('products').delete().eq('id', productId);
    return !error;
  } catch (err) {
    console.error('deleteProductFromSupabase error:', err);
    return false;
  }
}

/**
 * Syncs a single contact (Customer or Supplier) to Supabase
 */
export async function syncContactToSupabase(contact: Contact): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  try {
    const { error } = await supabase.from('contacts').upsert({
      id: contact.id,
      type: contact.type,
      name: contact.name,
      business_name: contact.businessName || null,
      email: contact.email || null,
      phone: contact.phone || null,
      customer_group: contact.customerGroup || null,
      credit_limit: contact.creditLimit || null,
      address: contact.address || null,
      business_location: contact.businessLocation || 'Hazigonj Branch',
      balance: contact.balance || 0,
      total_purchases: contact.totalPurchases || 0
    }, { onConflict: 'id' });

    if (error) {
      console.warn('Sync contact to Supabase failed:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('syncContactToSupabase error:', err);
    return false;
  }
}

export async function deleteContactFromSupabase(contactId: string): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  try {
    const { error } = await supabase.from('contacts').delete().eq('id', contactId);
    return !error;
  } catch (err) {
    console.error('deleteContactFromSupabase error:', err);
    return false;
  }
}

/**
 * Syncs a Sale / Invoice to Supabase
 */
export async function syncSaleToSupabase(sale: Sale): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  try {
    const { error } = await supabase.from('sales').upsert({
      id: sale.id,
      invoice_no: sale.invoiceNo,
      type: sale.type || 'pos',
      customer_name: sale.customerName,
      customer_phone: sale.customerPhone || null,
      business_location: sale.businessLocation || 'Hazigonj Branch',
      payment_status: sale.paymentStatus,
      payment_method: sale.paymentMethod,
      total_amount: sale.totalAmount,
      invoice_due: sale.invoiceDue || 0,
      sale_date: sale.saleDate || new Date().toISOString(),
      items_count: sale.itemsCount || sale.items?.length || 1,
      subtotal: sale.subtotal || sale.totalAmount,
      tax_amount: sale.taxAmount || 0,
      discount_amount: sale.discountAmount || 0,
      amount_tendered: sale.amountTendered || sale.totalAmount,
      change_due: sale.changeDue || 0,
      cashier_name: sale.cashierName || 'Admin',
      due_notes: sale.dueNotes || null,
      items_data: JSON.stringify(sale.items || [])
    }, { onConflict: 'id' });

    if (error) {
      console.warn('Sync sale to Supabase failed:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('syncSaleToSupabase error:', err);
    return false;
  }
}

/**
 * Syncs an Auth User / Staff Member to Supabase users table
 */
export async function syncUserToSupabase(user: AuthUser): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  try {
    const { error } = await supabase.from('users').upsert({
      uid: user.id,
      email: user.email,
      name: user.name,
      username: user.username,
      role: user.role,
      phone: user.phone || null,
      business_location: user.businessLocation || 'Hazigonj Branch',
      status: user.status || 'Active',
      last_login: user.lastLogin || new Date().toISOString()
    }, { onConflict: 'uid' });

    if (error) {
      console.warn('Sync user to Supabase failed:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('syncUserToSupabase error:', err);
    return false;
  }
}

/**
 * Pull all data from Supabase
 */
export async function fetchAllFromSupabase(): Promise<{
  products: Product[];
  contacts: Contact[];
  sales: Sale[];
  users: AuthUser[];
} | null> {
  if (!isSupabaseConfigured()) return null;
  try {
    const [prodRes, contRes, saleRes, userRes] = await Promise.all([
      supabase.from('products').select('*'),
      supabase.from('contacts').select('*'),
      supabase.from('sales').select('*'),
      supabase.from('users').select('*')
    ]);

    const products: Product[] = (prodRes.data || []).map((p: any) => ({
      id: p.id,
      name: p.name,
      sku: p.sku,
      category: p.category,
      businessLocation: p.business_location || 'Hazigonj Branch',
      unitPurchasePrice: Number(p.unit_purchase_price) || 0,
      sellingPrice: Number(p.selling_price) || 0,
      currentStock: Number(p.current_stock) || 0,
      alertQuantity: Number(p.alert_quantity) || 5,
      imageUrl: p.image_url || undefined,
      createdAt: p.created_at
    }));

    const contacts: Contact[] = (contRes.data || []).map((c: any) => ({
      id: c.id,
      type: c.type,
      name: c.name,
      businessName: c.business_name || undefined,
      email: c.email || '',
      phone: c.phone || '',
      customerGroup: c.customer_group || undefined,
      creditLimit: c.credit_limit ? Number(c.credit_limit) : undefined,
      address: c.address || undefined,
      businessLocation: c.business_location || 'Hazigonj Branch',
      balance: Number(c.balance) || 0,
      totalPurchases: Number(c.total_purchases) || 0
    }));

    const sales: Sale[] = (saleRes.data || []).map((s: any) => {
      let items = [];
      try {
        items = s.items_data ? JSON.parse(s.items_data) : [];
      } catch {
        items = [];
      }
      return {
        id: s.id,
        invoiceNo: s.invoice_no,
        type: s.type || 'pos',
        customerName: s.customer_name,
        customerPhone: s.customer_phone || undefined,
        businessLocation: s.business_location || 'Hazigonj Branch',
        paymentStatus: s.payment_status || 'Paid',
        paymentMethod: s.payment_method || 'Cash',
        totalAmount: Number(s.total_amount) || 0,
        invoiceDue: Number(s.invoice_due) || 0,
        saleDate: s.sale_date || new Date().toISOString(),
        itemsCount: s.items_count || items.length || 1,
        items: items,
        subtotal: s.subtotal ? Number(s.subtotal) : Number(s.total_amount),
        taxAmount: s.tax_amount ? Number(s.tax_amount) : 0,
        discountAmount: s.discount_amount ? Number(s.discount_amount) : 0,
        amountTendered: s.amount_tendered ? Number(s.amount_tendered) : Number(s.total_amount),
        changeDue: s.change_due ? Number(s.change_due) : 0,
        cashierName: s.cashier_name || 'Admin',
        dueNotes: s.due_notes || undefined
      };
    });

    const users: AuthUser[] = (userRes.data || []).map((u: any) => ({
      id: u.uid || `usr-${u.id}`,
      name: u.name || u.username,
      username: u.username || u.email.split('@')[0],
      email: u.email,
      phone: u.phone || '',
      role: u.role || 'cashier',
      businessLocation: u.business_location || 'Hazigonj Branch',
      status: u.status || 'Active',
      lastLogin: u.last_login || undefined
    }));

    return { products, contacts, sales, users };
  } catch (err) {
    console.error('fetchAllFromSupabase error:', err);
    return null;
  }
}

/**
 * Upload all current app data to Supabase in one batch
 */
export async function pushAllToSupabase(
  products: Product[],
  contacts: Contact[],
  sales: Sale[],
  users: AuthUser[] = []
): Promise<SyncResult> {
  if (!isSupabaseConfigured()) {
    return { success: false, message: 'Supabase credentials are not configured.' };
  }

  try {
    let syncedProds = 0;
    let syncedConts = 0;
    let syncedSales = 0;
    let syncedUsers = 0;

    // Sync products
    if (products.length > 0) {
      const prodRows = products.map(p => ({
        id: p.id,
        name: p.name,
        sku: p.sku,
        category: p.category,
        business_location: p.businessLocation || 'Hazigonj Branch',
        unit_purchase_price: p.unitPurchasePrice,
        selling_price: p.sellingPrice,
        current_stock: p.currentStock,
        alert_quantity: p.alertQuantity,
        image_url: p.imageUrl || null,
        created_at: p.createdAt || new Date().toISOString()
      }));
      const { error: pErr } = await supabase.from('products').upsert(prodRows, { onConflict: 'id' });
      if (!pErr) syncedProds = products.length;
    }

    // Sync contacts
    if (contacts.length > 0) {
      const contRows = contacts.map(c => ({
        id: c.id,
        type: c.type,
        name: c.name,
        business_name: c.businessName || null,
        email: c.email || null,
        phone: c.phone || null,
        customer_group: c.customerGroup || null,
        credit_limit: c.creditLimit || null,
        address: c.address || null,
        business_location: c.businessLocation || 'Hazigonj Branch',
        balance: c.balance || 0,
        total_purchases: c.totalPurchases || 0
      }));
      const { error: cErr } = await supabase.from('contacts').upsert(contRows, { onConflict: 'id' });
      if (!cErr) syncedConts = contacts.length;
    }

    // Sync sales
    if (sales.length > 0) {
      const saleRows = sales.map(s => ({
        id: s.id,
        invoice_no: s.invoiceNo,
        type: s.type || 'pos',
        customer_name: s.customerName,
        customer_phone: s.customerPhone || null,
        business_location: s.businessLocation || 'Hazigonj Branch',
        payment_status: s.paymentStatus,
        payment_method: s.paymentMethod,
        total_amount: s.totalAmount,
        invoice_due: s.invoiceDue || 0,
        sale_date: s.saleDate || new Date().toISOString(),
        items_count: s.itemsCount || s.items?.length || 1,
        subtotal: s.subtotal || s.totalAmount,
        tax_amount: s.taxAmount || 0,
        discount_amount: s.discountAmount || 0,
        amount_tendered: s.amountTendered || s.totalAmount,
        change_due: s.changeDue || 0,
        cashier_name: s.cashierName || 'Admin',
        due_notes: s.dueNotes || null,
        items_data: JSON.stringify(s.items || [])
      }));
      const { error: sErr } = await supabase.from('sales').upsert(saleRows, { onConflict: 'id' });
      if (!sErr) syncedSales = sales.length;
    }

    // Sync users
    if (users.length > 0) {
      const userRows = users.map(u => ({
        uid: u.id,
        email: u.email,
        name: u.name,
        username: u.username,
        role: u.role,
        phone: u.phone || null,
        business_location: u.businessLocation || 'Hazigonj Branch',
        status: u.status || 'Active',
        last_login: u.lastLogin || new Date().toISOString()
      }));
      const { error: uErr } = await supabase.from('users').upsert(userRows, { onConflict: 'uid' });
      if (!uErr) syncedUsers = users.length;
    }

    return {
      success: true,
      message: 'সব ডেটা সফলভাবে Supabase ক্লাউড ডেটাবেজে আপলোড ও সিঙ্ক করা হয়েছে!',
      counts: {
        products: syncedProds,
        contacts: syncedConts,
        sales: syncedSales,
        users: syncedUsers
      }
    };
  } catch (err: any) {
    return {
      success: false,
      message: err?.message || 'Sync failed',
      error: err
    };
  }
}
