import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { db } from './src/db/index.ts';
import * as schema from './src/db/schema.ts';
import { eq, desc } from 'drizzle-orm';
import { getOrCreateUser } from './src/db/users.ts';
import { adminAuth } from './src/lib/firebase-admin.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

// Auth verification helper
async function verifyUser(req: express.Request) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  const token = authHeader.split('Bearer ')[1];
  try {
    return await adminAuth.verifyIdToken(token);
  } catch (err) {
    return null;
  }
}

// User Sync API
app.post('/api/auth/sync-user', async (req, res) => {
  try {
    const decoded = await verifyUser(req);
    const { email, name, uid } = req.body;
    const userUid = decoded?.uid || uid;
    const userEmail = decoded?.email || email;

    if (!userUid || !userEmail) {
      return res.status(400).json({ error: 'Missing UID or Email' });
    }

    const user = await getOrCreateUser(userUid, userEmail, name);
    res.json(user);
  } catch (error: any) {
    console.error('Error in /api/auth/sync-user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Products API
app.get('/api/products', async (req, res) => {
  try {
    const allProducts = await db.select().from(schema.products);
    res.json(allProducts);
  } catch (error: any) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

app.post('/api/products/sync', async (req, res) => {
  try {
    const { products: items } = req.body;
    if (!Array.isArray(items)) {
      return res.status(400).json({ error: 'Invalid payload' });
    }

    for (const item of items) {
      await db.insert(schema.products)
        .values({
          id: item.id,
          name: item.name,
          sku: item.sku,
          category: item.category,
          businessLocation: item.businessLocation || 'Hazigonj Branch',
          unitPurchasePrice: String(item.unitPurchasePrice || 0),
          sellingPrice: String(item.sellingPrice || 0),
          currentStock: item.currentStock || 0,
          alertQuantity: item.alertQuantity || 5,
          imageUrl: item.imageUrl || '',
          createdAt: item.createdAt || new Date().toISOString(),
        })
        .onConflictDoUpdate({
          target: schema.products.id,
          set: {
            name: item.name,
            sku: item.sku,
            category: item.category,
            businessLocation: item.businessLocation || 'Hazigonj Branch',
            unitPurchasePrice: String(item.unitPurchasePrice || 0),
            sellingPrice: String(item.sellingPrice || 0),
            currentStock: item.currentStock || 0,
            alertQuantity: item.alertQuantity || 5,
            imageUrl: item.imageUrl || '',
          }
        });
    }

    res.json({ success: true, count: items.length });
  } catch (error: any) {
    console.error('Error syncing products:', error);
    res.status(500).json({ error: 'Failed to sync products' });
  }
});

app.delete('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.delete(schema.products).where(eq(schema.products.id, id));
    res.json({ success: true, id });
  } catch (error: any) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

app.delete('/api/products', async (req, res) => {
  try {
    await db.delete(schema.products);
    res.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting all products:', error);
    res.status(500).json({ error: 'Failed to delete all products' });
  }
});

// Sales & Due Management API
app.get('/api/sales', async (req, res) => {
  try {
    const allSales = await db.select().from(schema.sales).orderBy(desc(schema.sales.createdAt));
    const allDuePayments = await db.select().from(schema.duePayments);

    // Attach due payments
    const salesWithHistory = allSales.map(sale => {
      const history = allDuePayments.filter(p => p.saleId === sale.id);
      return {
        ...sale,
        totalAmount: Number(sale.totalAmount || 0),
        invoiceDue: Number(sale.invoiceDue || 0),
        subtotal: sale.subtotal ? Number(sale.subtotal) : undefined,
        taxAmount: sale.taxAmount ? Number(sale.taxAmount) : undefined,
        discountAmount: sale.discountAmount ? Number(sale.discountAmount) : undefined,
        amountTendered: sale.amountTendered ? Number(sale.amountTendered) : undefined,
        changeDue: sale.changeDue ? Number(sale.changeDue) : undefined,
        items: sale.itemsData ? JSON.parse(sale.itemsData) : [],
        duePaymentHistory: history.map(h => ({
          id: h.id,
          paymentDate: h.paymentDate,
          amountPaid: Number(h.amountPaid),
          paymentMethod: h.paymentMethod || 'Cash',
          remainingDue: Number(h.remainingDue),
          receivedBy: h.receivedBy || undefined,
          notes: h.notes || undefined,
        })),
      };
    });

    res.json(salesWithHistory);
  } catch (error: any) {
    console.error('Error fetching sales:', error);
    res.status(500).json({ error: 'Failed to fetch sales' });
  }
});

app.post('/api/sales', async (req, res) => {
  try {
    const sale = req.body;
    if (!sale || !sale.id || !sale.invoiceNo) {
      return res.status(400).json({ error: 'Invalid sale record' });
    }

    await db.insert(schema.sales)
      .values({
        id: sale.id,
        invoiceNo: sale.invoiceNo,
        type: sale.type || 'pos',
        customerName: sale.customerName,
        customerPhone: sale.customerPhone || null,
        businessLocation: sale.businessLocation || 'Hazigonj Branch',
        paymentStatus: sale.paymentStatus || 'Paid',
        paymentMethod: sale.paymentMethod || 'Cash',
        totalAmount: String(sale.totalAmount || 0),
        invoiceDue: String(sale.invoiceDue || 0),
        saleDate: sale.saleDate || new Date().toISOString(),
        itemsCount: sale.itemsCount || (sale.items?.length || 1),
        subtotal: sale.subtotal !== undefined ? String(sale.subtotal) : null,
        taxAmount: sale.taxAmount !== undefined ? String(sale.taxAmount) : null,
        discountAmount: sale.discountAmount !== undefined ? String(sale.discountAmount) : null,
        amountTendered: sale.amountTendered !== undefined ? String(sale.amountTendered) : null,
        changeDue: sale.changeDue !== undefined ? String(sale.changeDue) : null,
        cashierName: sale.cashierName || null,
        dueNotes: sale.dueNotes || null,
        itemsData: sale.items ? JSON.stringify(sale.items) : null,
      })
      .onConflictDoUpdate({
        target: schema.sales.id,
        set: {
          paymentStatus: sale.paymentStatus || 'Paid',
          invoiceDue: String(sale.invoiceDue || 0),
          dueNotes: sale.dueNotes || null,
        }
      });

    // Handle due payment history
    if (Array.isArray(sale.duePaymentHistory) && sale.duePaymentHistory.length > 0) {
      for (const pay of sale.duePaymentHistory) {
        await db.insert(schema.duePayments)
          .values({
            id: pay.id || `dp-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            saleId: sale.id,
            invoiceNo: sale.invoiceNo,
            paymentDate: pay.paymentDate,
            amountPaid: String(pay.amountPaid || 0),
            paymentMethod: pay.paymentMethod || 'Cash',
            remainingDue: String(pay.remainingDue || 0),
            receivedBy: pay.receivedBy || null,
            notes: pay.notes || null,
          })
          .onConflictDoNothing();
      }
    }

    res.json({ success: true, id: sale.id });
  } catch (error: any) {
    console.error('Error saving sale:', error);
    res.status(500).json({ error: 'Failed to save sale' });
  }
});

// Contacts API
app.get('/api/contacts', async (req, res) => {
  try {
    const allContacts = await db.select().from(schema.contacts);
    res.json(allContacts);
  } catch (error: any) {
    console.error('Error fetching contacts:', error);
    res.status(500).json({ error: 'Failed to fetch contacts' });
  }
});

app.post('/api/contacts/sync', async (req, res) => {
  try {
    const { contacts: items } = req.body;
    if (!Array.isArray(items)) {
      return res.status(400).json({ error: 'Invalid payload' });
    }

    for (const c of items) {
      await db.insert(schema.contacts)
        .values({
          id: c.id,
          type: c.type || 'customer',
          name: c.name,
          businessName: c.businessName || null,
          email: c.email || null,
          phone: c.phone || null,
          customerGroup: c.customerGroup || null,
          creditLimit: c.creditLimit ? String(c.creditLimit) : null,
          address: c.address || null,
          businessLocation: c.businessLocation || 'Hazigonj Branch',
          balance: String(c.balance || 0),
          totalPurchases: String(c.totalPurchases || 0),
        })
        .onConflictDoUpdate({
          target: schema.contacts.id,
          set: {
            name: c.name,
            businessName: c.businessName || null,
            phone: c.phone || null,
            email: c.email || null,
            balance: String(c.balance || 0),
            totalPurchases: String(c.totalPurchases || 0),
            businessLocation: c.businessLocation || 'Hazigonj Branch',
          }
        });
    }

    res.json({ success: true, count: items.length });
  } catch (error: any) {
    console.error('Error syncing contacts:', error);
    res.status(500).json({ error: 'Failed to sync contacts' });
  }
});

// Contact Single Create/Update/Delete
app.post('/api/contacts', async (req, res) => {
  try {
    const c = req.body;
    if (!c || !c.id || !c.name) {
      return res.status(400).json({ error: 'Invalid contact' });
    }
    await db.insert(schema.contacts)
      .values({
        id: c.id,
        type: c.type || 'customer',
        name: c.name,
        businessName: c.businessName || null,
        email: c.email || null,
        phone: c.phone || null,
        customerGroup: c.customerGroup || null,
        creditLimit: c.creditLimit ? String(c.creditLimit) : null,
        address: c.address || null,
        businessLocation: c.businessLocation || 'Hazigonj Branch',
        balance: String(c.balance || 0),
        totalPurchases: String(c.totalPurchases || 0),
      })
      .onConflictDoUpdate({
        target: schema.contacts.id,
        set: {
          name: c.name,
          businessName: c.businessName || null,
          phone: c.phone || null,
          email: c.email || null,
          balance: String(c.balance || 0),
          totalPurchases: String(c.totalPurchases || 0),
          businessLocation: c.businessLocation || 'Hazigonj Branch',
        }
      });
    res.json({ success: true, id: c.id });
  } catch (error: any) {
    console.error('Error saving contact:', error);
    res.status(500).json({ error: 'Failed to save contact' });
  }
});

app.delete('/api/contacts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.delete(schema.contacts).where(eq(schema.contacts.id, id));
    res.json({ success: true, id });
  } catch (error: any) {
    console.error('Error deleting contact:', error);
    res.status(500).json({ error: 'Failed to delete contact' });
  }
});

// Database Live Status API
app.get('/api/database/status', async (req, res) => {
  try {
    const [pList, sList, cList, dpList, purList, expList, uList, audList] = await Promise.all([
      db.select().from(schema.products),
      db.select().from(schema.sales),
      db.select().from(schema.contacts),
      db.select().from(schema.duePayments),
      db.select().from(schema.purchases),
      db.select().from(schema.expenses),
      db.select().from(schema.users),
      db.select().from(schema.auditLogs),
    ]);

    res.json({
      connected: true,
      engine: 'PostgreSQL 16 (Google Cloud SQL)',
      instanceName: 'ai-studio-31140d6c',
      projectId: 'possible-yew-c8gvj',
      region: 'asia-southeast1',
      status: 'Live & Operational',
      tables: {
        products: pList.length,
        sales: sList.length,
        contacts: cList.length,
        due_payments: dpList.length,
        purchases: purList.length,
        expenses: expList.length,
        users: Math.max(1, uList.length),
        audit_logs: audList.length,
      }
    });
  } catch (error: any) {
    console.error('Error getting DB status:', error);
    res.status(500).json({ error: 'Failed to get DB status' });
  }
});

// Settings API
app.get('/api/settings', async (req, res) => {
  try {
    const all = await db.select().from(schema.appSettings);
    const settingsMap: Record<string, any> = {};
    for (const row of all) {
      try {
        settingsMap[row.key] = JSON.parse(row.value);
      } catch {
        settingsMap[row.key] = row.value;
      }
    }
    res.json(settingsMap);
  } catch (error: any) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

app.post('/api/settings/:key', async (req, res) => {
  try {
    const { key } = req.params;
    const { value } = req.body;
    const serialized = typeof value === 'string' ? value : JSON.stringify(value);

    await db.insert(schema.appSettings)
      .values({
        key,
        value: serialized,
      })
      .onConflictDoUpdate({
        target: schema.appSettings.key,
        set: {
          value: serialized,
        }
      });

    res.json({ success: true });
  } catch (error: any) {
    console.error('Error saving setting:', error);
    res.status(500).json({ error: 'Failed to save setting' });
  }
});

// Vite Middleware for Full-stack Dev
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Tamanna Motors server listening on port ${PORT}`);
  });
}

startServer();
