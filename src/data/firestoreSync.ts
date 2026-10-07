import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  getDocs, 
  onSnapshot 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Product, Sale, Contact, Expense, Purchase, AuthUser } from '../types';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errMessage = error instanceof Error ? error.message : String(error);
  console.error(`[Firestore ${operationType}] Error at ${path}:`, errMessage);
}

export const FirestoreSync = {
  // Sync Product
  async upsertProduct(product: Product) {
    try {
      const docRef = doc(db, 'products', product.id);
      await setDoc(docRef, product, { merge: true });
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `products/${product.id}`);
    }
  },

  async deleteProduct(productId: string) {
    try {
      const docRef = doc(db, 'products', productId);
      await deleteDoc(docRef);
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `products/${productId}`);
    }
  },

  async fetchProducts(): Promise<Product[]> {
    try {
      const snap = await getDocs(collection(db, 'products'));
      const list: Product[] = [];
      snap.forEach(d => list.push(d.data() as Product));
      return list;
    } catch (e) {
      handleFirestoreError(e, OperationType.LIST, 'products');
      return [];
    }
  },

  // Sync Sale
  async upsertSale(sale: Sale) {
    try {
      const docRef = doc(db, 'sales', sale.id);
      await setDoc(docRef, sale, { merge: true });
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `sales/${sale.id}`);
    }
  },

  async deleteSale(saleId: string) {
    try {
      const docRef = doc(db, 'sales', saleId);
      await deleteDoc(docRef);
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `sales/${saleId}`);
    }
  },

  async fetchSales(): Promise<Sale[]> {
    try {
      const snap = await getDocs(collection(db, 'sales'));
      const list: Sale[] = [];
      snap.forEach(d => list.push(d.data() as Sale));
      return list;
    } catch (e) {
      handleFirestoreError(e, OperationType.LIST, 'sales');
      return [];
    }
  },

  // Sync Contact
  async upsertContact(contact: Contact) {
    try {
      const docRef = doc(db, 'contacts', contact.id);
      await setDoc(docRef, contact, { merge: true });
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `contacts/${contact.id}`);
    }
  },

  async deleteContact(contactId: string) {
    try {
      const docRef = doc(db, 'contacts', contactId);
      await deleteDoc(docRef);
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `contacts/${contactId}`);
    }
  },

  async fetchContacts(): Promise<Contact[]> {
    try {
      const snap = await getDocs(collection(db, 'contacts'));
      const list: Contact[] = [];
      snap.forEach(d => list.push(d.data() as Contact));
      return list;
    } catch (e) {
      handleFirestoreError(e, OperationType.LIST, 'contacts');
      return [];
    }
  },

  // Sync Purchase
  async upsertPurchase(purchase: Purchase) {
    try {
      const docRef = doc(db, 'purchases', purchase.id);
      await setDoc(docRef, purchase, { merge: true });
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `purchases/${purchase.id}`);
    }
  },

  async deletePurchase(purchaseId: string) {
    try {
      const docRef = doc(db, 'purchases', purchaseId);
      await deleteDoc(docRef);
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `purchases/${purchaseId}`);
    }
  },

  async fetchPurchases(): Promise<Purchase[]> {
    try {
      const snap = await getDocs(collection(db, 'purchases'));
      const list: Purchase[] = [];
      snap.forEach(d => list.push(d.data() as Purchase));
      return list;
    } catch (e) {
      handleFirestoreError(e, OperationType.LIST, 'purchases');
      return [];
    }
  },

  // Sync Expense
  async upsertExpense(expense: Expense) {
    try {
      const docRef = doc(db, 'expenses', expense.id);
      await setDoc(docRef, expense, { merge: true });
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `expenses/${expense.id}`);
    }
  },

  async deleteExpense(expenseId: string) {
    try {
      const docRef = doc(db, 'expenses', expenseId);
      await deleteDoc(docRef);
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `expenses/${expenseId}`);
    }
  },

  async fetchExpenses(): Promise<Expense[]> {
    try {
      const snap = await getDocs(collection(db, 'expenses'));
      const list: Expense[] = [];
      snap.forEach(d => list.push(d.data() as Expense));
      return list;
    } catch (e) {
      handleFirestoreError(e, OperationType.LIST, 'expenses');
      return [];
    }
  },

  // Clear Collection helper for Super Admin Reset
  async clearCollection(collName: 'products' | 'sales' | 'contacts' | 'purchases' | 'expenses') {
    try {
      const snap = await getDocs(collection(db, collName));
      const promises: Promise<void>[] = [];
      snap.forEach(d => promises.push(deleteDoc(doc(db, collName, d.id))));
      await Promise.all(promises);
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, collName);
    }
  },

  // Sync User
  async upsertUser(user: AuthUser) {
    try {
      const docRef = doc(db, 'users', user.id);
      await setDoc(docRef, user, { merge: true });
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `users/${user.id}`);
    }
  },

  async deleteUser(userId: string) {
    try {
      const docRef = doc(db, 'users', userId);
      await deleteDoc(docRef);
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `users/${userId}`);
    }
  },

  async fetchUsers(): Promise<AuthUser[]> {
    try {
      const snap = await getDocs(collection(db, 'users'));
      const list: AuthUser[] = [];
      snap.forEach(d => list.push(d.data() as AuthUser));
      return list;
    } catch (e) {
      handleFirestoreError(e, OperationType.LIST, 'users');
      return [];
    }
  },

  // Real-time listener subscriber
  subscribeProducts(callback: (products: Product[]) => void) {
    return onSnapshot(collection(db, 'products'), (snap) => {
      const list: Product[] = [];
      snap.forEach(d => list.push(d.data() as Product));
      callback(list);
    }, (e) => handleFirestoreError(e, OperationType.GET, 'products'));
  },

  subscribeSales(callback: (sales: Sale[]) => void) {
    return onSnapshot(collection(db, 'sales'), (snap) => {
      const list: Sale[] = [];
      snap.forEach(d => list.push(d.data() as Sale));
      callback(list);
    }, (e) => handleFirestoreError(e, OperationType.GET, 'sales'));
  },

  subscribeContacts(callback: (contacts: Contact[]) => void) {
    return onSnapshot(collection(db, 'contacts'), (snap) => {
      const list: Contact[] = [];
      snap.forEach(d => list.push(d.data() as Contact));
      callback(list);
    }, (e) => handleFirestoreError(e, OperationType.GET, 'contacts'));
  },

  subscribeUsers(callback: (users: AuthUser[]) => void) {
    return onSnapshot(collection(db, 'users'), (snap) => {
      const list: AuthUser[] = [];
      snap.forEach(d => list.push(d.data() as AuthUser));
      callback(list);
    }, (e) => handleFirestoreError(e, OperationType.GET, 'users'));
  }
};
