import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Product, Sale, Contact, Expense, Purchase, AuthUser, BusinessSettings, InvoiceSettings } from '../types';

export const SupabaseSync = {
  // Products Sync
  async fetchProducts(): Promise<Product[] | null> {
    if (!isSupabaseConfigured()) return null;
    try {
      const { data, error } = await supabase.from('products').select('*');
      if (error) {
        console.warn('Supabase fetchProducts warning:', error.message);
        return null;
      }
      if (!data) return null;
      return data.map((item: any) => ({
        id: item.id,
        name: item.name,
        sku: item.sku,
        category: item.category,
        businessLocation: item.business_location || 'Hazigonj Branch',
        unitPurchasePrice: Number(item.unit_purchase_price) || 0,
        sellingPrice: Number(item.selling_price) || 0,
        currentStock: Number(item.current_stock) || 0,
        alertQuantity: Number(item.alert_quantity) || 5,
        imageUrl: item.image_url || '',
        createdAt: item.created_at || ''
      }));
    } catch (e) {
      console.error('Supabase fetchProducts error:', e);
      return null;
    }
  },

  async upsertProduct(product: Product): Promise<boolean> {
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
        alert_quantity: product.alertQuantity || 5,
        image_url: product.imageUrl || '',
        created_at: product.createdAt || new Date().toISOString()
      }, { onConflict: 'id' });
      if (error) console.error('Supabase upsertProduct error:', error);
      return !error;
    } catch (e) {
      console.error('Supabase upsertProduct error:', e);
      return false;
    }
  },

  async deleteProduct(productId: string): Promise<boolean> {
    if (!isSupabaseConfigured()) return false;
    try {
      const { error } = await supabase.from('products').delete().eq('id', productId);
      return !error;
    } catch (e) {
      return false;
    }
  },

  async deleteAllProducts(): Promise<boolean> {
    if (!isSupabaseConfigured()) return false;
    try {
      const { error } = await supabase.from('products').delete().neq('id', '___non_existent___');
      return !error;
    } catch (e) {
      return false;
    }
  },

  // Sales Sync
  async fetchSales(): Promise<Sale[] | null> {
    if (!isSupabaseConfigured()) return null;
    try {
      const { data: salesData, error: salesErr } = await supabase.from('sales').select('*').order('created_at', { ascending: false });
      if (salesErr) return null;
      if (!salesData) return null;

      const { data: duePaymentsData } = await supabase.from('due_payments').select('*');

      return salesData.map((s: any) => {
        const history = (duePaymentsData || []).filter((dp: any) => dp.sale_id === s.id);
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
          date: s.sale_date,
          saleDate: s.sale_date,
          itemsCount: s.items_count || 1,
          subtotal: s.subtotal ? Number(s.subtotal) : undefined,
          taxAmount: s.tax_amount ? Number(s.tax_amount) : undefined,
          discountAmount: s.discount_amount ? Number(s.discount_amount) : undefined,
          amountTendered: s.amount_tendered ? Number(s.amount_tendered) : undefined,
          changeDue: s.change_due ? Number(s.change_due) : undefined,
          cashierName: s.cashier_name || undefined,
          dueNotes: s.due_notes || undefined,
          items: s.items_data ? JSON.parse(s.items_data) : [],
          duePayments: history.map((h: any) => ({
            id: h.id,
            paymentDate: h.payment_date,
            amountPaid: Number(h.amount_paid),
            paymentMethod: h.payment_method || 'Cash',
            remainingDue: Number(h.remaining_due),
            receivedBy: h.received_by || undefined,
            notes: h.notes || undefined
          }))
        };
      });
    } catch (e) {
      console.error('Supabase fetchSales error:', e);
      return null;
    }
  },

  async upsertSale(sale: Sale): Promise<boolean> {
    if (!isSupabaseConfigured()) return false;
    try {
      const { error } = await supabase.from('sales').upsert({
        id: sale.id,
        invoice_no: sale.invoiceNo,
        type: sale.type || 'pos',
        customer_name: sale.customerName,
        customer_phone: sale.customerPhone || null,
        business_location: sale.businessLocation || 'Hazigonj Branch',
        payment_status: sale.paymentStatus || 'Paid',
        payment_method: sale.paymentMethod || 'Cash',
        total_amount: sale.totalAmount,
        invoice_due: sale.invoiceDue || 0,
        sale_date: sale.saleDate || new Date().toISOString(),
        items_count: sale.itemsCount || (sale.items?.length || 1),
        subtotal: sale.subtotal ?? null,
        tax_amount: sale.taxAmount ?? null,
        discount_amount: sale.discountAmount ?? null,
        amount_tendered: sale.amountTendered ?? null,
        change_due: sale.changeDue ?? null,
        cashier_name: sale.cashierName || null,
        due_notes: sale.dueNotes || null,
        items_data: sale.items ? JSON.stringify(sale.items) : null
      }, { onConflict: 'id' });

      if (error) console.error('Supabase upsertSale error:', error);

      // Upsert due payment history
      if (Array.isArray(sale.duePayments) && sale.duePayments.length > 0) {
        for (const pay of sale.duePayments) {
          await supabase.from('due_payments').upsert({
            id: pay.id,
            sale_id: sale.id,
            invoice_no: sale.invoiceNo,
            payment_date: pay.paymentDate,
            amount_paid: pay.amountPaid,
            payment_method: pay.paymentMethod || 'Cash',
            remaining_due: pay.remainingDue || 0,
            received_by: pay.receivedBy || null,
            notes: pay.notes || null
          }, { onConflict: 'id' });
        }
      }

      return !error;
    } catch (e) {
      console.error('Supabase upsertSale error:', e);
      return false;
    }
  },

  async deleteSale(saleId: string): Promise<boolean> {
    if (!isSupabaseConfigured()) return false;
    try {
      const { error } = await supabase.from('sales').delete().eq('id', saleId);
      return !error;
    } catch (e) {
      return false;
    }
  },

  // Contacts Sync
  async fetchContacts(): Promise<Contact[] | null> {
    if (!isSupabaseConfigured()) return null;
    try {
      const { data, error } = await supabase.from('contacts').select('*');
      if (error) return null;
      if (!data) return null;
      return data.map((item: any) => ({
        id: item.id,
        type: item.type || 'customer',
        name: item.name,
        businessName: item.business_name || '',
        email: item.email || '',
        phone: item.phone || '',
        customerGroup: item.customer_group || '',
        creditLimit: item.credit_limit ? Number(item.credit_limit) : undefined,
        address: item.address || '',
        businessLocation: item.business_location || 'Hazigonj Branch',
        balance: Number(item.balance) || 0,
        totalPurchases: Number(item.total_purchases) || 0
      }));
    } catch (e) {
      return null;
    }
  },

  async upsertContact(contact: Contact): Promise<boolean> {
    if (!isSupabaseConfigured()) return false;
    try {
      const { error } = await supabase.from('contacts').upsert({
        id: contact.id,
        type: contact.type || 'customer',
        name: contact.name,
        business_name: contact.businessName || null,
        email: contact.email || null,
        phone: contact.phone || null,
        customer_group: contact.customerGroup || null,
        credit_limit: contact.creditLimit ?? null,
        address: contact.address || null,
        business_location: contact.businessLocation || 'Hazigonj Branch',
        balance: contact.balance || 0,
        total_purchases: contact.totalPurchases || 0
      }, { onConflict: 'id' });
      return !error;
    } catch (e) {
      return false;
    }
  },

  async deleteContact(contactId: string): Promise<boolean> {
    if (!isSupabaseConfigured()) return false;
    try {
      const { error } = await supabase.from('contacts').delete().eq('id', contactId);
      return !error;
    } catch (e) {
      return false;
    }
  },

  // Staff Users Sync
  async upsertUser(user: AuthUser): Promise<boolean> {
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
      return !error;
    } catch (e) {
      return false;
    }
  },

  // Settings Sync
  async saveSetting(key: string, value: any): Promise<boolean> {
    if (!isSupabaseConfigured()) return false;
    try {
      const strVal = typeof value === 'string' ? value : JSON.stringify(value);
      const { error } = await supabase.from('app_settings').upsert({
        key,
        value: strVal,
        updated_at: new Date().toISOString()
      }, { onConflict: 'key' });
      return !error;
    } catch (e) {
      return false;
    }
  }
};
